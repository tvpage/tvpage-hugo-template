(function() {

  var userAgent = navigator.userAgent;
  var iOS = /iPad|iPhone|iPod|iPhone Simulator|iPad Simulator/.test(userAgent) && !window.MSStream;
  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  var isEmpty = function(o) {
    for (var key in o) {
      if (o.hasOwnProperty(key)) return false;
    }
    return true;
  };
  var isFunction = function(o) {
    return 'function' === typeof o;
  };
  var isUndefined = function(o) {
    return 'undefined' === typeof o;
  };
  var compact = function(o) {
    for (var k in o) {
      if (o.hasOwnProperty(k) && !o[k])
        delete o[k];
    }
    return o;
  };
  var optionsCheck = function(o){
    if (!o || !o.data || o.data.length <= 0) {
      throw new Error('missing options');
    }
  };
  var getElement = function(el){
    if(!el) {
      throw new Error('missing el');
    }
    
    return 'string' === typeof el ? document.getElementById(el) : el;
  };

  //The player singleton. A small layer on top of tvpage library
  var Player = function(el, options, startWith) {
    optionsCheck(options);

    this.options = options;
    this.el = getElement(el);
    this.eventPrefix = ("tvp_" + this.options.id).replace(/-/g, '_');
    this.assets = [];
    this.instance = null;
    this.initialResize = true;
    this.startWith = startWith || null;
    this.isFullScreen = false;
  };

  Player.prototype.getPlayButtonOptions = function() {
    return compact({
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

  Player.prototype.setControlsOptions = function() {
    this.controls = compact({
      active: true,
      seekBar: compact({
        progressColor: this.getOption('progress_color')
      }),
      floater: compact({
        controlbarColor: this.getOption('control_bar_color'),
        iconColor: this.getOption('icon_color'),
        removeControls: this.getOption('remove_controls')
      }),
      playbutton: this.getPlayButtonOptions(),
      overlayColor: this.getOption('overlay_color'),
      overlayOpacity: this.getOption('overlay_opacity')
    });
  };

  Player.prototype.setAdvertisingOptions = function() {
    if (!this.options.advertising || isEmpty(this.options.advertising))
      return;

    var options = this.options.advertising;

    this.advertising = compact({
      enabled: !!options.enabled,
      adServerUrl: options.adServerUrl || null,
      adTimeout: options.adTimeout || "2000",
      maxAds: options.maxAds || "100",
      adInterval: !isUndefined(options.adInterval) ? String(options.adInterval) : "0"
    });
  };

  Player.prototype.shallCue = function(auto){
    return isMobile || (auto && !this.autonext) || !this.autoplay;
  };

  Player.prototype.play = function(asset, ongoing) {
    if(this.shallCue(ongoing)){
      this.instance.cueVideo(asset);
    } else {
      this.instance.loadVideo(asset);
    }
  };

  Player.prototype.controlBarZindex = function() {
    var controlBar = this.el.querySelector("#ControlBarFloater");
    if (controlBar && controlBar.parentNode) {
      controlBar.parentNode.style.zIndex = "9999";
    }
  };

  Player.prototype.getParentSize = function(param){
    var el = this.el.parentNode;
    var size = null;
    if('width' === param){
      size = el.offsetWidth;
    } else if('height' === param){
      size = el.offsetHeight;
    }
    return size;
  };

  Player.prototype.resize = function(){
    var width = arguments[0] || this.getParentSize('width');
    var height = arguments[1] || this.getParentSize('height');
    
    if (this.instance && !this.isFullScreen)
      this.instance.resize(width,height);

    this.initialResize = false;
    
    if (this.onResize)
      this.onResize(this.initialResize,[width,height]);
  };

  //We can't resize using local references when we are inside an iframe. Alternative is to receive external
  //size from host.
  Player.prototype.handleResize = function() {
    var that = this;
    if (window.location !== window.parent.location && iOS) {
      var onHolderResize = function(e) {
        if(!e || !e.data || !e.data.event || that.eventPrefix + ':holder_resize' !== e.data.event)
          return;
        
        var size = e.data.size || [];

        that.resize(size[0], size[1]);
      };

      window.removeEventListener('message', onHolderResize, false);
      window.addEventListener('message', onHolderResize, false);
    } else {
      var onResize = function(){
        that.resize();
      };
      
      window.removeEventListener('resize', onResize, false);
      window.addEventListener('resize', onResize, false);
    }
  };

  Player.prototype.analyticsConfig = function() {
    var analytics = new Analytics();
    var loginId = this.options.loginId || this.options.loginid;
  
    analytics.initConfig({
      domain: location.hostname || '',
      logUrl: this.options.api_base_url + '/__tvpa.gif',
      loginId: loginId,
      firstPartyCookies: this.options.firstpartycookies,
      cookieDomain: this.options.cookiedomain
    });
  
    if (this.options.ciTrack) {
      analytics.track('ci',{
        li: loginId
      });
    }
  };

  Player.prototype.getCurrentAsset = function() {
    var current = 0;
    var assets = this.assets;

    if (this.startWith) {
      for (var i = 0; i < assets.length; i++) {
        if (assets[i].assetId === this.startWith)
          current = i;
      }
    }

    this.current = current;

    return assets[this.current];
  };

  Player.prototype.onReady = function(e, pl) {
    this.instance = pl;
    this.resize.call(this);

    if (window.BigScreen) {
      var that = this;
      BigScreen.onchange = function(){
          that.isFullScreen = !that.isFullScreen;
      };
    }
    
    this.analyticsConfig();
    this.controlBarZindex();
    this.handleResize();

    if(this.onPlayerReady){
      this.onPlayerReady(this);
    }

    this.play(this.getCurrentAsset());
  };

  Player.prototype.notifyState = function(e){
    var stateData = JSON.parse(JSON.stringify(this.assets[this.current]));
    stateData.currentTime = this.instance.getCurrentTime();
    if (this.onPlayerChange && window.parent) {
      window.parent.postMessage({
        event: this.eventPrefix + ':on_player_change',
        e: e,
        stateData : stateData
      }, '*');
    }
  };

  Player.prototype.handleVideoEnded = function(){
    this.current++;
    if (!this.assets[this.current]) {
      this.current = 0;
    }

    var next = this.assets[this.current];
    
    this.play(next, true);
    if (this.onNext) {
      this.onNext(next);
    }
  };

  Player.prototype.onStateChange = function(e) {
    this.notifyState(e);
    
    if ('tvp:media:videoended' === e)
      this.handleVideoEnded();
  };

  Player.prototype.addExtraConfig = function(config){
    config = config || {};
    var extras = ["preload", "poster", "overlay"];
    for (var i = 0; i < extras.length; i++) {
      var option = extras[i];
      if (!isUndefined(this[option]) && this[option] !== null) {
        config[option] = this[option];
      }
    }
    return config;
  };

  Player.prototype.getConfig = function(){
    return compact({
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

  Player.prototype.startPlayer = function() {
    var depsChecks = 0;
    var that = this;
    (function depsReady() {
      setTimeout(function() {
        if (isUndefined(window.TVPage) || isUndefined(window._tvpa)) {
          (++depsChecks < 50) ? depsReady(): console.warn('can\'t load deps');
        } else {
          var config = that.getConfig();

          config.onReady = function(e, pl){
            that.onReady(e, pl);
          };

          config.onStateChange = function(e) {
            that.onStateChange(e);
          };

          that.player = new TVPage.player(config);
        }
      }, 150);
    })();
  };

  Player.prototype.getChannelId = function() {
    var id = 0;
    var opts = this.options;
    
    if(opts.channel){
      id = opts.channel.id;
    }else if(opts.channelId){
      id = opts.channelId;
    }else if(opts.channelid){
      id = opts.channelid;
    }

    return id;
  };

  Player.prototype.buildAsset = function(obj) {
    if (isEmpty(obj))
      return {};

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

  Player.prototype.addAssets = function(objs){
    if (objs && objs.length) {
      for (var i = 0; i < objs.length; i++) {
        this.assets.push(this.buildAsset(objs[i]));
      }
    }
  };

  Player.prototype.getOption = function(s){
    return isUndefined(this.options[s]) ? null : this.options[s];
  };

  Player.prototype.getCallable = function(s){
    return isFunction(this.options[s]) ? this.options[s] : null;
  };

  Player.prototype.setConfig = function(s){
    this.version = this.getOption('player_version');
    this.flashUrl = '//cdnjs.tvpage.com/tvplayer/tvp-' + this.version + '.swf';
    this.autoplay = this.getOption('autoplay');
    this.autonext = this.getOption('autonext');
    this.onPlayerChange = this.getOption('onPlayerChange');
    this.onResize = this.getCallable('onResize');
    this.onNext = this.getCallable('onNext');
    this.onPlayerReady = this.getCallable('onPlayerReady');
  };

  Player.prototype.initialize = function() {
    this.setControlsOptions();
    this.setAdvertisingOptions();
    this.setConfig();
    this.addAssets(this.options.data);
    this.startPlayer();
  };

  window.Player = Player;

}());