(function() {
  var body = document.body;
  var id = body.getAttribute('data-id');
  var config = window.parent.__TVPage__.config[id];
  var channelParams = config.channel.parameters;
  var eventPrefix = config.events.prefix;
  var apiBaseUrl = config.api_base_url;
  var videosEndpoint = apiBaseUrl + '/channels/' + config.channelId + '/videos';
  var templates = config.templates;
  var channelVideos = config.channel.videos;
  var skeletonEl = document.getElementById('skeleton');
  var videosCarousel;

  function sendResizeMessage() {
    Utils.sendMessage({
      event: eventPrefix + ':widget_resize',
      height: Utils.getWidgetHeight()
    });
  }

  //we check when critical css has loaded/parsed. At this step, we have data to
  //update the skeleton. We wait until css has really executed in order to send
  //the right measurements.
  var cssLoadedCheck = 0;
  var cssLoadedCheckLimit = 1000;

  (function cssPoll(){
    setTimeout(function(){
      console.log('css loaded poll...');

      var bsCheckEl = document.getElementById('bscheck');
      var bsCheckElVisibility = getComputedStyle(bsCheckEl, null).getPropertyValue('visibility');

      if('hidden' === bsCheckElVisibility){
        var widgetTitleEl = document.getElementById('widget-title');
        widgetTitleEl.innerHTML = config.title_text;
        widgetTitleEl.classList.add('ready');

        skeletonEl.style.visibility = 'visible';
        skeletonEl.style.opacity = '1';

        sendResizeMessage();
        
        Utils.profile(config, {
          metric_type: 'skeleton_shown',
          metric_value: window.parent.performance.now()
        });
      }else if (++cssLoadedCheck < cssLoadedCheckLimit){
        cssPoll()
      }
    }, 5);
  })();

  //a videos section will be initialized
  function initVideos() {
    function onClick(e) {
      if (e && e.target) {
        var realTarget = Utils.getRealTargetByClass(e.target, videosCarousel.itemClass.substr(1));

        Utils.sendMessage({
          event: eventPrefix + ':widget_modal_open',
          clicked: Utils.attr(realTarget, 'data-id')
        });

        if (window.parent.performance){
          config.profiling = config.profiling || {};
          config.profiling['modal_ready'] = {
            start: window.parent.performance.now()
          }
        }
      }
    }

    function onReady(){
      var videosSkelEl = skeletonEl.querySelector('.videos-skel-delete');

      if (videosSkelEl) {
        Utils.remove(videosSkelEl);
      }

      Utils.removeClass(videosCarousel.el, 'hide-abs');
      
      logPerformance();
      
      videosCarousel.loadNext('render');
    }
    
    
    function logPerformance(){
      var profiling = config.profiling;
      
      for (var key in profiling) {
        Utils.profile(config, {
          metric_type: key,
          metric_value: profiling[key]
        });
      }
    }
    
    function onLoad(data) {
      config.channel.videos = config.channel.videos.concat(data);
    }

    videosCarousel = new Carousel('videos', {
      alignArrowsY: ['center', '.video-image-icon'],
      endpoint: videosEndpoint,
      params: Utils.addProps({
        o: config.videos_order_by,
        od: config.videos_order_direction
      }, channelParams),
      page: 0,
      data: channelVideos,
      dotsCenter: true,
      slidesToShow: 3,
      slidesToScroll: 3,
      itemsTarget: '.slick-carousel',
      itemsPerPage: 3,
      templates: {
        list: templates.videos.list,
        item: templates.videos.item
      },
      responsive: [{
        breakpoint: 400,
        settings: {
          arrows: false,
          dots: true,
          slidesToShow: 2,
          slidesToScroll: 2
        }
      }],
      onClick: onClick,
      onReady: onReady,
      onLoad: onLoad,
      onResize: sendResizeMessage
    }, config);

    videosCarousel.initialize();
    videosCarousel.render();
  };

  function initAnalytics() {
    var analytics = new Analytics();
    var analyticsConfig = {
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

  //The global deps of the carousel have to be present before executing its logic.
  var depsCheck = 0;
  var depsCheckLimit = 1000;
  var deps = ['jQuery', 'Carousel', 'Utils', 'Analytics'];

  (function initCarousel() {
    setTimeout(function() {
      console.log('deps poll...');

      var ready = true;
      for (var i = 0; i < deps.length; i++)
        if ('undefined' === typeof window[deps[i]])
          ready = false;

      if (ready) {
        initAnalytics();
        initVideos();
      } else if (++depsCheck < depsCheckLimit) {
        initCarousel()
      }
    }, 5);
  })();

}());
