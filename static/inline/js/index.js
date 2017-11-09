(function() {
  
  var body = document.body;
  var id = body.getAttribute('data-id');

  //We did all the possible checks in the widget's index.js file, no need to check more here.
  var config = window.parent.__TVPage__.config[id];
  
  var apiBaseUrl = config.api_base_url;
  var channelVideos = config.channel.videos;
  var templates = config.templates;
  var firstVideo = config.channel.videos[0];
  var skeleton = true;
  var skeletonEl = document.getElementById('skeleton');
  var player;
  var productsCarousel;
  var videosCarousel;
  var featuredProduct;

  function FeaturedProduct(sel, data){
    this.data = data || null;
    this.el = document.getElementById(sel);
  }

  FeaturedProduct.prototype.render = function(){
    this.el.innerHTML = this.data ? Utils.tmpl(templates.products.featured, this.data) : '';
  };
  
  function initVideos(){

    //when a videos carousel element is clicked
    var onVideoClick = function(e){
      Utils.stopEvent(e);

      var target = Utils.getRealTargetByClass(e.target, 'tvp-carousel-item');
      var clickedId = target.getAttribute('data-id');

      if(clickedId){

        //play video in the player
        player.play(clickedId);

        productsCarousel.endpoint = apiBaseUrl + '/videos/' + clickedId + '/products';
        productsCarousel.load('render', function(data){
          featuredProduct.data = data[0];
          featuredProduct.render();
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

    carouselConfig.onClick = onVideoClick;

    if(Utils.isMobile){
      videosCarousel = new Carousel('videos', carouselConfig, config);
      videosCarousel.initialize();
      videosCarousel.render();
    }else{
      videosCarousel = new Carousel('videos',{
        arrowsCenteredTo: '.video-image',
        endpoint: endpoint,
        page: 0,
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
        }
      }, config);

      videosCarousel.initialize();
      videosCarousel.render();

      //best to know when the slider is ready with a callback
      setTimeout(function(){
        videosCarousel.loadNext('render');
      },10);
    }
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

    if(Utils.isMobile){
      productsCarousel = new Carousel('products',{
        endpoint: endpoint,
        itemsTarget: '.slick-carousel',
        itemsPerPage: 4,
        templates: {
          list: templates.mobile.products.list,
          item: templates.mobile.products.item
        },
        params: endpointParams,
        parse: parse
      }, config);
      
      productsCarousel.initialize();
      productsCarousel.load('render');

    }else{
      productsCarousel = new Carousel('products',{
        arrowsCenteredTo: 'bottom',
        dotsCenter: true,
        dots: true,
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
        onClick: function(e){
          Utils.stopEvent(e);

          var target = Utils.getRealTargetByClass(e.target, 'product');
          var id = target.getAttribute('data-id');
          
          featuredProduct.data = productsCarousel.getItemById(id);
          featuredProduct.render();
        }
      }, config);

      productsCarousel.initialize();
      productsCarousel.load('render', function(data){
        featuredProduct = new FeaturedProduct('featured-product', data[0] || []);
        featuredProduct.render();
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