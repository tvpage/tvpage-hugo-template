(function() {  
  var body = document.body;
  var id = body.getAttribute('data-id');
  var config = window.parent.__TVPage__.config[id];
  var firstVideo = config.channel.videos[0];
  var channelParams = config.channel.parameters;
  var eventPrefix = config.events.prefix;
  var apiBaseUrl = config.api_base_url;
  var videosEndpoint = apiBaseUrl + '/channels/' + config.channelId + '/videos';
  var videosOrderParams = {
    o: config.videos_order_by,
    od: config.videos_order_direction
  };
  var productsEndpoint = apiBaseUrl + '/videos/' + firstVideo.id + '/products';
  var productsOrderParams = {
    o: config.products_order_by,
    od: config.products_order_direction
  };
  var channelVideos = config.channel.videos;
  var templates = config.templates;
  var templatesMobile = templates.mobile;
  var skeleton = true;
  var skeletonEl = document.getElementById('skeleton');
  var player;
  var productsCarousel;
  var productsCarouselReady = false;
  var videosCarousel;
  var videosCarouselReady = false;
  var analytics;

  function analyticsPKTrack(product){
    analytics.track('pk',{
      vd: product.entityIdParent,
      ct: product.id,
      pg: config.channelId
    });
  }

  function analyticsPITrack(data){
    for (var i = 0; i < data.length; i++) {
      var product = data[i];
      
      analytics.track('pi',{
        vd: product.entityIdParent,
        ct: product.id,
        pg: config.channelId
      });
    }
  }
  
  function onWidgetReady(){
    if(productsCarouselReady && videosCarouselReady){
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

  //if the video  change comes auto from the player we don't need to tell the player to play
  function onWidgetVideoChange(videoId, fromPlayer){
    if(!fromPlayer)
      player.play(videoId);

    productsCarousel.endpoint = apiBaseUrl + '/videos/' + videoId + '/products';
    productsCarousel.load('render', function(data){
      analyticsPITrack(data);
    });
  }
  
  //when a videos carousel element is clicked
  function initVideos(){
    function onVideosCarouselClick(e){
      Utils.stopEvent(e);

      var target = Utils.getRealTargetByClass(e.target, 'carousel-item');
      var clickedId = target.getAttribute('data-id');

      if(clickedId){
        onWidgetVideoChange(clickedId);
      }
    }

    function onVideosCarouselReady(){
      videosCarouselReady = true;
      
      Utils.remove(skeletonEl.querySelector('.videos-skel-delete'));
      
      videosCarousel.loadNext('render');

      onWidgetReady();
    }

    function onVideosCarouselLoad(data){
      player.addAssets(data);
      channelVideos = channelVideos.concat(data);
    }

    videosCarousel = new Carousel('videos',{
      alignArrowsY: ['center', '.video-image-icon'],
      page: 0,
      endpoint: videosEndpoint,
      params: Utils.addProps(videosOrderParams, channelParams),
      data: channelVideos,
      slidesToShow: 4,
      slidesToScroll: 1,
      onClick: onVideosCarouselClick,
      itemsTarget: '.slick-carousel',
      itemsPerPage: 4,
      templates: {
        list: templates.videos.list,
        item: templates.videos.item
      },
      responsive: [
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        }
      ],
      onReady: onVideosCarouselReady,
      onLoad: onVideosCarouselLoad,
      onResize:onWidgetResize
    }, config);

    videosCarousel.initialize();
    videosCarousel.render();
  };

  function initAnalytics() {
    analytics = new Analytics({
      domain: location.hostname
    }, config);

    analytics.initialize();
    analytics.track('ci');
  };

  function initProducts(){
    var prodTemplates = templates.products;

    function parseProducts(item){
      item.title = Utils.trimText(item.title, 25);//this has to be an option
      item.price = Utils.trimPrice(item.price);
      item.actionText = item.actionText || 'View Details';
      return item;
    }

    function onProductsCarouselReady(){
      productsCarouselReady = true;

      onWidgetReady();
    }

    //delayed the 1st pi tracking
    function onProductsLoad(data){
      setTimeout(function(){
        analyticsPITrack(data);
      }, 3000);
    }

    //track the pi here with event delegation
    document.addEventListener('click', function(e){
      var target = Utils.getRealTargetByClass(e.target, 'product');

      if(target){
        var targetId = Utils.attr(target, 'data-id') || null;

        if(targetId){
          analyticsPKTrack(productsCarousel.getDataItemById(targetId));
        }
      }
    }, false);

    if(Utils.isMobile){
      productsCarousel = new Carousel('products',{
        dotsCenter: true,
        dotsMax: 10,
        endpoint: productsEndpoint,
        clean: true,
        loadMore: false,
        itemsTarget: '.slick-carousel',
        templates: {
          list: templatesMobile.products.list,
          item: templatesMobile.products.item
        },
        responsive: [
          {
            breakpoint: 600,
            settings: {
              dots: true,
              arrows: false
            }
          }
        ],
        params: productsOrderParams,
        parse: parseProducts,
        onReady: onProductsCarouselReady,
        onResize:onWidgetResize
      }, config);
      
      productsCarousel.initialize();
      productsCarousel.load('render', analyticsPITrack);
    }else{
    productsCarousel = new Carousel('products',{
        clean: true,
        loadMore: false,
        endpoint: productsEndpoint,
        itemsTarget: '.slick-carousel',
        itemsPerPage: 1,
        templates: {
          list: templates.products.list,
          item: templates.products.item
        },
        params: productsOrderParams,
        parse: parseProducts,
        onReady: onProductsCarouselReady,
        onResize: onWidgetResize
      }, config);

      productsCarousel.initialize();
      productsCarousel.load('render', onProductsLoad);
    }
  };


  function onPlayerNext(next) {
    var nextVideoId = next.assetId;
    
    if (nextVideoId) {
      onWidgetVideoChange(nextVideoId);
    }
  }

  function initPlayer(){
    var playerConfig = Utils.copy(config);
    
    //the player can take care of the ci
    playerConfig.ciTrack = true;
    playerConfig.data = config.channel.videos;
    playerConfig.onPlayerChange = !!playerConfig.onPlayerChange;
    playerConfig.onNext = onPlayerNext;

    //watch out this function triggers twice, once per media provider
    var readyCalled = false;

    playerConfig.onPlayerReady = function(){
      if(!readyCalled){
        readyCalled = true;

        if (config.debug) {
          console.log("a player is ready");
        }
      }
    };
    
    player = new Player('player-el', playerConfig);
    player.initialize();
  };

  //The global deps of the carousel have to be present before executing its logic.
  var depsCheck = 0;
  var depsCheckLimit = 1000;
  var deps = ['jQuery','Utils','Player', 'Carousel', 'Analytics','_tvpa'];

  (function initInline() {
    setTimeout(function() {
      console.log('deps poll...');
      
      var ready = true;
      for (var i = 0; i < deps.length; i++)
        if ('undefined' === typeof window[deps[i]])
          ready = false;

      if(ready){

        if(Utils.isMobile)
          Utils.addClass(body,'mobile');

        initPlayer();
        initVideos();
        initAnalytics();
        initProducts();

      }else if(++depsCheck < depsCheckLimit){
        initInline()
      }
    },10);
  })();
  
  //we check when critical css has loaded/parsed. At this step, we have data to
  //update the skeleton. We wait until css has really executed in order to send
  //the right measurements.
  var cssLoadedCheck = 0;
  var cssLoadedCheckLimit = 1000;

  (function sendFirstSize() {
    setTimeout(function() {
      console.log('css loaded poll...');

      if('hidden' === Utils.getStyle(Utils.getById('bs-checker'), 'visibility')){
        //add widget title
        var widgetTitleEl = Utils.getById('widget-title');
        widgetTitleEl.innerHTML = firstVideo.title;
        Utils.addClass(widgetTitleEl, 'ready');

        Utils.sendMessage({
          event: eventPrefix + ':widget_resize',
          height: Utils.getWidgetHeight()
        });

      }else if(++cssLoadedCheck < cssLoadedCheckLimit){
        sendFirstSize()
      }
    },10);
  })();

}());