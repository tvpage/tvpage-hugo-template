(function() {
  var body = document.body,
      id = body.getAttribute('data-id'),
      config = window.parent.__TVPage__.config[id],
      eventPrefix = config.events.prefix,
      apiBaseUrl = config.api_base_url;

  function renderCta(){  
    var videos = config.channel.videos,
        firstVideo = videos[0];
    
    config.channel.firstVideo = firstVideo;

    var overlayEl = Utils.getByClass('tvp-cta-overlay'),
        ctaText = Utils.getByClass('tvp-cta-text');

    overlayEl.style.backgroundImage = "url(" + firstVideo.asset.thumbnailUrl + ")";
    ctaText.innerHTML = firstVideo.title;

    Utils.sendMessage({
      event: eventPrefix + ':widget_ready',
      height: Math.floor(overlayEl.getBoundingClientRect().height)
    });

    function onClick(e){
      Utils.sendMessage({
            event: eventPrefix + ':widget_click',
            clicked: firstVideo.id
        });
    }

    function onResize(){
      Utils.sendMessage({
        event: eventPrefix + ':widget_resize',
        height: Math.floor(overlayEl.getBoundingClientRect().height)
      });
    }
    
    overlayEl.removeEventListener("click", onClick, false);
    overlayEl.addEventListener("click", onClick, false);
    window.removeEventListener("resize", onResize, false);
    window.addEventListener("resize", onResize, false);
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
 
  var deps = ['Utils', 'Analytics'],
      depsCheck = 0,
      depsCheckLimit = 1000;

  (function initSolo() {
    setTimeout(function() {
      console.log('deps poll...');
      
      var ready = true;
      for (var i = 0; i < deps.length; i++)
        
        if ('undefined' === typeof window[deps[i]]){
          config.debug ? console.log(deps[i] + ' is undefined'):'';
          ready = false;
        }

      if(ready){
        renderCta();
        initAnalytics();
      }else if(++depsCheck < 200){
        initSolo()
      }
    },5);
  })();
}());