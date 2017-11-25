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
  var playe
  var productsCarousel;
  var productsCarouselReady = false;
  var featuredProduct;
  var videosCarousel;
  var videosCarouselReady = false;
  var analytics;

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
      
      if(featuredProduct){
        featuredProduct.data = data[0];
        featuredProduct.render();
      }
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
    var prodTemplates = templates.products;

    //the featured product
    function FeaturedProduct(selector){
      this.el = Utils.getById(selector);
      this.data = [];
    }

    FeaturedProduct.prototype.render = function(){
      var html = '';
      var data = this.data;
      
      if(data && prodTemplates && prodTemplates.featured){
        html = Utils.tmpl(prodTemplates.featured, data);
      }
      
      this.el.innerHTML = html;
    }

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

    function onClick(e){
      Utils.stopEvent(e);

      var target = Utils.getRealTargetByClass(e.target, 'product');

      if(target){
        var targetId = target.getAttribute('data-id');

        if(target && targetId){
          featuredProduct.data = productsCarousel.getDataItemById(targetId);
          featuredProduct.render();
        }
      }else{
        if(config.debug){
          console.log('click target is bad:', e.target);
        }
      }
    }

    //this is just the first load
    function onProductsLoad(data){
      if(data){
        featuredProduct = new FeaturedProduct('featured-product');
        featuredProduct.data = data[0];
        featuredProduct.render();

        //delayed 1st pi track
        setTimeout(function(){
          analyticsPITrack(data);
        }, 3000);
      }
    }

    if(Utils.isMobile){
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
        onReady: onProductsCarouselReady,
        onResize:onWidgetResize
      }, config);
      
      productsCarousel.initialize();
      productsCarousel.load('render', analyticsPITrack);
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
        onReady: onProductsCarouselReady,
        onResize: onWidgetResize,
        onClick: onClick
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
  
  //at this stage we check when critical css has been loaded & parsed, now having the data we can
  //update the skeleton and init necassary stuff for the nice transition. We need to wait until
  //css has really execcuted to send right measurements.
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