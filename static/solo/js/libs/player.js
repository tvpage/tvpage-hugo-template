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
      },
      compact = function(o){
        if (!o && "object" !== typeof o) return;
        for (var k in o) {
          if (!o[k]) {
            delete o[k];
          }
        }
        return o;
      },
      hostName = isset(location,'hostname') ?  location.hostname : '';

  //The player singleton. We basically create an instance from the tvpage
  //player and expose most utilities, helping to encapsualte what is required for a few players to co-exist.
  function Player(el, options, startWith) {
    if (!el || !isset(options) || !isset(options.data) || options.data.length <= 0) return;

    this.options = options;
    this.instance = null;
    this.el = 'string' === typeof el ? document.getElementById(el) : el;

    this.isFullScreen = false;
    this.initialResize = true;

    this.autoplay = isset(options.autoplay) ? Number(options.autoplay) : false;
    this.autonext = isset(options.autonext) ? Number(options.autonext) : true;
    this.version = isset(options.player_version) ? options.player_version : null;

    this.removeControls = isset(options.remove_controls) ? options.remove_controls : null;
    this.techOrder = isset(options.tech_order) ? options.tech_order : null;
    this.analytics = isset(options.analytics) ? options.analytics : null;
    this.apiBaseUrl = isset(options.api_base_url) ? options.api_base_url : null;
    this.mediaProviders = isset(options.media_providers) ? options.media_providers : null;
    this.preload = isset(options.preload) ? options.preload : null;
    this.poster = isset(options.poster) ? options.poster : null;
    this.overlay = isset(options.overlay) ? options.overlay : null;

    this.playbutton = compact({
      height: isset(options.play_button_height) ? options.play_button_height : null,
      width: isset(options.play_button_width) ? options.play_button_width : null,
      backgroundColor: isset(options.play_button_background_color) ? options.play_button_background_color : null,
      borderRadius: isset(options.play_button_border_radius) ? options.play_button_border_radius : null,
      borderWidth: isset(options.play_button_border_width) ? options.play_button_border_width : null,
      borderColor: isset(options.play_button_border_color) ? options.play_button_border_color : null,
      borderStyle: isset(options.play_button_border_style) ? options.play_button_border_style : null,
      iconColor: isset(options.play_button_icon_color) ? options.play_button_icon_color : null
    });

    this.floater = compact({
     controlbarColor: isset(options.control_bar_color) ? options.control_bar_color : null,
     iconColor: isset(options.icon_color) ? options.icon_color : null,
     removeControls: isset(options.remove_controls) ? options.remove_controls : null
    });

    this.seekBar = compact({
     progressColor: isset(options.progress_color) ? options.progress_color : null
    });
    
    this.controls = compact({
      active: true,
      seekBar: this.seekBar,
      floater: this.floater,
      playbutton: this.playbutton,
      overlayColor: isset(options.overlay_color) ? options.overlay_color : null,
      overlayOpacity: isset(options.overlay_opacity) ? options.overlay_opacity : null
    });

    var advertisingOptions = isset(options.advertising) && "object" === typeof options.advertising && !isEmpty(options.advertising) ? options.advertising : {};

    this.advertising = compact({
      enabled: isset(advertisingOptions.enabled) ? advertisingOptions.enabled : false,
      adServerUrl: (advertisingOptions.adServerUrl || advertisingOptions.adserverurl) || null,
      adTimeout: (advertisingOptions.adTimeout || advertisingOptions.adtimeout) || "2000",
      maxAds: (advertisingOptions.maxAds || advertisingOptions.maxads) || "100",
      adInterval: (advertisingOptions.adInterval || advertisingOptions.adinterval) || "0"
    });

    this.onNext = isset(options.onNext) && "function" === typeof options.onNext ? options.onNext : null;
    this.onPlayerReady = isset(options.onPlayerReady) && "function" === typeof options.onPlayerReady ? options.onPlayerReady : null;
    this.onFullscreenChange = isset(options.onFullscreenChange) && "function" === typeof options.onFullscreenChange ? options.onFullscreenChange : null;

    //Context reference for Methods.
    var that = this;
    
    this.getOption = function (name) {
      if (this.options.hasOwnProperty(name))
        return this.options.hasOwnProperty(name);
      return null;
    };

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
          var channelId = isset(obj,'parentId') ? obj.parentId : ( isset(options,'channel') ? options.channel.id : 0 );
          if (!channelId && (options.channelId || options.channelid)) {
            channelId = options.channelId || options.channelid;
          }

          asset.analyticsObj = {
            pg: channelId,
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

    this.willCue = function(ongoing){
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

        return willCue;
    };

    this.play = function(asset,ongoing,initial){
      if (!asset) return;

      if (!initial) {
        this.current = this.getCurrentIndex(asset.assetId);
      }

      if (this.willCue(ongoing)) {
        this.instance.cueVideo(asset);
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
        that.analytics = new Analytics();
        
        var loginId = options.loginId || options.loginid;

        that.analytics.initConfig({
          domain: hostName,
          logUrl: that.apiBaseUrl + '/__tvpa.gif',
          loginId: loginId,
          firstPartyCookies: options.firstpartycookies,
          cookieDomain: options.cookiedomain
        });

        that.analytics.track('ci', {
          li: loginId
        });

        that.instance = pl;
        that.resize();

        //We don't want to resize the player here on fullscreen... we need the player be.
        if (isset(window,'BigScreen')) {
            BigScreen.onchange = function(){
                that.isFullScreen = !that.isFullScreen;
                that.resize();
                if (that.onFullscreenChange) {
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

        if (that.onPlayerReady) {
          that.onPlayerReady();
        }
    };

    that.onStateChange = function(e){
        if ('tvp:media:videoended' === e) {
            that.current++;
            if (!that.assets[that.current]) {
                that.current = 0;
            }

            that.play(that.assets[that.current], true);

            if ('function' === typeof that.onNext){
              that.onNext(that.assets[that.current]);
            }
        }

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
        if ( (!isset(window,'TVPage') || !isset(window,'_tvpa')) && (++checks < 200) ) {
          libsReady();
        } else {
          var playerOptions = {
            techOrder: that.techOrder,
            mediaProviders: that.mediaProviders,
            analytics: {
              tvpa: that.analytics
            },
            apiBaseUrl: that.apiBaseUrl,
            swf: '//cdnjs.tvpage.com/tvplayer/tvp-'+that.version+'.swf',
            onReady: that.onReady,
            onStateChange: that.onStateChange,
            divId: that.el.id,
            controls: that.controls,
            version: that.version,
            advertising:that.advertising,
            preload: that.preload
          };

          var extras = ["preload","poster","overlay"];
          for (var i = 0; i < extras.length; i++) {
            var option = extras[i];
            if (that[option] !== null) {
              playerOptions[option] = that[option];
            }
          }

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
            preload: 1,
            poster: 1,
            overlay: 1
          };
          for (var o in that.options) {
            if ( !playerOptions.hasOwnProperty(o) || allowOverride.hasOwnProperty(o) ) {
              playerOptions[o] = that.options[o];
            }
          }

					that.player = new TVPage.player(playerOptions);
					that.current = that.getCurrentIndex(startWith);
					if(that.willCue()){
						that.player.cueVideo(that.assets[that.current]);
					}else{
						that.player.loadVideo(that.assets[that.current]);
					}
        }
      },150);
    })();
    
  }

  window.Player = Player;

}(window, document));