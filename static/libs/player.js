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
    if ('object' === typeof o) {
      for (var k in o) {
        if (o.hasOwnProperty(k) && !o[k])
          delete o[k];
      }
    }
    return o;
  };

  //The player singleton. We basically create an instance from the tvpage
  //player and expose most utilities, helping to encapsualte what is required for a few players to co-exist.
  var Player = function(el, options, startWith) {
    if (!el || !options || !options.data || options.data.length <= 0)
      return;

    this.options = options;
    this.el = 'string' === typeof el ? document.getElementById(el) : el;
    this.eventPrefix = ("tvp_" + this.options.id).replace(/-/g, '_');
    this.startWith = startWith || null;
    this.instance = null;
    this.isFullScreen = false;
    this.initialResize = true;
    this.autoplay = !!this.options.autoplay;
    this.autonext = !!this.options.autonext;
    this.version = this.options.player_version || null;
    this.onResize = isFunction(this.options.onResize) ? this.options.onResize : null;
    this.onNext = isFunction(this.options.onNext) ? this.options.onNext : null;
    this.onPlayerChange = !!this.options.onPlayerChange;
  };

  Player.prototype.getPlayButtonOptions = function() {
    return compact({
      height: this.options.play_button_height || null,
      width: this.options.play_button_width || null,
      backgroundColor: this.options.play_button_background_color || null,
      borderRadius: this.options.play_button_border_radius || null,
      borderWidth: this.options.play_button_border_width || null,
      borderColor: this.options.play_button_border_color || null,
      borderStyle: this.options.play_button_border_style || null,
      iconColor: this.options.play_button_icon_color || null
    });
  };

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
      playbutton: this.getPlayButtonOptions(),
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
    
    var parentEl = this.el.parentNode;
    var hasArgs = arguments.length > 1;
    var width = hasArgs ? arguments[0] : parentEl.offsetWidth;
    var height = hasArgs ? arguments[1] : parentEl.offsetHeight;

    this.instance.resize(width, height);
    this.initialResize = false;
    
    if (this.onResize)
      this.onResize(this.initialResize,[width,height]);
  };

  Player.prototype.controlBarZindex = function() {
    var controlBar = this.el.querySelector("#ControlBarFloater");
    if (controlBar && controlBar.parentNode) {
      controlBar.parentNode.style.zIndex = "9999";
    }
  };

  //We don't want to resize the player here on fullscreen... we need the player be.
  Player.prototype.handleFullScreen = function() {
    if(window.BigScreen){
      BigScreen.onchange = function() {
        if (!iOS) {
          that.isFullScreen = !that.isFullScreen;
        }
      };
    }
  };

  //We can't resize using local references when we are inside an iframe. Alternative is to receive external
  //size from host.
  Player.prototype.handleResize = function() {
    var that = this;
    if (window.location !== window.parent.location && iOS) {
      var onHolderResize = function(e) {
        if (!e || !isset(e, 'data') || !isset(e.data, 'event') || that.eventPrefix + ':modal_holder_resize' !== e.data.event)
          return;
        
        var size = e.data.size || [];
        that.resize(size[0], size[1]);
      };
      window.removeEventListener('message', onHolderResize, false);
      window.addEventListener('message', onHolderResize, false);
    } else {
      window.removeEventListener('message', this.resize, false);
      window.addEventListener('resize', this.resize, false);
    }
  };

  Player.prototype.onReady = function(e, pl) {
    this.instance = pl;
    this.resize.call(this);

    this.controlBarZindex();
    this.handleFullScreen();
    this.handleResize();

    var current = 0;
    var assets = this.assets;
    if (this.startWith) {
      for (var i = 0; i < assets.length; i++) {
        if (assets[i].assetId === this.startWith)
          current = i;
      }
    }

    this.current = current;
    this.play(assets[this.current]);
  };

  Player.prototype.onStateChange = function(e) {
    var current = this.current;
    var stateData = JSON.parse(JSON.stringify(this.assets[current]));

    stateData.currentTime = this.instance.getCurrentTime();

    if (this.onPlayerChange && window.parent) {
      window.parent.postMessage({
        event: this.eventPrefix + ':on_player_change',
        e: e,
        stateData : stateData
      }, '*');
    }
    
    if ('tvp:media:videoended' === e) {
      this.current++;
      if (!this.assets[this.current]) {
        this.current = 0;
      }

      var next = this.assets[this.current];
      this.play(next, true);
      if (this.onNext) {
        this.onNext(next);
      }
    }
  };

  Player.prototype.startPlayer = function() {
    var that = this;
    var options = {
      techOrder: this.options.tech_order || null,
      mediaProviders: this.options.media_providers || null,
      analytics: {
        tvpa: this.options.analytics || null
      },
      apiBaseUrl: this.options.api_base_url || null,
      swf: '//cdnjs.tvpage.com/tvplayer/tvp-' + this.version + '.swf',
      onReady: function(e, pl){
        that.onReady(e, pl);
      },
      onStateChange: function(e) {
        that.onStateChange(e);
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
        options[option] = this[option];
      }
    }

    this.player = new TVPage.player(options);
  };

  Player.prototype.getChannelId = function() {
    var channelId = 0;
    var opts = this.options;
    
    if(opts.channel){
      channelId = opts.channel.id;
    }else if(opts.channelId){
      channelId = opts.channelId;
    }else if(opts.channelid){
      channelId = opts.channelid;
    }

    return channelId;
  };

  Player.prototype.buildAsset = function(obj) {
    if (isEmpty(obj))
      return;

    var asset = obj.asset;
    asset.assetId = obj.id;
    asset.assetTitle = obj.title;
    asset.loginId = obj.loginId;
    asset.type = asset.type || 'youtube';
    asset.analyticsObj = {
      pg: obj.parentId || this.getChannelId(),
      vd: asset.assetId,
      li: asset.loginId
    };
    asset.sources = asset.sources || [{
      file: asset.videoId
    }];

    return asset;
  };

  Player.prototype.initialize = function() {
    this.setControlsOptions();
    this.setAdvertisingOptions();
    
    this.assets = [];
    var data = this.options.data;
    for (var i = 0; i < data.length; i++) {
      this.assets.push(this.buildAsset(data[i]));
    }

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