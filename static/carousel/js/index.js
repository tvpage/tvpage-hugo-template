(function(){
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

  //a videos section will be initialized
  function initVideos(){
    function onResize(){
      Utils.sendMessage({
        event: eventPrefix + ':widget_resize',
        height: Utils.getWidgetHeight()
      });
    }
    
    function onClick(e){
      if(e && e.target){
        var realTarget = Utils.getRealTargetByClass(e.target, videosCarousel.itemClass.substr(1));

        Utils.sendMessage({
          event: eventPrefix + ':widget_videos_carousel_click',
          clicked: realTarget.getAttribute('data-id')
        });
      }
    }

    function onReady(){
      Utils.remove(skeletonEl.querySelector('.videos-skel-delete'));
      
      Utils.sendMessage({
        event: eventPrefix + ':widget_ready',
        height: Utils.getWidgetHeight()
      });
      
      videosCarousel.loadNext('render');
    }

    function onLoad(data){
      config.channel.videos = config.channel.videos.concat(data);
    }

    function parseVideos(item){
      item.title = Utils.trimText(item.title, 35);

      return item;
    }

    //for small bp and below we will do 1 video per
    var videosCarousel = new Carousel('videos',{
      alignArrowsY: ['center', '.video-image-icon'],
      endpoint: videosEndpoint,
      params: Utils.addProps({
        o: config.videos_order_by,
        od: config.videos_order_direction
      }, channelParams),
      page: 0,
      data: channelVideos,
      dots: true,
      slidesToShow: 3,
      slidesToScroll: 1,
      itemsTarget: '.slick-carousel',
      itemsPerPage: 3,
      templates: {
        list: templates.videos.list,
        item: templates.videos.item
      },
      responsive: [
        {
          breakpoint: 576,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ],
      onClick: onClick,
      onReady: onReady,
      onLoad: onLoad,
      onResize: onResize,
      parse: parseVideos
    }, config);

    videosCarousel.initialize();
    videosCarousel.render();
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
     
        //add widget title
        var widgetTitleEl = Utils.getById('widget-title');
        widgetTitleEl.innerHTML = config.title_text;
        Utils.addClass(widgetTitleEl, 'ready');

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
        
        initVideos();

      }else if(++depsCheck < 200){
        initCarousel()
      }
    },5);
  })();

}());