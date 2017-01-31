//The solo js library.
;(function(root,doc) {

  //The player singleton. We basically create an instance from the tvpage
  //player and expose most utilities, helping to encapsualte what is
  //required for a few players to co-exist.
  function Player(el, options, startWith) {
    var isset = function(o,p){
      var val = o;
      if (p) val = o[p];
      return 'undefined' !== typeof val;
    },
    isEmpty = function(obj) {
      for(var key in obj) { if (obj.hasOwnProperty(key)) return false;}
      return true;
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
    };

    if (!el) return console.log('need element');
    if (!isset(options) || !isset(options.data) || options.data.length <= 0) return console.log('need aseets');

    this.el = 'string' === typeof el ? doc.getElementById(el) : el;
    this.instance = null;

    var that = this;
    this.assets = (function(data){
      var assets = [],
          counter = data.length;

      while (counter > 0) {
        var video = data[counter-1];
        if (isEmpty(video)) return console.log('empty data');
        
        var asset = video.asset,
            channelId;

        if(video.parentId){
          channelId = video.parentId
        }else{
          channelId = 'undefined' !== typeof options.channel ? options.channel.id : 0;
        }
        asset.uniqueId = video.id;
        asset.analyticsObj = { vd: video.id, li: video.loginId, pg: channelId };
        if (!asset.sources) asset.sources = [{ file: asset.videoId }];
        asset.type = asset.type || 'youtube';
        assets.push(asset);
        counter--;
      }

      return assets;
    }(options.data));
    

    //Methods
    this.hideEl = function(el){
      return el.style.display = 'none';
    };
    this.showPlayBtn = function(imgUrl){
      var frag = document.createDocumentFragment(),
          div = doc.createElement('div');

      div.classList.add('tvp-mp4-poster');
      div.style.backgroundImage = 'url("'+imgUrl+'")';
      frag.appendChild(div);

      var btn = this.el.parentNode.getElementsByClassName('tvp-play')[0];
      btn.style.display = 'block';
      btn.onclick = function(){
        if (!that.instance) return;
        that.hideEl(div);
        that.hideEl(btn);
        that.instance.play();
      };
      frag.appendChild(btn);
      this.el.appendChild(frag);
    };
    this.play = function(asset,ongoing){

      if (!asset) return console.log('need asset');
      
      var willCue = false,
          isMobile = /Mobi/.test(navigator.userAgent);
      
      if (ongoing) {
        if (isMobile || (isset(options.autonext) && !options.autonext)) {
          willCue = true;
        }
      } else {
        if (isMobile || (isset(options.autoplay) && !options.autoplay)) {
          willCue = true;
        }
      }
      
      if (willCue) {
        this.instance.cueVideo(asset)
        if ('mp4' === asset.type) {
          this.showPlayBtn(asset.thumbnailUrl);
        }
      } else {
       this.instance.loadVideo(asset);
      }
    };

    var checks = 0;
    (function libsReady() {
      setTimeout(function() {
        if ( !isset(root,'TVPage') || !isset(root,'_tvpa') ) {
          (++checks < 20) ? libsReady() : console.log('limit reached');
        } else {

          _tvpa.push(['config', {li: options.loginid,
            gaDomain: 'www.tvpage.tv',
            logUrl: '\/\/api.tvpage.com\/v1\/__tvpa.gif'
          }]);
          _tvpa.push(['track', 'ci', {li:options.loginid}]);

          //We create insntances on the tvpage player.
          new TVPage.player({
            poster: true,
            techOrder: 'html5,flash',
            analytics: { tvpa: options.tvpa || false },
            apiBaseUrl: '//api.tvpage.com/v1',
            swf: '//appcdn.tvpage.com/player/assets/tvp/tvp-'+options.version+'-flash.swf',
            onReady: function(e, pl){
              that.instance = pl;
              that.el.querySelector('.tvp-progress-bar').style.backgroundColor = options.progresscolor;
              
              var resize = debounce(function() {
                that.instance.resize(that.el.clientWidth, that.el.clientHeight);
              }, 180);
              resize();
              root.addEventListener('resize', resize);
            
              var currentIndex = 0;
              if (startWith && startWith.length) {
                for (var i = 0; i < that.assets.length; i++) {
                  if (that.assets[i].uniqueId === startWith) currentIndex = i;
                }
              }

              that.current = currentIndex;
              that.play(that.assets[that.current]);
              
              if (root.DEBUG) {
                console.debug("Interaction ready at: " + performance.now() + "ms");
              }
            },
            onStateChange: function(e){
              if ('tvp:media:videoended' === e){
                that.current++;
                
                if (!that.assets[that.current]) {
                  that.current = 0;
                }
                
                that.play(that.assets[that.current], true);
              }
            },
            divId: that.el.id,
            controls: {
              active: true,
              floater: { removeControls: options.removecontrols,transcript: options.transcript}
            }
          });

        }
      },300);
    })();
    
  }

  root.Player = Player;

}(window, document));