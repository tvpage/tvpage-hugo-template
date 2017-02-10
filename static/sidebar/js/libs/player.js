;(function(root,doc) {

  var isFullScreen = false,
      isset = function(o,p){
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

  //The player singleton. We basically create an instance from the tvpage
  //player and expose most utilities, helping to encapsualte what is
  //required for a few players to co-exist.
  function Player(el, options, startWith) {
    if (!el || !isset(options) || !isset(options.data) || options.data.length <= 0) return console.log('bad args');

    this.autoplay = isset(options.autoplay) ? options.autoplay : false;
    this.autonext = isset(options.autonext) ? options.autonext : true;
    this.version = isset(options.version) ? options.version : '1.8.5';
    this.progresscolor = isset(options.progresscolor) ? options.progresscolor : '#E57211';
    this.transcript = isset(options.transcript) ? options.transcript : false;
    this.removecontrols = isset(options.removecontrols) ? options.removecontrols : ["hd"];
    this.analytics = isset(options.analytics) ? options.analytics : true;
    
    this.instance = null;
    this.el = 'string' === typeof el ? doc.getElementById(el) : el;

    this.assets = (function(data){
      var assets = [],
          counter = data.length;

      while (counter > 0) {
        var video = data[counter-1];
        if (isEmpty(video)) return console.log('empty data');
        
        var asset = video.asset,
            channelId;

        asset.uniqueId = video.id;
        asset.loginId = video.loginId;

        if (isset(video,'events') && video.events.length) {
          asset.analyticsLogUrl = video.analytics;
          asset.analyticsObj = video.events[1].data;
          console.log("OBJECT TO BE TRACKED (analyticsObj)", asset.analyticsObj);
        } else {
          asset.analyticsObj = { 
            pg: isset(video,'parentId') ? video.parentId : ( isset(options,'channel') ? options.channel.id : 0 ),
            vd: video.id, 
            li: video.loginId
          };
        }

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

    var that = this;
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
          isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (ongoing) {
        if (isMobile || (isset(this.autonext) && !this.autonext)) {
          willCue = true;
        }
      } else {
        if (isMobile || (isset(this.autoplay) && !this.autoplay)) {
          willCue = true;
        }
      }

      var analytics =  new Analytics(),
          config = {
            domain: isset(location,'hostname') ?  location.hostname : '',
            loginId: asset.loginId
          };
      
      //Update tvpa analytics configuration depending on the video type 
      //(exhange or standard)
      if (isset(asset,'analyticsLogUrl')) {
        console.log("ANALYTICS LOG URL", asset.analyticsLogUrl);
        config.logUrl = asset.analyticsLogUrl;
        analytics.initConfig(config);
      } else {
        config.logUrl = '\/\/api.tvpage.com\/v1\/__tvpa.gif';
        analytics.initConfig(config);
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

          //We create insntances on the tvpage player.
          new TVPage.player({
            poster: true,
            techOrder: 'html5,flash',
            analytics: { tvpa: that.analytics },
            apiBaseUrl: '//api.tvpage.com/v1',
            swf: '//appcdn.tvpage.com/player/assets/tvp/tvp-'+that.version+'-flash.swf',
            onReady: function(e, pl){
              that.instance = pl;
              
              var resize = debounce(function() {
                if (pl && !isFullScreen) {
                  that.instance.resize(that.el.parentNode.clientWidth, that.el.parentNode.clientHeight);
                }
               }, 180);
              resize();
              
              if (root.location != root.parent.location){
                root.addEventListener('message', function(e){
                  if (!e || !isset(e, 'data') || !isset(e.data, 'event')) return;
                  if ('_tvp_widget_holder_resize' === e.data.event && isset(e.data, 'size')) {
                    var size = e.data.size;
                    that.instance.resize(size[0], size[1]);
                  }
                });
              } else {
                root.addEventListener('resize', resize);
              }

              that.el.querySelector('.tvp-progress-bar').style.backgroundColor = that.progresscolor;
              var current = 0;
              if (startWith && startWith.length) {
                for (var i = 0; i < that.assets.length; i++) {
                  if (that.assets[i].uniqueId === startWith) current = i;
                }
              }

              that.current = current;
              that.play(that.assets[that.current]);
              if (root.DEBUG) {
                console.debug("endTime = " + performance.now());
              }
              
              if (!isset(root,'BigScreen')) return;
              BigScreen.onchange = function(){
                isFullScreen = !isFullScreen;
              };
            },
            onStateChange: function(e){
              if ('tvp:media:videoended' !== e) return;
              
              if(isset(that.autonext) && that.autonext){
                that.current++;
                if (!that.assets[that.current]) {
                  that.current = 0;
                }
              }

              that.play(that.assets[that.current], true);
            },
            divId: that.el.id,
            controls: {
              active: true,
              floater: { removeControls: that.removecontrols,transcript: that.transcript}
            }
          });

        }
      },300);
    })();
    
  }

  root.Player = Player;

}(window, document));