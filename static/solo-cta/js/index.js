(function() {
  var body = document.body,
      id = body.getAttribute('data-id'),
      config = window.parent.__TVPage__.config[id],
      eventPrefix = config.events.prefix,
      overlayEl,
      apiBaseUrl = config.api_base_url;

  function handleListeners(e){
    var props = {};

    if(e.type == 'resize') {
      props = {
        event: eventPrefix + ':widget_resize',
        height: Math.floor(overlayEl.getBoundingClientRect().height)
      };
    }else{
       props = {
        event: eventPrefix + ':widget_click',
        clicked: e.id
      };
    }
    Utils.sendMessage(props);
  }

  function renderCta(){
    var videos = config.channel.videos,
        firstVideo = videos[0];
    
    config.channel.firstVideo = firstVideo;

    overlayEl = Utils.getByClass('tvp-cta-overlay');
    var ctaText = Utils.getByClass('tvp-cta-text');

    overlayEl.style.backgroundImage = "url(" + firstVideo.asset.thumbnailUrl + ")";
    ctaText.innerHTML = firstVideo.title;

    handleListeners({type:'resize'});

    overlayEl.removeEventListener("click", handleListeners, false);
    overlayEl.addEventListener("click", handleListeners.bind(null,firstVideo), false);
    window.removeEventListener("resize", handleListeners, false);
    window.addEventListener("resize", handleListeners, false);
  }

  function initAnalytics(){
    var analytics = new Analytics(),
    analyticsConfig = {
      domain: location.hostname || '',
      logUrl: apiBaseUrl + '/__tvpa.gif',
      li: config.loginId
    };

    if (config.firstPartyCookies && config.cookieDomain)
    analyticsConfig.firstPartyCookieDomain = config.cookieDomain;
    analytics.initConfig(analyticsConfig);
    analytics.track('ci', {
      li: config.loginId
    });
  }

  function onLoadVideos(data){
    config.channel.videos = data;
  }

  function loadVideos(){
    var vidParams = {
      p: 0,
      n: 100,
      o: config.videos_order_by,
      od: config.videos_order_direction,
      'X-login-id': config.loginId
    };
    Utils.loadScript({
      base: config.api_base_url + '/channels/' + config.channelId + '/videos',
      params: vidParams
    }, onLoadVideos);
  }
 
  var deps = ['Utils', 'Analytics'],
      depsCheck = 0,
      depsCheckLimit = 1000;

  (function initCta() {
    setTimeout(function() {
      if(config.debug)console.log('deps poll...');
      var ready = true;
      for (var i = 0; i < deps.length; i++)
        
        if ('undefined' === typeof window[deps[i]]){
          config.debug ? console.log(deps[i] + ' is undefined'):'';
          ready = false;
        }

      if(ready){
        renderCta();
        initAnalytics();
        loadVideos()
      }else if(++depsCheck < depsCheckLimit){
        initCta()
      }
    },5);
  })();
}());