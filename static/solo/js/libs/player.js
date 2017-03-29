;(function(window,document) {

  var isIOS = (/iPad|iPhone|iPod|iPhone Simulator|iPad Simulator/.test(navigator.userAgent) && !window.MSStream),
      isset = function(o,p){
        var val = o;
        if (p) val = o[p];
        return 'undefined' !== typeof val;
      },
      isEmpty = function(obj) {
        for(var key in obj) { if (obj.hasOwnProperty(key)) return false;}
        return true;
      };

  //The player singleton. We basically create an instance from the tvpage
  //player and expose most utilities, helping to encapsualte what is required for a few players to co-exist.
  function Player(el, options, startWith) {
    if (!el || !isset(options) || !isset(options.data) || options.data.length <= 0) return;

    this.isFullScreen = false;
    this.initialResize = true;
    this.autoplay = isset(options.autoplay) ? Number(options.autoplay) : false;
    this.autonext = isset(options.autonext) ? Number(options.autonext) : true;
    this.version = isset(options.player_version) ? options.player_version : null;
    this.progressColor = isset(options.progress_color) ? options.progress_color : null;
    this.transcript = isset(options.transcript) ? options.transcript : null;
    this.removeControls = isset(options.remove_controls) ? options.remove_controls : null;
    this.analytics = isset(options.analytics) ? options.analytics : null;
    this.overlay = isset(options.overlay) ? options.overlay : null;
    this.instance = null;
    this.el = 'string' === typeof el ? document.getElementById(el) : el;
    this.onNext = isset(options.onNext) && "function" === typeof options.onNext ? options.onNext : null;
    this.onPlayerReady = isset(options.onPlayerReady) && "function" === typeof options.onPlayerReady ? options.onPlayerReady : null;
    this.onFullscreenChange = isset(options.onFullscreenChange) && "function" === typeof options.onFullscreenChange ? options.onFullscreenChange : null;


    //Context reference for Methods.
    var that = this;
<<<<<<< HEAD
=======
    
    this.getOption = function (name) {
      if (this.options.hasOwnProperty(name))
        return this.options.hasOwnProperty(name);
      return null;
    };
>>>>>>> 373ce5bd9943458921ce1044df1dc78636a30d41

    this.createAsset = function(obj){
        if (!obj || "object" !== typeof obj || isEmpty(obj) || !isset(obj,'asset')) return;

        var asset = obj.asset;
        asset.assetId = obj.id;
        asset.assetTitle = obj.title;
        asset.loginId = obj.loginId;

        if (isset(obj,'events') && obj.events.length) {
            asset.analyticsLogUrl = obj.analytics;
            asset.analyticsObj = obj.events[1].data;
        } else {
            asset.analyticsObj = {
                pg: isset(obj,'parentId') ? obj.parentId : ( isset(options,'channel') ? options.channel.id : 0 ),
                vd: obj.id,
                li: obj.loginId
            };
        }

        if (!asset.sources) asset.sources = [{ file: asset.videoId }];
        asset.type = asset.type || 'youtube';

        return asset;
    };

    this.assets = (function(data){
      var assets = [];
      for (var i = 0; i < data.length; i++) {
        var video = data[i];
        if (isEmpty(video)) break;
        assets.push(that.createAsset(video));
      }
      return assets;
    }(options.data));
    
    //Sometimes we want/need to show an intearctive overlay on top of the player. We need this for MP4 videos that will
    //cue (mobile or autoplay:off) to actual play the video on demand.
    this.addOverlay = function(asset){
        var overlay = document.createElement('div');
        overlay.className = 'tvp-overlay';
        overlay.style.backgroundImage = 'url("' + asset.thumbnailUrl + '")';
        overlay.innerHTML = '<div class="tvp-overlay-cover"></div><svg class="tvp-play" viewBox="0 0 200 200">' +
        '<polygon points="70, 55 70, 145 145, 100"></polygon></svg>';

        var click = function(){
            var clear = function () {
                this.removeEventListener('click',click,false);
                this.parentNode.removeChild(this);
            };
            clear.call(this);
            if (that.instance) {
                that.instance.play();
            }
        };

        var existing = this.el.querySelector('.tvp-overlay');
        if (existing) {
            existing.removeEventListener('click', click, false);
            existing.parentNode.removeChild(existing);
        }

        overlay.removeEventListener('click', click, false);
        overlay.addEventListener('click', click, false);
        this.el.appendChild(overlay);
    };

    this.play = function(asset,ongoing,initial){
      if (!asset) return;
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
        config.logUrl = asset.analyticsLogUrl;
        analytics.initConfig(config);
      } else {
        config.logUrl = '//api.tvpage.com/v1/__tvpa.gif';
        analytics.initConfig(config);
      }

      if (!initial) {
        this.current = this.getCurrentIndex(asset.assetId);
      }

      if (willCue) {
        this.instance.cueVideo(asset);
        if ('mp4' === asset.type || this.overlay) {
          this.addOverlay(asset);
        }
      } else {
       this.instance.loadVideo(asset);
      }
    };

    this.addData = function(data){
        if (!data || !data.length) return;
        var newAssets = [];
        for (var i = 0; i < data.length; i++) {
            newAssets.push(this.createAsset(data[i]));
        }

        this.assets = this.assets.concat(newAssets);
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
      
      if (this.onResize) {
        this.onResize(that.initialResize, [width, height]);
      }
      
      that.initialResize = false;
    };

    this.getCurrentIndex = function(id){
      var current = 0;
      for (var i = 0; i < this.assets.length; i++) {
        if (this.assets[i].assetId === (id || '') ) {
          current = i;
        }
      }
      return current;
    };

    this.onReady = function(e, pl){
        that.instance = pl;
        that.resize();

        //We don't want to resize the player here on fullscreen... we need the player be.
        if (isset(window,'BigScreen')) {
            BigScreen.onchange = function(){
                that.isFullScreen = !that.isFullScreen;
<<<<<<< HEAD
                if (that.onFullscreenChange()) {
=======
                if (that.onFullscreenChange) {
>>>>>>> 373ce5bd9943458921ce1044df1dc78636a30d41
                  that.onFullscreenChange();
                }
            };
        }

        //We can't resize using local references when we are inside an iframe on iOS, the iframe's size doesn't update.
        //Alternative is to receive external size from host.
        if (window.location !== window.parent.location && isIOS){
            var onHolderResize = function (e) {
                if (!e || !isset(e, 'data') || (("tvp_" + options.id).replace(/-/g,'_') + ':holder_resize') !== (e.data.event || '')) return;
                var size = e.data.size || [];
                that.resize(size[0], size[1]);
            };

            window.removeEventListener('message', onHolderResize, false);
            window.addEventListener('message', onHolderResize, false);
        } else {
            window.removeEventListener('resize', that.resize, false);
            window.addEventListener('resize', that.resize,false);
        }

        that.el.querySelector('.tvp-progress-bar').style.backgroundColor = that.progressColor;

        that.current = that.getCurrentIndex(startWith);
        that.play(that.assets[that.current],null,true);
<<<<<<< HEAD
        that.onPlayerReady();
=======
        if (that.onPlayerReady) {
          that.onPlayerReady();
        }
>>>>>>> 373ce5bd9943458921ce1044df1dc78636a30d41
    };

    that.onStateChange = function(e){
        if ('tvp:media:videoended' === e) {
            that.current++;
            if (!that.assets[that.current]) {
                that.current = 0;
            }
<<<<<<< HEAD

            that.play(that.assets[that.current], true);
        }

        if ('tvp:media:videoplaying' === e && that.onNext){
            that.onNext(that.assets[that.current]);
        }

=======

            that.play(that.assets[that.current], true);
        }

        if ('tvp:media:videoplaying' === e && that.onNext){
            that.onNext(that.assets[that.current]);
        }

>>>>>>> 373ce5bd9943458921ce1044df1dc78636a30d41
        if ('tvp:media:videoplaying' === e) {
          var existing = that.el.querySelector('.tvp-overlay');
          if (existing) {
            existing.parentNode.removeChild(existing);
          }
        }
    };

    var checks = 0;
    (function libsReady() {
      setTimeout(function() {
        if ( (!isset(window,'TVPage') || !isset(window,'_tvpa')) && (++checks < 50) ) {
          libsReady();
        } else {
          
          var playerOptions = {
            techOrder: 'html5,flash',
            analytics: { tvpa: that.analytics },
            apiBaseUrl: '//api.tvpage.com/v1',
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
          };

          var i;
          var allowOverride = {
            techOrder: 1,
            analytics: 1,
            apiBaseUrl: 1,
            swf: 1,
            controls: 1,
            width: 1,
            height: 1,
            mediaProviders: 1,
            preload: 1
          };
          for (i in that.options) {
            if ( !playerOptions.hasOwnProperty(i) || allowOverride.hasOwnProperty(i) ) {
              playerOptions[i] = that.options[i];
            }
          }

          that.player = new TVPage.player(playerOptions);

        }
      },150);
    })();
    
  }

  window.Player = Player;

}(window, document));