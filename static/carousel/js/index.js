(function () {
  var config = window.parent.__TVPage__.config[Utils.attr(document.body, 'data-id')];
  var channelParams = config.channel.parameters;
  var videosEndpoint = config.api_base_url + '/channels/' + config.channelId + '/videos';
  var templates = config.templates;
  var channelVideos;
  var videosCarousel;

  function sendResizeMessage() {
    Utils.sendMessage({
      event: config.events.resize,
      height: Utils.getWidgetHeight()
    });
  }

  function initVideos() {
    function onVideosCarouselClick(e) {
      if (e && e.target) {
        Utils.sendMessage({
          event: config.events.modal.open,
          
          //I think is best to use the video-item the the carousel holds... more semantic
          clicked: Utils.attr(Utils.getRealTargetByClass(e.target, 'carousel-item'), 'data-id')
        });

        config.profiling['modal_ready'] = {
          start: Utils.now('parent')
        }
      }
    }

    function onVideosCarouselReady() {
      Utils.remove(Utils.getById('skeleton').querySelector('.videos-skel-delete'));

      Utils.removeClass(videosCarousel.el, 'hide-abs');

      Utils.addClass(document.body, 'widget-ready');

      config.profiling['widget_ready'] = Utils.now('parent');

      //send the profile log of the collected metrics
      Utils.sendProfileData(config);

      setTimeout(function(){
        videosCarousel.loadNext('render');
      },0);
    }

    function onVideosCarouselLoad(data) {
      config.channel.videos = config.channel.videos.concat(data);
    }

    console.log(config.video_item_display_amount);
    var itemsPerPage = config.video_item_display_amount !== null ? config.video_item_display_amount : 3;
    console.log(itemsPerPage);

    videosCarousel = new Carousel('videos', {
      alignArrowsY: ['center', '.video-image-icon'],
      endpoint: videosEndpoint,
      params: Utils.addProps({
        o: config.videos_order_by,
        od: config.videos_order_direction
      }, channelParams),
      page: 0,
      data: channelVideos,
      dots: true,
      dotsCenter: true,
      dotsClass: 'col py-3',
      slidesToShow: itemsPerPage,
      slidesToScroll: itemsPerPage,
      itemsTarget: '.slick-carousel',
      itemsPerPage: itemsPerPage,
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
    config.videosCarousel = videosCarousel;
  };

  function initAnalytics() {
    analytics = new Analytics({
      domain: location.hostname
    }, config);

    analytics.initialize();
    analytics.track('ci');
  }

  Utils.poll(function () {
    var videos = config.channel.videos;

    return videos && videos.length;
  }, function () {
    channelVideos = config.channel.videos;

    //global deps check before execute
    Utils.globalPoll(
      ['jQuery', 'Carousel', 'Analytics'],
      function () {
        initAnalytics();
        initVideos();
      });

    var widgetTitleEl = Utils.getById('widget-title');
    widgetTitleEl.innerHTML = config.widget_title_html;

    Utils.addClass(widgetTitleEl, 'ready');
  });
}());
