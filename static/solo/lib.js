//The solo js library.
;(function(doc, parentGlob, parentDoc) {

  var random = function(){
    return 'tvp_' + Math.floor(Math.random() * 50005);
  },
  redefine = function(o,p){
    return 'undefined' !== typeof o[p]
  },
  assety = function(vid){
    if (!vid || !vid.asset) return;
    var a = vid.asset;
    a.analyticsObj = { vd: vid.id, li: vid.loginId, pg: vid.parentId ? vid.parentId : 0 };
    if (!a.sources) a.sources = [{ file: a.videoId }];
    a.type = a.type || 'youtube';
    return a;
  },
  debounce = function(func,wait,immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },
  jsonpCall = function(opts,callback){
    var s = doc.createElement('script');
    s.src = opts.src;
    if (!callback || 'function' !== typeof callback) return;
    window[opts.cbName || 'callback'] = callback;
    var b = opts.body || doc.body;
    b.appendChild(s);
  };

  //The player singleton. We basically create an instance from the tvpage
  //player and expose most utilities, helping to encapsualte what is
  //required for a few players to co-exist.
  function Player(el, assets, settings) {
    if (!el) return console.log('you need an existent DOM element');
    this.el = el;
    this.instance = null;
    this.willCue = null;

    //Context reference.
    var that = this;
    this.showPlayBtn = function(imgUrl){
      var frag = document.createDocumentFragment(),
      d = doc.createElement('div');
      
      d.classList.add('tvp-mp4-poster');
      d.style.backgroundImage = 'url("'+imgUrl+'")';
      frag.appendChild(d);

      var pBtn = this.el.parentNode.getElementsByClassName('tvp-play')[0];
      
      console.log('button')

      pBtn.style.display = 'block';
      pBtn.onclick = function(){
        if (!that.instance) return;
        d.style.display = 'none';
        pBtn.style.display = 'none';
        that.instance.play();
      };
      frag.appendChild(pBtn);
      this.el.appendChild(frag);
    };
    this.play = function(a){
      if (!a) return console.log('need asset');
      
      //Unles we change this we always take the first videos from
      //the playlist to startup.
      //if ((/Mobi/.test(navigator.userAgent)) ) {
        this.willCue = true;
        if ('mp4' === a.type) this.showPlayBtn(a.thumbnailUrl);
      //}
      
      if (this.willCue) {
        this.instance.cueVideo(a)
      } else {
       this.instance.loadVideo(a);
     }
    };
    
    var checks = 0;
    (function libsReady() {
      setTimeout(function() {
        if ( !redefine(window,'TVPage') || !redefine(window,'_tvpa') ) {
          (++checks < 20) ? libsReady() : console.log('limit reached');
        } else {

          _tvpa.push(['config', {li: settings.loginid,
            gaDomain: 'www.tvpage.tv',
            logUrl: '\/\/api.tvpage.com\/v1\/__tvpa.gif'
          }]);
          _tvpa.push(['track', 'ci', {li:settings.loginid}]);

          //We create insntances on the tvpage player.
          new TVPage.player({
            poster: true,
            techOrder: 'html5,flash',
            analytics: { tvpa: settings.tvpa || false },
            apiBaseUrl: '//app.tvpage.com',
            swf: '//d2kmhr1caomykv.cloudfront.net/player/assets/tvp/tvp-'+settings.version+'-flash.swf',
            onReady: function(e, pl){
              that.instance = pl;
              that.el.querySelector('.tvp-progress-bar').style.backgroundColor = settings.progresscolor;
              
              var resize = debounce(function() {
                that.instance.resize(that.el.clientWidth, that.el.clientHeight);
              }, 180);
              resize();
              window.addEventListener('resize', resize);
            
              that.current = 0;
              that.play(assets[that.current]);
            },
            onStateChange: function(e){
              if ('tvp:media:videoended' === e){
                that.current++;
                if (!assets[that.current]) {
                  that.current = 0;
                }
                console.log("JAJAJA"), assets[that.current];
                that.play(assets[that.current]);  
              }
            },
            divId: that.el.id,
            controls: {
              active: true,
              floater: { removeControls: settings.removecontrols,transcript: settings.transcript}
            }
          });

        }
      },300);
    })();
    
  }

  //Get the base fragment.
  var getBaseFrag = function(hash,css){
    var frag = document.createDocumentFragment(),
    main = doc.createElement('div');
    main.classList.add('tvp-player');
    
    var styles = '.tvp-player{position:absolute;top:0;bottom:0;left:0;right:0;width:100%;height:100%;}'+
      '.tvp-player-el{background-color:black;position:absolute;top:0;bottom:0;left:0;right:0;width:100%;height:100%;}'+
      '.tvp-mp4-poster{background-repeat:no-repeat;background-position:center;background-size:cover;background-color:#000;position:absolute;top:0;bottom:0;left:0;right:0;width:100%;height:100%;z-index:100}'+
      '.tvp-play{background-color:#fff;box-sizing:border-box;width:45px;height:45px;padding:0;position:absolute;top:0;left:0;bottom:0;right:0;margin:auto;display:none;opacity:.95;cursor:pointer;border-radius:1px;border:2px solid #e57211;z-index:1000}';
    main.innerHTML =  '<style id="tvphost">'+(css ? styles : '')+'</style><div id="tvp-player-el-'+hash+'" class="tvp-player-el"></div>'+
    '<svg class="tvp-play" viewBox="0 0 200 200" alt="Play video">'+
    '<polygon points="70, 55 70, 145 145, 100" fill="#e57211">'+
    '</polygon></svg></div>';
    frag.appendChild(main);
    return frag;
  }

  

  //We need to know a few things before we can start a player. We need to know if we will render
  //this here or somehow the will be content (when used with iframe).
  function initialize(){

    var body = doc.body,
        runTime = parent.__TVPage__;

    //We deal diff with some stuff on iframe.
    if (window.frameElement) {
      
      if (body.classList.contains('dynamic')) {
        var ifrId = body.getAttribute('data-id');
        
        if (!redefine(runTime.config, ifrId)) return console.log('need settings');
        settings = runTime.config[ifrId];

        var callbackName = random();
        body.appendChild(getBaseFrag(callbackName, false));

        (function(cb){
          var channel = settings.channel,
              params = channel.parameters,
              url = '//api.tvpage.com/v1/channels/' + channel.id + '/videos?X-login-id=' + settings.loginid;
          
          for (var p in params) { url += '&' + p + '=' + params[p];}
          url += '&callback='+cb;

          jsonpCall({
            src: url,
            cbName: cb
          }, function(data){
            if(!data || !data.length) return console.log('no assets');

            var dataCount = data.length;
            while (dataCount > 0) {
              var i = dataCount - 1;
              data[i] = assety(data[i]);
              dataCount--;
            }

            new Player(doc.getElementById('tvp-player-el-'+cb),data,settings);
          });
        }(callbackName));
      }

    } else if (redefine(runTime,'inline') && runTime.inline.length) {

      var inline = runTime.inline,
          inlineCount = inline.length;

      while (inlineCount > 0) {
        var id = inline[inlineCount-1];
        settings = runTime.config[id];

        var callbackName = random();

        var holder = doc.getElementById(id+'-holder');
        holder.appendChild(getBaseFrag(callbackName, !doc.getElementById('tvphost')));
        
        (function(cb){
          var channel = settings.channel,
              params = channel.parameters,
              url = '//api.tvpage.com/v1/channels/' + channel.id + '/videos?X-login-id=' + settings.loginid;
          
          for (var p in params) { url += '&' + p + '=' + params[p];}
          url += '&callback='+cb;

          jsonpCall({
            src: url,
            cbName: cb
          }, function(data){
            if (!data || !data.length) return console.log('no assets');
            
            var dataCount = data.length;
            while (dataCount > 0) {
              var i = dataCount - 1;
              data[i] = assety(data[i]);
              dataCount--;
            }

            new Player(doc.getElementById('tvp-player-el-'+cb), data, settings);
          });
        }(callbackName));
        
        inline.pop();
        inlineCount--;
      }
    }

  };

  initialize();

}(document, parent, parent.document));