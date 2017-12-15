(function() {
  var config = window.parent.__TVPage__.config[Utils.attr(document.body, 'data-id')];
  var channelParams = config.channel.parameters;
  var eventPrefix = config.events.prefix;
  var modalOpenEvent = eventPrefix + ':widget_modal_open';
  var resizeEvent = eventPrefix + ':widget_resize';
  var apiBaseUrl = config.api_base_url;
  var videosEndpoint = apiBaseUrl + '/channels/' + config.channelId + '/videos';
  var templates = config.templates;
  var channelVideos = config.channel.videos;
  var skeletonEl = Utils.getById('skeleton');
  var videosCarousel;

  function sendResizeMessage() {
    Utils.sendMessage({
      event: resizeEvent,
      height: Utils.getWidgetHeight()
    });
  }

  //we check when critical css has loaded/parsed. At this step, we have data to
  //update the skeleton. We wait until css has really executed in order to send
  //the right measurements.
  Utils.poll(function(){
    return 'hidden' === Utils.getStyle(Utils.getById('bscheck'), 'visibility');
  },
  function(){
    Utils.addClass(skeletonEl, 'ready');

    var widgetTitleEl = Utils.getById('widget-title');
    
    widgetTitleEl.innerHTML = config.title_text;

    Utils.addClass(widgetTitleEl, 'ready');

    sendResizeMessage();
    
    config.profiling['skeleton_shown'] = Utils.now('parent');
  });

  function initVideos() {
    function onVideosCarouselClick(e) {
      if(e && e.target){
        Utils.sendMessage({
          event: modalOpenEvent,
          clicked: Utils.attr(Utils.getRealTargetByClass(e.target, 'carousel-item'), 'data-id')
        });

        config.profiling['modal_ready'] = {
          start: Utils.now('parent')
        }
      }
    }

    function onVideosCarouselReady(){
      var videosSkelEl = skeletonEl.querySelector('.videos-skel-delete');

      if (videosSkelEl) {
        Utils.remove(videosSkelEl);
      }

      Utils.removeClass(videosCarousel.el, 'hide-abs');

      config.profiling['widget_ready'] = Utils.now('parent');

      //send the profile log of the collected metrics
      Utils.sendProfileData(config);
      
      videosCarousel.loadNext('render');
    }
    
    function onVideosCarouselLoad(data){
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
      onClick: onVideosCarouselClick,
      onReady: onVideosCarouselReady,
      onLoad: onVideosCarouselLoad,
      onResize: sendResizeMessage
    }, config);

    videosCarousel.initialize();
    videosCarousel.render();
  };

  function initAnalytics(){
    analytics = new Analytics({
      domain: location.hostname
    }, config);

    analytics.initialize();
    analytics.track('ci');
  }

  //global deps check before execute
  Utils.globalPoll(
    ['jQuery', 'Carousel', 'Analytics'],
    function(){
      initAnalytics();
      initVideos();
  });
}());
