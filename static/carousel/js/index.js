(function() {

  var body = document.body;
  var id = body.getAttribute('data-id');
  var config = window.parent.__TVPage__.config[id];
  var eventPrefix = config.events.prefix;
  var apiBaseUrl = config.api_base_url;
  var templates = config.templates;
  var channelVideos = config.channel.videos;
  var skeletonEl = document.getElementById('skeleton');
  var videosCarousel;
  var videosCarouselReady = false;

  function onWidgetReady(){
    if(videosCarouselReady){
      Utils.sendMessage({
        event: eventPrefix + ':widget_ready',
        height: Utils.getWidgetHeight()
      });
    }
  }

  function onWidgetResize(){
    Utils.sendMessage({
      event: eventPrefix + ':widget_resize',
      height: Utils.getWidgetHeight()
    });
  }

  //a videos section will be initialized
  function initVideos(){
    var endpoint = apiBaseUrl + '/channels/' + config.channelId + '/videos';
    var endpointParams = {
      o: config.videos_order_by,
      od: config.videos_order_direction
    };

    var channelParams = config.channel.parameters;

    if(channelParams){
      endpointParams = Utils.addProps(endpointParams, channelParams);
    }

    var carouselConfig = {
      slidesToShow: 4,
      slidesToScroll: 1,
      page: 0,
      itemsTarget: '.slick-carousel',
      itemsPerPage: 4
    };

    var videoTemplates = templates.mobile.videos;

    if(videoTemplates){
      carouselConfig.templates = {
        list: videoTemplates.list,
        item: videoTemplates.item
      };
    }

    carouselConfig.endpoint = endpoint;
    carouselConfig.data = channelVideos;
    carouselConfig.params = endpointParams;
    carouselConfig.responsive = [
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ];

    if(Utils.isMobile){
      videosCarousel = new Carousel('videos',{
        arrowsVerticalAlign: ['center', '.video-image'],
        endpoint: endpoint,
        page: 0,
        data: channelVideos,
        slidesToShow: 4,
        slidesToScroll: 1,
        itemsTarget: '.slick-carousel',
        itemsPerPage: 4,
        templates: {
          list: templates.videos.list,
          item: templates.videos.item
        },
        params: endpointParams,
        responsive: [
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2
            }
          }
        ],
        onReady: function(){
          Utils.remove(skeletonEl.querySelector('.videos-skel-delete'));
          videosCarouselReady = true;
          onWidgetReady();
        },
        onResize: onWidgetResize
      }, config);

      videosCarousel.initialize();
      videosCarousel.render();
    }else{
      videosCarousel = new Carousel('videos',{
        arrowsVerticalAlign: ['center', '.video-image'],
        endpoint: endpoint,
        page: 0,
        data: channelVideos,
        slidesToShow: 4,
        slidesToScroll: 1,
        itemsTarget: '.slick-carousel',
        itemsPerPage: 4,
        templates: {
          list: templates.videos.list,
          item: templates.videos.item
        },
        params: endpointParams,
        responsive: [
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2
            }
          }
        ],
        onReady: function(){
          Utils.remove(skeletonEl.querySelector('.videos-skel-delete'));
          videosCarouselReady = true;
          onWidgetReady();
        },
        onResize: onWidgetResize
      }, config);

      videosCarousel.initialize();
      videosCarousel.render();

      //best to know when the slider is ready with a callback
      // setTimeout(function(){
      //   videosCarousel.loadNext('render');
      // },10);
    }
  };

  //The global deps of the carousel have to be present before executing its logic.
  var depsCheck = 0;
  var deps = ['jQuery','Carousel','Utils','Analytics'];

  (function initCarousel() {
    setTimeout(function() {
      console.log('deps poll...');
      
      var ready = true;
      for (var i = 0; i < deps.length; i++)
        if ('undefined' === typeof window[deps[i]])
          ready = false;

      if(ready){
     
        //This looks more to me for a skeleton/base update
        var widgetTitleEl = Utils.getById('widget-title');
        widgetTitleEl.innerHTML = config.title_text;

        Utils.addClass(widgetTitleEl, 'ready');
        
        initVideos();

      }else if(++depsCheck < 200){
        initCarousel()
      }
    },5);
  })();

}());