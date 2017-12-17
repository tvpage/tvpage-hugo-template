(function () {
  var config = window.parent.__TVPage__.config[Utils.attr(document.body, 'data-id')];
  var firstVideo;
  var channelParams = config.channel.parameters;
  var eventPrefix = config.events.prefix;
  var resizeEvent = eventPrefix + ':widget_resize';
  var playerChangeEvent = eventPrefix + ':widget_player_change';
  var dataReturnedEvent = eventPrefix + ':widget_data_returned';
  var apiBaseUrl = config.api_base_url;
  var channelVideosEndpoint = apiBaseUrl + '/channels/' + config.channelId + '/videos';
  var videosOrderParams = {
    o: config.videos_order_by,
    od: config.videos_order_direction
  };
  var productsOrderParams = {
    o: config.products_order_by,
    od: config.products_order_direction
  };
  var channelVideos;
  var templates = config.templates;
  var templatesMobile = templates.mobile;
  var player;
  var analytics;
  var productsCarousel;
  var featuredProduct;
  var videosCarousel;
  var productsCarouselReady = false;
  var videosCarouselReady = false;
  var playerReadyCalled = false;
  var isFirstVideoPlay = true;
  var isFirstPlayButtonClick = true;

  function sendResizeMessage() {
    Utils.sendMessage({
      event: resizeEvent,
      height: Utils.getWidgetHeight()
    });
  }

  function analyticsPKTrack(product) {
    analytics.track('pk', {
      vd: product.entityIdParent,
      ct: product.id,
      pg: config.channelId
    });
  }

  function analyticsPITrack(data) {
    for (var i = 0; i < data.length; i++) {
      var product = data[i];

      analytics.track('pi', {
        vd: product.entityIdParent,
        ct: product.id,
        pg: config.channelId
      });
    }
  }

  function onWidgetReady() {
    if (productsCarouselReady && videosCarouselReady) {
      sendResizeMessage();

      config.profiling['widget_ready'] = Utils.now('parent');

      //send the profile log of the collected metrics
      Utils.sendProfileData(config);
    }
  }

  //if the video  change comes auto from the player we don't need to tell the player to play
  function onWidgetVideoChange(videoId, fromPlayer) {
    if (!fromPlayer)
      player.play(videoId);

    productsCarousel.endpoint = apiBaseUrl + '/videos/' + videoId + '/products';
    productsCarousel.load('render', function (data) {
      analyticsPITrack(data);

      if (featuredProduct) {
        featuredProduct.data = data[0];
        featuredProduct.render();
      }
    });
  }

  //when a videos carousel element is clicked
  function initVideos() {
    function onVideosCarouselClick(e) {
      Utils.stopEvent(e);

      if (e && e.target) {
        var target = Utils.getRealTargetByClass(e.target, 'carousel-item');

        if (target) {
          onWidgetVideoChange(target.getAttribute('data-id'));
        }
      }
    }

    function onVideosCarouselReady() {
      videosCarouselReady = true;

      Utils.remove(Utils.getById('skeleton').querySelector('.videos-skel-delete'));

      videosCarousel.loadNext('render');

      onWidgetReady();
    }

    function onVideosCarouselLoad(data) {
      player.addAssets(data);
      config.channel.videos = channelVideos.concat(data);
    }

    videosCarousel = new Carousel('videos', {
      alignArrowsY: ['center', '.video-image-icon'],
      page: 0,
      endpoint: channelVideosEndpoint,
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
      responsive: [{
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      }],
      onReady: onVideosCarouselReady,
      onLoad: onVideosCarouselLoad,
      onResize: sendResizeMessage
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

  function initProducts() {
    var prodTemplates = templates.products;

    function FeaturedProduct(selector) {
      this.el = Utils.getById(selector);
      this.data = {};

      this.handleClick();
    }

    FeaturedProduct.prototype.handleClick = function () {
      var that = this;

      this.el.addEventListener('click', function (e) {
        analyticsPKTrack(that.data);
      });
    }

    FeaturedProduct.prototype.render = function () {
      var html = '';
      var data = this.data;

      if (data && prodTemplates && prodTemplates.featured) {
        html = Utils.tmpl(prodTemplates.featured, data);
      }

      this.el.innerHTML = html;
    }

    function parseProducts(item) {
      item.title = Utils.trimText(item.title, 25); //this has to be an option
      item.price = Utils.trimPrice(item.price);
      item.actionText = item.actionText || 'View Details';
      return item;
    }

    function onProductsCarouselReady() {
      productsCarouselReady = true;

      onWidgetReady();
    }

    function onClick(e) {
      Utils.stopEvent(e);

      var target = Utils.getRealTargetByClass(e.target, 'product');

      if (target) {
        var targetId = target.getAttribute('data-id');

        if (targetId) {
          featuredProduct.data = productsCarousel.getDataItemById(targetId);
          featuredProduct.render();
        }
      }
    }

    //this is just the first load
    function onProductsLoad(data) {
      if (data) {
        featuredProduct = new FeaturedProduct('featured-product');
        featuredProduct.data = data[0];
        featuredProduct.render();

        //delayed 1st pi track
        setTimeout(function () {
          analyticsPITrack(data);
        }, 3000);
      }
    }

    if (Utils.isMobile) {
      //track the pi here with event delegation
      document.addEventListener('click', function (e) {
        var target = Utils.getRealTargetByClass(e.target, 'product');

        if (target) {
          var targetId = Utils.attr(target, 'data-id') || null;

          if (targetId) {
            analyticsPKTrack(productsCarousel.getDataItemById(targetId));
          }
        }
      }, false);

      productsCarousel = new Carousel('products', {
        dotsCenter: true,
        dotsMax: 10,
        endpoint: apiBaseUrl + '/videos/' + firstVideo.id + '/products',
        clean: true,
        itemsPerPage: 1,
        loadMore: false,
        itemsTarget: '.slick-carousel',
        templates: {
          list: templatesMobile.products.list,
          item: templatesMobile.products.item
        },
        responsive: [{
          breakpoint: 600,
          settings: {
            dots: true,
            arrows: false
          }
        }],
        params: productsOrderParams,
        parse: parseProducts,
        onReady: onProductsCarouselReady,
        onResize: sendResizeMessage
      }, config);

      productsCarousel.initialize();
      productsCarousel.load('render', analyticsPITrack);
    } else {
      productsCarousel = new Carousel('products', {
        alignArrowsY: ['center', '.carousel-dot-0'],
        dotsCenter: true,
        dots: true,
        dotsClass: 'products-carousel-dots',
        clean: true,
        loadMore: false,
        endpoint: apiBaseUrl + '/videos/' + firstVideo.id + '/products',
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
        onResize: sendResizeMessage,
        onClick: onClick
      }, config);

      productsCarousel.initialize();
      productsCarousel.load('render', onProductsLoad);
    }
  };

  function initPlayer() {
    function onPlayerNext(next) {
      var nextVideoId = next.assetId;

      if (nextVideoId) {
        onWidgetVideoChange(nextVideoId);
      }
    }

    function onPlayerChange(e, currentAsset) {
      Utils.sendMessage({
        event: playerChangeEvent,
        e: e,
        stateData: currentAsset
      });

      if ("tvp:media:videoplaying" === e && isFirstVideoPlay) {
        isFirstVideoPlay = false;

        Utils.profile(config, {
          metric_type: 'video_playing',
          metric_value: Utils.now('parent') - config.profiling['video_playing'].start
        });
      }
    }

    function onPlayerClick(e) {
      if (e && e.target) {
        var target = Utils.getRealTargetByClass(e.target, 'tvplayer-playbutton');

        if (target && isFirstPlayButtonClick) {
          isFirstPlayButtonClick = false;

          config.profiling['video_playing'] = {
            start: Utils.now('parent')
          }
        }
      }
    }

    function onPlayerReady() {
      if (!playerReadyCalled) {
        playerReadyCalled = true;

        config.profiling['video_playing'] = {
          start: Utils.now('parent')
        }
      }
    }

    player = new Player('player-el', {
      data: config.channel.videos,
      ciTrack: true,
      onNext: onPlayerNext,
      onChange: onPlayerChange,
      onClick: onPlayerClick,
      onPlayerReady: onPlayerReady,
    }, config);

    player.initialize();
  };

  Utils.poll(function () {
    var videos = config.channel.videos;

    return videos && videos.length;
  }, function () {
    channelVideos = config.channel.videos;

    firstVideo = channelVideos[0];

    //global deps check before execute
    Utils.globalPoll(
      ['jQuery', 'Utils', 'Player', 'Carousel', 'Analytics'],
      function () {
        initPlayer();
        initVideos();
        initAnalytics();
        initProducts();
      });

    var widgetTitleEl = Utils.getById('widget-title');
    widgetTitleEl.innerHTML = firstVideo.title;

    Utils.addClass(widgetTitleEl, 'ready');
  });

}());