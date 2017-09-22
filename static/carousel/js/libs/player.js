(function() {
  
    var iOS = /iPad|iPhone|iPod|iPhone Simulator|iPad Simulator/.test(navigator.userAgent) && !window.MSStream;
    var isset = function(o, p) {
      var val = o;
      if (p) val = o[p];
      return 'undefined' !== typeof val;
    };
    var isEmpty = function(obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) return false;
      }
      return true;
    };
    var isFunction = function(obj) {
      return 'undefined' !== typeof obj;
    };
    var compact = function(o) {
      if (!o && "object" !== typeof o)
        return;
  
      for (var k in o) {
        if (!o[k])
          delete o[k];
      }
      return o;
    };
  
    //The player singleton. We basically create an instance from the tvpage
    //player and expose most utilities, helping to encapsualte what is required for a few players to co-exist.
    var Player = function(el, options, startWith) {
      if (!el || !isset(options) || !isset(options.data) || options.data.length <= 0)
        return console.warn('bad args');
  
      this.options = options;
      this.el = 'string' === typeof el ? document.getElementById(el) : el;
      this.startWith = startWith || null;
      this.instance = null;
      this.isFullScreen = false;
      this.initialResize = true;
      this.autoplay = !!this.options.autoplay;
      this.autonext = !!this.options.autonext;
      this.version = this.options.player_version || null;
      this.poster = this.options.poster || null;
      this.overlay = this.options.overlay || null;
      this.onResize = !!this.options.onResize && isFunction(this.options.onResize) ? this.options.onResize : null;
      this.onNext = !!this.options.onNext && isFunction(this.options.onNext) ? this.options.onNext : null;
  
      this.assets = (function(data) {
        var assets = [];
        for (var i = 0; i < data.length; i++) {
          var video = data[i];
          if (isEmpty(video))
            break;
  
          var asset = video.asset;
          asset.assetId = video.id;
          asset.assetTitle = video.title;
          asset.loginId = video.loginId;
  
          var channelId = isset(video, 'parentId') ? video.parentId : (isset(options, 'channel') ? options.channel.id : 0);
          if (!channelId && (options.channelId || options.channelid)) {
            channelId = options.channelId || options.channelid;
          }
  
          asset.analyticsObj = {
            pg: channelId,
            vd: video.id,
            li: video.loginId
          };
  
          if (!asset.sources) asset.sources = [{
            file: asset.videoId
          }];
          asset.type = asset.type || 'youtube';
          assets.push(asset);
        }
  
        return assets;
      }(options.data));
    }
  
    Player.prototype.setControlsOptions = function() {
      this.controls = compact({
        active: true,
        seekBar: compact({
          progressColor: this.options.progress_color || null
        }),
        floater: compact({
          controlbarColor: this.options.control_bar_color || null,
          iconColor: this.options.icon_color || null,
          removeControls: this.options.remove_controls || null
        }),
        playbutton: compact({
          height: this.options.play_button_height || null,
          width: this.options.play_button_width || null,
          backgroundColor: this.options.play_button_background_color || null,
          borderRadius: this.options.play_button_border_radius || null,
          borderWidth: this.options.play_button_border_width || null,
          borderColor: this.options.play_button_border_color || null,
          borderStyle: this.options.play_button_border_style || null,
          iconColor: this.options.play_button_icon_color || null
        }),
        overlayColor: this.options.overlay_color || null,
        overlayOpacity: this.options.overlay_opacity || null
      });
    };
  
    Player.prototype.setAdvertisingOptions = function() {
      if (!this.options.advertising || isEmpty(this.options.advertising))
        return;
  
      var adOptions = this.options.advertising;
  
      this.advertising = compact({
        enabled: !!adOptions.enabled,
        adServerUrl: adOptions.adServerUrl || null,
        adTimeout: adOptions.adTimeout || "2000",
        maxAds: adOptions.maxAds || "100",
        adInterval: isset(adOptions.adInterval) ? String(adOptions.adInterval) : "0"
      });
    };
  
    Player.prototype.getOption = function(name) {
      if (this.options.hasOwnProperty(name))
        return this.options.hasOwnProperty(name);
      return null;
    }
  
    Player.prototype.play = function(asset, ongoing) {
      if (!asset) return console.warn('need asset');
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
  
      if (willCue) {
        this.instance.cueVideo(asset);
      } else {
        this.instance.loadVideo(asset);
      }
    };
  
    Player.prototype.resize = function() {
      if (!this.instance || this.isFullScreen)
        return;
      
      var width,
          height;
      
      if (arguments.length > 1 && arguments[0] && arguments[1]) {
        width = arguments[0];
        height = arguments[1];
      } else {
        var parentEl = this.el.parentNode;
        width = parentEl.offsetWidth;
        height = parentEl.offsetHeight;
      }

      this.instance.resize(width, height);
      this.initialResize = false;
      
      if (this.onResize)
        this.onResize(this.initialResize, [width, height]);
    }

    Player.prototype.startPlayer = function() {
      var that = this;

      var onReady = function(e, pl) {
        that.instance = pl;
        that.resize.call(that);

        //Fix required to let popups be displayed on top of plauer overlay.
        var controlBar = that.el.querySelector("#ControlBarFloater");
        if (controlBar && controlBar.parentNode) {
          controlBar.parentNode.style.zIndex = "9999";
        }

        //We don't want to resize the player here on fullscreen... we need the player be.
        if (isset(window, 'BigScreen')) {
          BigScreen.onchange = function() {
            if (!iOS) {
              that.isFullScreen = !that.isFullScreen;
            }
          };
        }

        //We can't resize using local references when we are inside an iframe. Alternative is to receive external
        //size from host.
        if (window.location !== window.parent.location && iOS) {
          var onHolderResize = function(e) {
            if (!e || !isset(e, 'data') || !isset(e.data, 'event') || 'tvp_' + that.options.id.replace(/-/g, '_') + ':modal_holder_resize' !== e.data.event)
              return;
            
            var size = e.data.size || [];
            that.resize(size[0], size[1]);
          };
          window.removeEventListener('message', onHolderResize, false);
          window.addEventListener('message', onHolderResize, false);
        } else {
          var onWindowResize = that.resize;
          window.removeEventListener('message', onWindowResize, false);
          window.addEventListener('resize', onWindowResize, false);
        }

        var current = 0;
        if (that.startWith) {
          for (var i = 0; i < that.assets.length; i++) {
            if (that.assets[i].assetId === that.startWith)
              current = i;
          }
        }

        that.current = current;

        that.play(that.assets[that.current]);
      };
      
      var playerOptions = {
        techOrder: this.options.tech_order || null,
        mediaProviders: this.options.media_providers || null,
        analytics: {
          tvpa: this.options.analytics || null
        },
        apiBaseUrl: this.options.api_base_url || null,
        swf: '//cdnjs.tvpage.com/tvplayer/tvp-' + this.version + '.swf',
        onReady: onReady,
        onStateChange: function(e) {
          if ('tvp:media:videoended' !== e)
            return;

          this.current++;
          if (!this.assets[this.current]) {
            this.current = 0;
          }

          var next = this.assets[this.current];
          this.play(next, true);
          if (this.onNext) {
            this.onNext(next);
          }
        },
        divId: this.el.id,
        controls: this.controls,
        version: this.version,
        advertising: this.advertising,
        preload: this.options.preload || null
      };

      var extras = ["preload", "poster", "overlay"];
      for (var i = 0; i < extras.length; i++) {
        var option = extras[i];
        if (this[option] !== null) {
          playerOptions[option] = this[option];
        }
      }

      this.player = new TVPage.player(playerOptions);
    };
  
    Player.prototype.initialize = function() {
      this.setControlsOptions();
      this.setAdvertisingOptions();
  
      var that = this;
      var checks = 0;
      
      (function libsReady() {
        setTimeout(function() {
          if (!isset(window, 'TVPage') || !isset(window, '_tvpa')) {
            (++checks < 50) ? libsReady(): console.warn('limit reached');
          } else {
            that.startPlayer.call(that);
          }
        }, 150);
      })();
    };
  
    window.Player = Player;
  
  }());