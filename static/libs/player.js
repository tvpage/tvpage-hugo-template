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
    if ('object' === typeof o) {
      for (var k in o) {
        if (o.hasOwnProperty(k) && !o[k])
          delete o[k];
      }
    }
    return o;
  };

  //The player singleton. A small layer on top of tvpage library
  var Player = function(el, options, startWith) {
    if (!el || !options || !options.data || options.data.length <= 0)
      return;

    var getOption = function(s){
      return isUndefined(options[s]) ? null : options[s];
    };
    var getCallable = function(s){
      return isFunction(options[s]) ? null : options[s];
    };

    this.getCallable = 
    this.options = options;
    this.el = 'string' === typeof el ? document.getElementById(el) : el;
    this.eventPrefix = ("tvp_" + this.options.id).replace(/-/g, '_');
    this.assets = [];
    this.instance = null;
    this.initialResize = true;
    this.startWith = startWith || null;
    this.apiBaseUrl = getOption('api_base_url');
    this.techOrder = getOption('tech_order');
    this.mediaProviders = getOption('media_providers');
    this.version = getOption('player_version');
    this.preload = getOption('preload');
    this.poster = getOption('poster');
    this.overlay = getOption('overlay');
    this.analytics = {
      tvpa: getOption('analytics')
    };
    this.flashUrl = '//cdnjs.tvpage.com/tvplayer/tvp-' + this.version + '.swf';
    this.autoplay = getOption('autoplay');
    this.autonext = getOption('autonext');
    this.onPlayerChange = getOption('onPlayerChange');
    this.onResize = getCallable('onResize');
    this.onNext = getCallable('onNext');
    this.onPlayerReady = getCallable('onPlayerReady');
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

    var options = this.options.advertising;

    this.advertising = compact({
      enabled: !!options.enabled,
      adServerUrl: options.adServerUrl || null,
      adTimeout: options.adTimeout || "2000",
      maxAds: options.maxAds || "100",
      adInterval: !isUndefined(options.adInterval) ? String(options.adInterval) : "0"
    });
  };

  Player.prototype.play = function(asset, ongoing) {
    if (asset) {
      var willCue = false;
      if( (ongoing && (isMobile || !this.autonext)) || (isMobile || !this.autoplay) )
        willCue = true;

      if(willCue){
        this.instance.cueVideo(asset);
      }else{
        this.instance.loadVideo(asset);
      }
    }
  };

  Player.prototype.controlBarZindex = function() {
    var controlBar = this.el.querySelector("#ControlBarFloater");
    if (controlBar && controlBar.parentNode) {
      controlBar.parentNode.style.zIndex = "9999";
    }
  };

  Player.prototype.resize = function() {
    if (!this.instance)
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
    
    this.analyticsConfig();
    this.controlBarZindex();
    this.handleResize();
    if(this.onPlayerReady){
      this.onPlayerReady(this);
    }

    this.play(this.getCurrentAsset());
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

  Player.prototype.getConfig = function(){
    var that = this;
    return compact({
      techOrder: this.techOrder,
      mediaProviders: this.mediaProviders,
      analytics: this.analytics,
      apiBaseUrl: this.apiBaseUrl,
      swf: this.flashUrl,
      divId: this.el.id,
      controls: this.controls,
      version: this.version,
      advertising: this.advertising,
      preload: this.preload,
      poster: this.poster,
      overlay: this.overlay,
      onReady: function(e, pl){
        that.onReady(e, pl);
      },
      onStateChange: function(e) {
        that.onStateChange(e);
      },
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
          that.player = new TVPage.player(that.getConfig());
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

  Player.prototype.initialize = function() {
    this.setControlsOptions();
    this.setAdvertisingOptions();
    this.addAssets(this.options.data);
    this.startPlayer();
  };

  window.Player = Player;

}());