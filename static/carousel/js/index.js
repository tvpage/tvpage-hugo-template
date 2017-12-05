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

  (function cssPoll() {
    setTimeout(function() {
      console.log('css loaded poll...');

      var bsCheckerEl = document.getElementById('bs-checker');
      var bsCheckerElVisibility = getComputedStyle(bsCheckerEl, null).getPropertyValue('visibility');

      if ('hidden' === bsCheckerElVisibility) {
        var widgetTitleEl = Utils.getById('widget-title');
        widgetTitleEl.innerHTML = config.title_text;
        Utils.addClass(widgetTitleEl, 'ready');

        skeletonEl.style.visibility = 'visible';
        skeletonEl.style.opacity = '1';

        sendResizeMessage();
      } else if (++cssLoadedCheck < cssLoadedCheckLimit) {
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
          event: eventPrefix + ':widget_videos_carousel_click',
          clicked: Utils.attr(realTarget, 'data-id')
        });
      }
    }

    function onReady() {
      var videosSkelEl = skeletonEl.querySelector('.videos-skel-delete');

      if (videosSkelEl) {
        Utils.remove(videosSkelEl);

        videosCarousel.el.style.position = 'relative';

        setTimeout(function() {
          Utils.addClass(videosCarousel.el, 'show');

          Utils.sendMessage({
            event: eventPrefix + ':widget_ready',
            height: Utils.getWidgetHeight()
          });
        }, 0);

        videosCarousel.loadNext('render');
      }
    }

    function onLoad(data) {
      config.channel.videos = config.channel.videos.concat(data);
    }

    function parseVideos(item) {
      var charSize = 35;
      
      if(Utils.isMobile && Utils.getWindowWidth() < 425){
        charSize = 15;
      }

      item.title = Utils.trimText(item.title, charSize);

      return item;
    }

    videosCarousel = new Carousel('videos', {

      //nonsense option, update such approach to be more easy to reason about
      absPosReady: true,

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
      slidesToScroll: 1,
      itemsTarget: '.slick-carousel',
      itemsPerPage: 3,
      templates: {
        list: templates.videos.list,
        item: templates.videos.item
      },
      responsive: [{
        breakpoint: 425,
        settings: {
          arrows: false,
          dots: true,
          slidesToScroll: 3
        }
      }],
      onClick: onClick,
      onReady: onReady,
      onLoad: onLoad,
      onResize: sendResizeMessage,
      parse: parseVideos
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
        //return
        initAnalytics();
        initVideos();

      } else if (++depsCheck < depsCheckLimit) {
        initCarousel()
      }
    }, 5);
  })();

}());
