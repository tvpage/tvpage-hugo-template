(function () {

  //The player singleton. A small layer on top of tvpage library
  function Player(options, globalConfig) {
    if(!globalConfig || !Utils.isObject(globalConfig))
      throw new Error('bad global config');

    if(!options || !Utils.isObject(globalConfig) || !Utils.hasKey(options, 'selector') || !options.selector)
      throw 'need selector';
    
    var selector = options.selector;
    var el;

    if(Utils.isString(selector)){
      el = Utils.getById(selector);

      if(!el)
        throw 'element not in dom';
    }
    else if(!selector || !Utils.inDom(selector)){
      throw 'element not in dom';
    }else{
      el = selector;
    }

    this.config = globalConfig;
    this.options = options;
    this.el = el;
    this.assets = [];
    this.initialResize = true;
    this.startWith = this.options.startWith || null;
    this.currentIndex = null;
  };

  Player.prototype.getOption = function (s) {
    return Utils.isUndefined(this.config[s]) ? null : this.config[s];
  }

  Player.prototype.getCallableOption = function (s) {
    return Utils.isFunction(this.options[s]) ? this.options[s] : null;
  }

  Player.prototype.getPlayButtonOptions = function () {
    return Utils.compact({
      height: this.getOption('play_button_height'),
      width: this.getOption('play_button_width'),
      backgroundColor: this.getOption('play_button_background_color'),
      borderRadius: this.getOption('play_button_border_radius'),
      borderWidth: this.getOption('play_button_border_width'),
      borderColor: this.getOption('play_button_border_color'),
      borderStyle: this.getOption('play_button_border_style'),
      iconColor: this.getOption('play_button_icon_color')
    });
  };

  Player.prototype.setControlsOptions = function () {
    this.controls = Utils.compact({
      active: true,
      seekBar: Utils.compact({
        progressColor: this.getOption('progress_color')
      }),
      floater: Utils.compact({
        controlbarColor: this.getOption('control_bar_color'),
        iconColor: this.getOption('icon_color'),
        removeControls: this.getOption('remove_controls')
      }),
      playbutton: this.getPlayButtonOptions(),
      overlayColor: this.getOption('overlay_color'),
      overlayOpacity: this.getOption('overlay_opacity')
    });
  };

  Player.prototype.setAdvertisingOptions = function () {
    if (!this.options.advertising || Utils.isEmpty(this.options.advertising))
      return;

    var options = this.options.advertising;

    this.advertising = Utils.compact({
      enabled: !!options.enabled,
      adServerUrl: options.adserverurl || null,
      adTimeout: options.adtimeout || "2000",
      maxAds: options.maxads || "100",
      adInterval: !Utils.isUndefined(options.adinterval) ? String(options.adinterval) : "0"
    });
  };

  Player.prototype.shallCue = function (auto) {
    return Utils.isMobile || (auto && !this.autonext) || !this.autoplay;
  };

  Player.prototype.play = function (asset, ongoing) {
    if ('string' === typeof asset) {
      var targetAsset = this.getAssetById(asset);
      asset = targetAsset.asset;
      this.currentIndex = targetAsset.index;
    } else {
      this.currentIndex = this.assets.indexOf(asset);
    }

    if(!this.instance)
      return;

    //if the browsers is not capable of video autoplay
    //turn on the policy change chrome://flags/#autoplay-policy
    if (this.shallCue(ongoing)) {
      this.instance.cueVideo(asset);
    } else {
      this.instance.loadVideo(asset);
    }
  };

  Player.prototype.controlBarZindex = function () {
    var controlBar = this.el.querySelector("#ControlBarFloater");
    if (controlBar && controlBar.parentNode) {
      controlBar.parentNode.style.zIndex = "9999";
    }
  };

  Player.prototype.getParentSize = function (param) {
    var el = this.el.parentNode;
    var size = null;

    if ('width' === param) {
      size = el.offsetWidth;
    } else if ('height' === param) {
      size = el.offsetHeight;
    }
    return size;
  };

  Player.prototype.resize = function () {
    if (!this.getParentSize)
      return;

    var width = arguments[0] || this.getParentSize('width');
    var height = arguments[1] || this.getParentSize('height');

    var isFullScreen = document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement

    if (this.instance && !isFullScreen) {
      this.instance.resize(width, height);
    }

    this.initialResize = false;

    if (this.onResize)
      this.onResize(this.initialResize, [width, height]);
  };

  Player.prototype.handleWindowResize = function () {
    var that = this,
      onResize = function () {
        setTimeout(function () {
          that.resize.call(that);
        }, 0);
      };

    window.removeEventListener('resize', onResize, false);
    window.addEventListener('resize', onResize, false);
  };

  Player.prototype.handleClick = function () {
    var defaultStop = this.options.clickDefaultStop;
    var optOnClick = this.options.onClick;
    var onClick = Utils.isFunction(optOnClick) ? optOnClick : function (e) {
      if (defaultStop) {
        Utils.stopEvent(e);
      }
    };

    this.el.removeEventListener('click', onClick, false);
    this.el.addEventListener('click', onClick, false);
  };

  Player.prototype.analyticsConfig = function () {
    var config = this.config;
    var options = this.options;
    var loginId = config.loginId;

    var analyticsConfig = {
      domain: location.hostname || '',
      logUrl: config.api_base_url + '/__tvpa.gif',
      li: loginId
    };

    if (config.firstPartyCookies && config.cookieDomain)
      analyticsConfig.firstPartyCookieDomain = config.cookieDomain;

    Utils.globalPoll(['_tvpa'], function () {
      _tvpa.push(['config', analyticsConfig]);

      if (options.ciTrack) {
        _tvpa.push(['track', 'ci', {
          li: loginId
        }]);
      }
    });
  };

  Player.prototype.getCurrentAsset = function () {
    return this.assets[this.currentIndex];
  };

  Player.prototype.getAssetById = function (id) {
    var assets = this.assets;
    var assetsLength = assets.length;
    var i;

    for (i = 0; i < assetsLength; i++) {
      if (assets[i].assetId == id) {
        return {
          index: i,
          asset: assets[i]
        };
      }
    }
  };

  Player.prototype.onReady = function (e, pl) {
    if (this.onReadyCalled) {
      this.resize.call(this);
    } else {
      this.resize.call(this);

      this.analyticsConfig();
      this.controlBarZindex();
      this.handleWindowResize();
      this.handleClick();

      if (this.onPlayerReady) {
        this.onPlayerReady(this);
      }
    }
  };

  Player.prototype.handleVideoEnded = function () {
    this.currentIndex++;

    if (!this.assets[this.currentIndex]) {
      this.currentIndex = 0;
    }

    var next = this.assets[this.currentIndex];

    this.play(next, true);

    if (this.onNext) {
      this.onNext(next);
    }
  };

  Player.prototype.onStateChange = function (e) {
    if ('tvp:media:videoended' === e) {
      this.handleVideoEnded();
    }

    if (this.onChange) {
      var currentAsset = this.getCurrentAsset() || {};
      currentAsset.currentTime = this.instance.getCurrentTime();

      this.onChange(e);
    }
  };

  Player.prototype.getConfig = function () {
    return Utils.compact({
      sharing: this.sharing,
      techOrder: this.getOption('tech_order'),
      mediaProviders: this.getOption('media_providers'),
      analytics: {
        tvpa: this.getOption('analytics')
      },
      apiBaseUrl: this.getOption('api_base_url'),
      swf: this.flashUrl,
      divId: this.el.id,
      controls: this.controls,
      version: this.version,
      advertising: this.advertising,
      preload: this.getOption('preload'),
      poster: this.getOption('poster'),
      overlay: this.getOption('overlay')
    });
  }

  Player.prototype.startPlayer = function () {
    var config = this.getConfig();
    var that = this;

    Utils.globalPoll(['TVPage'], function () {
      config.onReady = function (e, pl) {
        that.onReady(e, pl);
        that.onReadyCalled = true;

        //this is not right, if we need to expose a player then we us ethe instance
        that.config.player = that.player;
      };

      config.onStateChange = function (e) {
        that.onStateChange(e);
      };

      that.player = new TVPage.player(config);

      var globalRunId = that.player.options.globalRunId;

      that.instance = TVPage.instances[globalRunId];

      var index = 0;
      var asset = that.assets[index];

      if (that.startWith) {
        var assetResp = that.getAssetById(that.startWith);

        index = assetResp.index;
        asset = assetResp.asset;
      }

      that.currentIndex = index;

      that.play(asset);
    });
  };

  Player.prototype.getChannelId = function () {
    var id = 0;
    var opts = this.options;

    if (opts.channel) {
      id = opts.channel.id;
    } else if (opts.channelId) {
      id = opts.channelId;
    } else if (opts.channelid) {
      id = opts.channelid;
    }

    return id;
  };

  Player.prototype.buildAsset = function (obj) {
    if (Utils.isEmpty(obj))
      return {};

    var asset = obj.asset;

    asset.assetId = obj.id;
    asset.assetTitle = obj.title;
    asset.assetTitleTextEncoded = obj.titleTextEncoded;
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

  Player.prototype.addAssets = function (objs) {
    objs = objs || [];

    var objsLength = objs.length;
    var i;
    var obj;

    for (i = 0; i < objsLength; i++) {
      obj = objs[i];

      if (!this.getAssetById(obj.id)) {
        this.assets.push(this.buildAsset(obj));
      }
    }
  };

  Player.prototype.setConfig = function () {
    this.version = this.getOption('player_version');
    this.flashUrl = '//cdnjs.tvpage.com/tvplayer/tvp-' + this.version + '.swf';
    this.autoplay = this.getOption('autoplay');
    this.autonext = this.getOption('autonext');
    this.sharing = this.getOption('sharing');
    this.onChange = this.getCallableOption('onChange');
    this.onResize = this.getCallableOption('onResize');
    this.onNext = this.getCallableOption('onNext');
    this.onPlayerReady = this.getCallableOption('onPlayerReady');
    this.onClick = this.getCallableOption('onClick');
  };

  Player.prototype.initialize = function () {
    this.setControlsOptions();
    this.setAdvertisingOptions();
    this.setConfig();
    
    var data = this.options.data;

    if(Array.isArray(data) && data.length){
      this.addAssets(data);
      this.startPlayer();
    }
  };

  window.Player = Player;
}())
