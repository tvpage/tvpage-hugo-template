(function(){

  var Utils = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isEmpty: function(o) {
      for (var key in o) {
        if (o.hasOwnProperty(key)) return false;
      }
      return true;
    },
    isUndefined: function(o) {
      return 'undefined' === typeof o;
    },
    compact: function(o) {
      for (var k in o) {
        if (o.hasOwnProperty(k) && !o[k])
          delete o[k];
      }
      return o;
    },
    optionsCheck: function(o){
      if (!o || !o.data || o.data.length <= 0) {
        throw new Error('need options');
      }
    },
    getElement: function(el){
      if(!el) {
        throw new Error('need el');
      }
      
      return 'string' === typeof el ? document.getElementById(el) : el;
    }
  };
  
  //The player singleton. A small layer on top of tvpage library
  function Player(el, options, startWith) {
    Utils.optionsCheck(options);
  
    this.options = options;
    this.el = Utils.getElement(el);
    this.eventPrefix = ("tvp_" + this.options.id).replace(/-/g, '_');
    this.assets = [];
    this.instance = null;
    this.initialResize = true;
    this.startWith = startWith || null;
    this.currentIndex = null;
    this.onReadyCalled = false;
  };
  
  Player.prototype.getPlayButtonOptions = function() {
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
  
  Player.prototype.setControlsOptions = function() {
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
  
  Player.prototype.setAdvertisingOptions = function() {
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
  
  Player.prototype.shallCue = function(auto){
    return Utils.isMobile || (auto && !this.autonext) || !this.autoplay;
  };
  
  Player.prototype.play = function(asset, ongoing) {
    if(this.options.debug){
      console.log('will play: ', asset);
    }

    if('string' === typeof asset){
      var targetAsset = this.getAssetById(asset);
      asset = targetAsset.asset;
      this.currentIndex = targetAsset.index;
    } else {
      this.currentIndex = this.assets.indexOf(asset);
    }

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
    if(!this.getParentSize)
      return;
  
    var width = arguments[0] || this.getParentSize('width');
    var height = arguments[1] || this.getParentSize('height');
    
    var isFullScreen = document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement

    if(this.instance && !isFullScreen){
      this.instance.resize(width,height);
    }
  
    this.initialResize = false;

    if (this.onResize)
      this.onResize(this.initialResize,[width,height]);
  };
  
  Player.prototype.handleResize = function() {
    var that = this,
        onResize = function(){
          setTimeout(function(){
            that.resize.call(that);
          },0);
        };
    
    window.removeEventListener('resize', onResize, false);
    window.addEventListener('resize', onResize, false);
  };

  Player.prototype.analyticsConfig = function() {
    var opts = this.options;
    var loginId = opts.loginId || opts.loginid;
    var config = {
      domain: location.hostname || '',
      logUrl: opts.api_base_url + '/__tvpa.gif',
      li: loginId
    };
  
    if (opts.firstPartyCookies && opts.cookieDomain)
      config.firstPartyCookieDomain = opts.cookieDomain;
  
    _tvpa.push(['config', config]);
  
    if(this.options.ciTrack){
      _tvpa.push(['track', 'ci', {
        li: loginId
      }]);
    }
  };

  Player.prototype.getCurrentAsset = function(){
    return this.assets[this.currentIndex];
  };
  
  Player.prototype.getAssetById = function(id){
    var assets = this.assets;
    var assetsLength = assets.length;
    var resp = {
      i:null,
      asset: null
    };

    for (var i = 0; i < assetsLength; i++) {
      if (assets[i].assetId === id){
        resp.index = i;
        resp.asset = assets[i];
      }
    }

    return resp;
  };

  Player.prototype.onReady = function(e, pl) {
    if(this.onReadyCalled){
      this.resize.call(this);
    }else{
      this.resize.call(this);
      
      this.analyticsConfig();
      this.controlBarZindex();
      this.handleResize();
  
      if(this.onPlayerReady){
        this.onPlayerReady(this);
      }
    }
  };

  Player.prototype.handleVideoEnded = function(){
    this.currentIndex++;

    if (!this.assets[this.currentIndex]) {
      this.currentIndex = 0;
    }

    var next = this.assets[this.currentIndex];

    this.play(next, true);

    if(this.onNext){
      this.onNext(next);
    }
  };
  
  Player.prototype.onStateChange = function(e) {
    if ('tvp:media:videoended' === e){
      this.handleVideoEnded();
    }

    if(this.onChange){
      var currentAsset = this.getCurrentAsset() || {};
      currentAsset.currentTime = this.instance.getCurrentTime();
      
      this.onChange(e);
    }
  };
  
  Player.prototype.addExtraConfig = function(config){
    config = config || {};
    var extras = ["preload", "poster", "overlay"];
    for (var i = 0; i < extras.length; i++) {
      var option = extras[i];
      if (!Utils.isUndefined(this[option]) && this[option] !== null) {
        config[option] = this[option];
      }
    }
    return config;
  };
  
  Player.prototype.getConfig = function(){
    return Utils.compact({
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
    var config = this.getConfig();
    var that = this;
    var depsCheck = 0;
    var deps = ['TVPage'];

    (function start() {
      setTimeout(function() {
        console.log('deps poll...');
        
        var ready = true;
        for (var i = 0; i < deps.length; i++)
          if ('undefined' === typeof window[deps[i]])
            ready = false;
  
        if(ready){

          config.onReady = function(e, pl){
            that.onReady(e, pl);
            that.onReadyCalled = true;
          };

          config.onStateChange = function(e) {
            that.onStateChange(e);
          };

          that.player = new TVPage.player(config);

          var globalRunId = that.player.options.globalRunId;

          that.instance = TVPage.instances[globalRunId];

          var index = 0;
          var asset = that.assets[index];
      
          if(that.startWith){
            var assetResp = that.getAssetById(that.startWith);

            index = assetResp.index;
            asset = assetResp.asset;
          }

          that.currentIndex = index;

          that.play(asset);
  
        }else if(++depsCheck < 1000){
          start()
        }
      },5);
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
    if (Utils.isEmpty(obj))
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
    return Utils.isUndefined(this.options[s]) ? null : this.options[s];
  };
  
  Player.prototype.getCallable = function(s){
    return 'function' === typeof this.options[s] ? this.options[s] : null;
  };
  
  Player.prototype.setConfig = function(s){
    this.version = this.getOption('player_version');
    this.flashUrl = '//cdnjs.tvpage.com/tvplayer/tvp-' + this.version + '.swf';
    this.autoplay = this.getOption('autoplay');
    this.autonext = this.getOption('autonext');
    this.onChange = this.getCallable('onChange');
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
}())