;(function(window,document) {

  var isIOS = (/iPad|iPhone|iPod|iPhone Simulator|iPad Simulator/.test(navigator.userAgent) && !window.MSStream),
      isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
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
  //player and expose most utilities, helping to encapsualte what is required for a few players to co-exist.
  function Player(el, options, startWith) {
    var iframeHolder = window.parent.document.getElementById(options.name + '-holder');

    if (!el || !isset(options) || !isset(options.data) || options.data.length <= 0) {
      window.parent.postMessage({event: 'tvp_solo_click:no_data',}, '*');
      return;
    } else {
      iframeHolder.style.display = 'block';
    }

    this.isFullScreen = false;
    this.initialResize = true;
    this.autoplay = isset(options.autoplay) ? Number(options.autoplay) : false;
    this.autonext = isset(options.autonext) ? Number(options.autonext) : true;
    this.version = isset(options.player_version) ? options.player_version : null;
    this.progressColor = isset(options.progressColor) ? options.progressColor : null;
    this.transcript = isset(options.transcript) ? options.transcript : null;
    this.removeControls = isset(options.removeControls) ? options.removeControls : null;
    this.analytics = isset(options.analytics) ? options.analytics : null;
    this.overlay = isset(options.overlay) ? options.overlay : false;
    this.overlayColor = isset(options.overlayColor) ? options.overlayColor : null;
    this.overlayOpacity = isMobile ? 1 : (isset(options.overlayOpacity) ? options.overlayOpacity : '0.5');
    this.playButtonBackgroundColor = isset(options.playButtonBackgroundColor) ? options.playButtonBackgroundColor : 'fff';
    this.playButtonBorderRadius = isset(options.playButtonBorderRadius) ? options.playButtonBorderRadius : '0';
    this.playButtonBorderWidth = isset(options.playButtonBorderWidth) ? options.playButtonBorderWidth : '0';
    this.playButtonBorderColor = isset(options.playButtonBorderColor) ? options.playButtonBorderColor : '000';
    this.playButtonIconColor = isset(options.playButtonIconColor) ? options.playButtonIconColor : '000';
    this.playButtonWidth = isset(options.playButtonWidth) ? options.playButtonWidth : '55px';
    this.playButtonHeight = isset(options.playButtonHeight) ? options.playButtonHeight : '55px';
    
    this.playText = isset(options.playText) ? options.playText : 'Watch Video';
    this.playTextSize = isset(options.playTextSize) ? options.playTextSize : '12px';
    this.playTextColor = isset(options.playTextColor) ? options.playTextColor : '000';
    this.playTextFontFamily = isset(options.playTextFontFamily) ? options.playTextFontFamily : 'Helvetica';
    this.instance = null;
    this.el = 'string' === typeof el ? document.getElementById(el) : el;

    this.assets = (function(data){
      var assets = [];
      for (var i = 0; i < data.length; i++) {
        var video = data[i];
        
        if (isEmpty(video)) break;

        var asset = video.asset;
        asset.assetId = video.id;
        asset.assetTitle = video.title;
        asset.loginId = video.loginId;
        asset.transcripts = isset(video.transcripts) ? video.transcripts : '';

        if (isset(video,'events') && video.events.length) {
          asset.analyticsLogUrl = video.analytics;
          asset.analyticsObj = video.events[1].data;
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
      }
      return assets;
    }(options.data));
    

    //Context reference for Methods.
    var that = this;
    
    //Sometimes we want/need to show an intearctive overlay on top of the player. We need this for MP4 videos that will
    //cue (mobile or autoplay:off) to actual play the video on demand.
    this.addOverlay = function(imgUrl){

      var overlay = document.createElement('div');
      overlay.classList.add('tvp-overlay');
      overlay.style.backgroundImage = 'url("' + imgUrl + '")';
      var overlayColor = this.overlayColor ? '#' + this.overlayColor : 'transparent';
      overlay.innerHTML = '<div class="tvp-overlay-cover" style="opacity:' + this.overlayOpacity + ';background-image:linear-gradient(to bottom right,'+overlayColor+','+overlayColor+');"></div>'+
      '<div class="tvp-play-holder" style="height:'+this.playButtonHeight+';"><svg class="tvp-play" style="width:'+this.playButtonWidth+';height:'+this.playButtonHeight+';background-color:#'+this.playButtonBackgroundColor+';border:'+this.playButtonBorderWidth+' solid #'+this.playButtonBorderColor+';border-radius:'+this.playButtonBorderRadius+
      '%;" viewBox="0 0 200 200"><polygon fill="#'+this.playButtonIconColor+'" points="70, 55 70, 145 145, 100"></polygon></svg><div class="tvp-play-text" style="font-family:'+this.playTextFontFamily+';font-size:'+this.playTextSize+';color:#'+this.playTextColor+'">' +this.playText + '</span></div>';

      var click = function(){
        if (!that.instance) return;
        this.removeEventListener('click',click,false);
        this.parentNode.removeChild(this);
        that.instance.play();
      };

      overlay.addEventListener('click', click);
      this.el.appendChild(overlay);
    };

    this.play = function(asset,ongoing){
      if (!asset) return;
      var willCue = false;
          
      
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
        config.logUrl = asset.analyticsLogUrl;
        analytics.initConfig(config);
      } else {
        config.logUrl = '//api.tvpage.com/v1/__tvpa.gif';
        analytics.initConfig(config);
      }
      
      if (willCue) {
        this.instance.cueVideo(asset);
        if ('mp4' === asset.type || this.overlay) {
          this.addOverlay(asset.thumbnailUrl);
        }
      } else {
       this.instance.loadVideo(asset);
      }
    };

    this.resize = function(){
      if (!that.instance || that.isFullScreen) return;
      var width, height;
      
      if (arguments.length && arguments[0] && arguments[1]) {
        width = arguments[0];
        height = arguments[1];
      } else {
        var parentEl = that.el.parentNode;
        width = parentEl.clientWidth;
        height = parentEl.clientHeight;
      }

      that.instance.resize(width, height);
      
      if(!this.onResize) return;
      this.onResize(that.initialResize, [width, height]);
      
      that.initialResize = false;
    };

    this.onReady = function(e, pl){
        that.instance = pl;
        that.resize();

        //We don't want to resize the player here on fullscreen... we need the player be.
        if (isset(window,'BigScreen')) {
            BigScreen.onchange = function(){
                that.isFullScreen = !that.isFullScreen;
            };
        }

        //We can't resize using local references when we are inside an iframe on iOS, the iframe's size doesn't update.
        //Alternative is to receive external size from host.
        if (window.location !== window.parent.location && isIOS){
            var onHolderResize = function (e) {
                if (!e || !isset(e, 'data') || 'tvp_solo_click:holder_resize' !== (e.data.event || '')) return;
                var size = e.data.size || [];
                that.resize(size[0], size[1]);
            };
            window.removeEventListener('message', onHolderResize, false);
            window.addEventListener('message', onHolderResize, false);
        } else {
            var onWindowResize = debounce(that.resize,50);
            window.removeEventListener('resize', onWindowResize, false);
            window.addEventListener('resize', onWindowResize);
        }

        that.el.querySelector('.tvp-progress-bar').style.backgroundColor = that.progressColor;

        var current = 0;
        for (var i = 0; i < that.assets.length; i++) {
            if (that.assets[i].assetId === (startWith || '') ) {
                current = i;
            }
        }
        that.current = current;
        that.play(that.assets[that.current]);
    };

    that.onStateChange = function(e){
        if ('tvp:media:videoended' !== e) return;

        that.current++;
        if (!that.assets[that.current]) {
            that.current = 0;
        }

        that.play(that.assets[that.current], true);
    };

    var checks = 0;
    (function libsReady() {
      setTimeout(function() {
        if ( (!isset(window,'TVPage') || !isset(window,'_tvpa')) && (++checks < 50) ) {
          libsReady();
        } else {
          that.player = new TVPage.player({
            techOrder: 'html5,flash',
            analytics: { tvpa: that.analytics },
            apiBaseUrl: '//api.tvpage.com/v1',
            apiTranscript: '//api.tvpage.com/v1/videos/transcript',
            swf: '//appcdn.tvpage.com/player/assets/tvp/tvp-'+that.version+'-flash.swf',
            onReady: that.onReady,
            onStateChange: that.onStateChange,
            divId: that.el.id,
            controls: {
              active: true,
              floater: {
                removeControls: that.removeControls,
                transcript: that.transcript
              }
            }
          });

        }
      },150);
    })();
    
  }

  window.Player = Player;

}(window, document));