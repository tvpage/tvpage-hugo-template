(function() {
  
  var body = document.body;
  var id = body.getAttribute('data-id');
  var config = window.parent.__TVPage__.config[id];  
  var eventPrefix = config.events.prefix;
  var apiBaseUrl = config.api_base_url;
  var isMobile = Utils.isMobile;
  var channelVideos = config.channel.videos;
  var templates = config.templates;
  var templatesMobile = templates.mobile;
  var firstVideo = config.channel.videos[0];
  var skeleton = true;
  var skeletonEl = document.getElementById('skeleton');
  var player;
  var productsCarousel;
  var productsCarouselReady = false;
  var videosCarousel;
  var videosCarouselReady = false;
  
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
  
  function initVideos(){

    //when a videos carousel element is clicked
    var onVideoClick = function(e){
      Utils.stopEvent(e);

      var target = Utils.getRealTargetByClass(e.target, 'tvp-carousel-item');
      var clickedId = target.getAttribute('data-id');

      if(clickedId){
        player.play(clickedId);

        productsCarousel.endpoint = apiBaseUrl + '/videos/' + clickedId + '/products';
        productsCarousel.load('render', function(data){
          var html = '';
          if(data){
            html = Utils.tmpl(templates.products.featured, data[0]);
          }
  
          Utils.getById('featured-product').innerHTML = html;
        });
      }
    };

    var endpoint = apiBaseUrl + '/channels/' + config.channelId + '/videos';
    var endpointParams = {
      o: config.videos_order_by,
      od: config.videos_order_direction
    };
    var channelParams = config.channel.parameters;
    
    if(channelParams){
      for (var channelParam in channelParams)
      endpointParams[channelParam] = channelParams[channelParam];
    }

    if(isMobile){
      videosCarousel = new Carousel('videos',{
        alignArrowsY: ['center', '.video-image'],
        page: 0,
        endpoint: endpoint,
        params: endpointParams,
        data: channelVideos,
        slidesToShow: 4,
        slidesToScroll: 1,
        onClick: onVideoClick,
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
        onReady: function(){
          Utils.remove(skeletonEl.querySelector('.videos-skel-delete'));
          videosCarouselReady = true;
          onWidgetReady();
        },
        onResize:onWidgetResize
      }, config);
    }else{
      videosCarousel = new Carousel('videos',{
        alignArrowsY: ['center', '.video-image'],
        page: 0,
        endpoint: endpoint,
        params: endpointParams,
        data: channelVideos,
        slidesToShow: 4,
        slidesToScroll: 1,
        onClick: onVideoClick,
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
        onReady: function(){
          Utils.remove(skeletonEl.querySelector('.videos-skel-delete'));
          videosCarouselReady = true;
          onWidgetReady();
        },
        onResize:onWidgetResize
      }, config);
    }

    videosCarousel.initialize();
    videosCarousel.render();

    //TODObest to know when the slider is ready with a callback
    // setTimeout(function(){
    //   videosCarousel.loadNext('render');
    // },10);
  };

  function initProducts(){

    var endpoint = apiBaseUrl + '/videos/' + firstVideo.id + '/products';
    var parse = function(item){
      item.title = Utils.trimText(item.title, 25);//this has to be an option
      item.price = Utils.trimPrice(item.price);
      item.actionText = item.actionText || 'View Details';
      return item;
    };
    var endpointParams = {
      o: config.products_order_by,
      od: config.products_order_direction
    };

    if(isMobile){
      productsCarousel = new Carousel('products',{
        endpoint: endpoint,
        clean: true,
        itemsTarget: '.slick-carousel',
        templates: {
          list: templatesMobile.products.list,
          item: templatesMobile.products.item
        },
        params: endpointParams,
        parse: parse,
        onReady: function(){
          productsCarouselReady = true;
          
          onWidgetReady();
        },
        onResize:onWidgetResize
      }, config);
      
      productsCarousel.initialize();
      productsCarousel.load('render');

    }else{
      productsCarousel = new Carousel('products',{
        alignArrowsY: ['center', '.carousel-dot-0'],
        dotsCenter: true,
        dots: true,
        dotsClass: 'products-carousel-dots',
        clean: true,
        endpoint: endpoint,
        full:true,
        itemsTarget: '.slick-carousel',
        itemsPerPage: 4,
        pageWrapStart: '<div class="tvp-carousel-item" >',
        pageWrapEnd: '</div>',
        templates: {
          list: templates.products.list,
          item: templates.products.item
        },
        params: endpointParams,
        parse: parse,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              arrows:false
            }
          }
        ],
        onReady: function(){
          productsCarouselReady = true;
          
          onWidgetReady();
        },
        onResize:onWidgetResize,
        onClick: function(e){
          Utils.stopEvent(e);

          var target = Utils.getRealTargetByClass(e.target, 'product');
          var id = target.getAttribute('data-id');
          
          var data = productsCarousel.getItemById(id);
          var html = '';
          if(data){
            html = Utils.tmpl(templates.products.featured, data);
          }
  
          Utils.getById('featured-product').innerHTML = html;
        }
      }, config);

      productsCarousel.initialize();
      productsCarousel.load('render', function(data){
        var html = '';
        if(data){
          html = Utils.tmpl(templates.products.featured, data[0]);
        }

        Utils.getById('featured-product').innerHTML = html;
      });
      
    }
  };

  function initPlayer(){
    var playerConfig = Utils.copy(config);
    
    playerConfig.ciTrack = true;
    playerConfig.data = config.channel.videos;
    playerConfig.onPlayerChange = !!playerConfig.onPlayerChange;
    playerConfig.onNext = function(nextVideo){
      if(config.debug){
        console.log('next video coming', nextVideo);
      }
      
      if(nextVideo.id){
        productsCarousel.endpoint = apiBaseUrl + '/videos/' + nextVideo.id + '/products';
        productsCarousel.load('render');
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
  var deps = ['jQuery','Utils','Player', 'Carousel'];

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

        //This looks more to me for a skeleton update
        var widgetTitleEl = Utils.getById('widget-title');
        
        widgetTitleEl.innerHTML = firstVideo.title;
        Utils.addClass(widgetTitleEl, 'ready');

        initPlayer();
        initVideos();
        initProducts();
        

      }else if(++depsCheck < 200){
        initInline()
      }
    },5);
  })();
    
}());