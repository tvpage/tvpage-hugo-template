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
  var isMobile = Utils.isMobile;
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

  function piTrack(data){
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

  function renderFeaturedProduct(data){
    var html = '';

    if(data && !Utils.isEmptyObject(data)){
      html = Utils.tmpl(templates.products.featured, data);
    }

    Utils.getById('featured-product').innerHTML = html;
  }
  
  function initVideos(){

    //when a videos carousel element is clicked
    function onClick(e){
      Utils.stopEvent(e);

      var target = Utils.getRealTargetByClass(e.target, 'carousel-item');
      var clickedId = target.getAttribute('data-id');

      if(clickedId){
        player.play(clickedId);

        productsCarousel.endpoint = apiBaseUrl + '/videos/' + clickedId + '/products';
        productsCarousel.load('render', function(data){
          piTrack(data);
          renderFeaturedProduct(data[0]);
        });
      }
    }

    function onReady(){
      Utils.remove(skeletonEl.querySelector('.videos-skel-delete'));
      
      videosCarouselReady = true;
      videosCarousel.loadNext('render');

      onWidgetReady();
    }

    function onLoad(data){
      player.addAssets(data);
      channelVideos = channelVideos.concat(data);
    }

    if(isMobile){
      videosCarousel = new Carousel('videos',{
        alignArrowsY: ['center', '.video-image'],
        page: 0,
        endpoint: videosEndpoint,
        params: Utils.addProps(videosOrderParams, channelParams),
        data: channelVideos,
        slidesToShow: 4,
        slidesToScroll: 1,
        onClick: onClick,
        itemsTarget: '.slick-carousel',
        itemsPerPage: 4,
        templates: {
          list: templatesMobile.videos.list,
          item: templatesMobile.videos.item
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
        onReady: onReady,
        onLoad: onLoad,
        onResize:onWidgetResize
      }, config);
    }else{
      videosCarousel = new Carousel('videos',{
        alignArrowsY: ['center', '.video-image'],
        page: 0,
        endpoint: videosEndpoint,
        params: Utils.addProps(videosOrderParams, channelParams),
        data: channelVideos,
        slidesToShow: 4,
        slidesToScroll: 1,
        onClick: onClick,
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
        onReady: onReady,
        onLoad: onLoad,
        onResize:onWidgetResize
      }, config);
    }

    videosCarousel.initialize();
    videosCarousel.render();
  };

  function initAnalytics() {
    analytics = new Analytics();
    analytics.initConfig({
      domain: location.hostname || '',
      logUrl: apiBaseUrl + '/__tvpa.gif',
      loginId: config.loginId,
      firstPartyCookies: config.firstpartycookies,
      cookieDomain: config.cookiedomain
    });
  };

  function initProducts(){
    function parseProducts(item){
      item.title = Utils.trimText(item.title, 25);//this has to be an option
      item.price = Utils.trimPrice(item.price);
      item.actionText = item.actionText || 'View Details';
      return item;
    }

    function onReady(){
      productsCarouselReady = true;
      onWidgetReady(); 
    }

    function onClick(e){
      Utils.stopEvent(e);

      var target = Utils.getRealTargetByClass(e.target, 'product');

      if(target){
        var targetId = target.getAttribute('data-id');

        if(target && targetId){
          renderFeaturedProduct(productsCarousel.getItemById(targetId));
        }
      }else{
        if(config.debug){
          console.log('click target is bad:', e.target);
        }
      }
    }

    if(isMobile){
      productsCarousel = new Carousel('products',{
        endpoint: productsEndpoint,
        clean: true,
        loadMore: false,
        itemsTarget: '.slick-carousel',
        templates: {
          list: templatesMobile.products.list,
          item: templatesMobile.products.item
        },
        params: productsOrderParams,
        parse: parseProducts,
        onReady: onReady,
        onResize:onWidgetResize
      }, config);
      
      productsCarousel.initialize();
      productsCarousel.load('render', piTrack);

    }else{
      productsCarousel = new Carousel('products',{
        alignArrowsY: ['center', '.carousel-dot-0'],
        dotsCenter: true,
        dots: true,
        dotsClass: 'products-carousel-dots',
        clean: true,
        loadMore: false,
        endpoint: productsEndpoint,
        itemsTarget: '.slick-carousel',
        itemsPerPage: 4,
        pageWrapStart: '<div class="carousel-item" >',
        pageWrapEnd: '</div>',
        templates: {
          list: templates.products.list,
          item: templates.products.item
        },
        params: productsOrderParams,
        parse: parseProducts,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              arrows:false
            }
          }
        ],
        onReady: onReady,
        onResize:onWidgetResize,
        onClick: onClick
      }, config);

      productsCarousel.initialize();
      productsCarousel.load('render', function(data){  
        piTrack(data);
        renderFeaturedProduct(data[0]);
      });
    }
  };

  function initPlayer(){
    var playerConfig = Utils.copy(config);
    
    //the player can take care of the ci
    playerConfig.ciTrack = true;
    playerConfig.data = config.channel.videos;
    playerConfig.onPlayerChange = !!playerConfig.onPlayerChange;
    playerConfig.onNext = function(nextVideo){
      if(config.debug){
        console.log('next video coming', nextVideo);
      }
      
      if(nextVideo.id){
        productsCarousel.endpoint = apiBaseUrl + '/videos/' + nextVideo.id + '/products';
        productsCarousel.load('render', piTrack);
      }
    };

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
  var deps = ['jQuery','Utils','Player', 'Carousel', 'Analytics','_tvpa'];

  (function initInline() {
    setTimeout(function() {
      console.log('deps poll...');
      
      var ready = true;
      for (var i = 0; i < deps.length; i++)
        if ('undefined' === typeof window[deps[i]])
          ready = false;

      if(ready){

        if(isMobile)
          Utils.addClass(body,'mobile');

        //add widget title
        var widgetTitleEl = Utils.getById('widget-title');
        widgetTitleEl.innerHTML = firstVideo.title;
        Utils.addClass(widgetTitleEl, 'ready');

        initPlayer();
        initVideos();
        initAnalytics();
        initProducts();

      }else if(++depsCheck < 200){
        initInline()
      }
    },5);
  })();
    
}());