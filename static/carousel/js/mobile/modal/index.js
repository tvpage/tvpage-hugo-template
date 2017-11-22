(function() {
  var body = document.body;
  var id = body.getAttribute("data-id") || "";
  var config = window.parent.__TVPage__.config[id];
  var templates = config.templates.mobile;
  var apiBaseUrl = config.api_base_url;
  var mainEl;
  var eventPrefix = config.events.prefix;
  var productsCarousel;
  
  function onWidgetResize(){
    Utils.sendMessage({
      event: eventPrefix + ':widget_modal_resize',
      height: getWidgetHeight() + 'px'
    });
  }

  function getBodyPadding(){
    var bodyProps = [
      'padding-top',
      'padding-bottom'
    ];
    
    var padding = 0;

    for (var i = 0; i < bodyProps.length; i++) {
      padding += parseInt(Utils.getStyle(body, bodyProps[i]));
    }

    return padding;
  }

  function getWidgetHeight() {
    var height = Math.floor(mainEl.getBoundingClientRect().height);

    return height + getBodyPadding();
  }

  function initProducts() {
    function parseProducts(item){
      item.title = Utils.trimText(item.title || '', 35);
      item.price = Utils.trimPrice(item.price || '');
      item.actionText = item.actionText || 'View Details';
      return item;
    }

    productsCarousel = new Carousel('products',{
      clean: true,
      loadMore: false,
      endpoint: apiBaseUrl + '/videos/' + config.clicked + '/products',
      params: Utils.addProps({
        o: config.products_order_by,
        od: config.products_order_direction
      }),
      slidesToShow: 1,
      slidesToScroll: 1,
      itemsTarget: '.slick-carousel',
      templates: {
        list: templates.modal.products.list,
        item: templates.modal.products.item
      },
      parse: parseProducts,
      onResize:onWidgetResize,
      responsive: [
        {
          breakpoint: 499,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        }
      ]
    }, config);

    productsCarousel.initialize();
    productsCarousel.load('render');
  }

  function onPlayerNext(next) {
    if (config.merchandise && next) {
      productsCarousel.endpoint = apiBaseUrl + '/videos/' + next.assetId + '/products';
      productsCarousel.load('render');
    }

    Utils.sendMessage({
      event: eventPrefix + ':player_next',
      next: next
    });
  }

  function initPlayer() {
    var playerConfig = Utils.copy(config);

    playerConfig.data = config.channel.videos;
    playerConfig.onResize = onWidgetResize;
    playerConfig.onNext = onPlayerNext;

    var player = new Player('tvp-player-el', playerConfig, config.clicked);

    player.initialize();
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

  var depsCheck = 0;
  var deps = ['TVPage', 'jQuery', 'Utils', 'Analytics', 'Carousel', 'Player'];

  (function initModal() {
    setTimeout(function() {
      if (config.debug) {
        console.log('deps poll...');
      }

      var ready = true;
      var depsLength = deps.length;

      for (var i = 0; i < depsLength; i++)
        if ('undefined' === typeof window[deps[i]])
          ready = false;

      if (ready) {
        mainEl = Utils.getById(id);

        initPlayer();
        initAnalytics();
        initProducts();

      } else if (++depsCheck < 200) {
        initModal()
      }
    }, 10);
  })();

}());