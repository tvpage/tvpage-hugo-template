(function() {  
    var body = document.body;
    var id = Utils.attr(body, 'data-id');
    var config = window.parent.__TVPage__.config[id];
    var apiBaseUrl = config.api_base_url;
    var loginId = config.loginId;
    var templates = config.templates;
    var eventPrefix = config.events.prefix;
    var mainEl = Utils.getById(id);
    var analytics = null;
    var productsCarousel;

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
  
    function pkTrack() {
      analytics.track('pk', {
        vd: Utils.attr(this, 'data-vd'),
        ct: this.id.split('-').pop(),
        pg: config.channelId
      });
    }
  
    function onNoProducts() {
      Utils.addClass(mainEl, 'tvp-no-products');
      Utils.sendMessage({
        event: eventPrefix + ':widget_modal_no_products'
      });
    }
  
    function onProducts() {
      Utils.removeClass(mainEl, 'tvp-no-products');
      Utils.sendMessage({
        event: eventPrefix + ':widget_modal_products'
      });
    };
  
    function onPlayerResize(initial, size) {
      Utils.sendMessage({
        event: eventPrefix + ':widget_modal_resize',
        height: getWidgetHeight() + 'px'
      });
    };
  
    function onPlayerNext(next) {
      if (config.merchandise && next) {
        productsCarousel.endpoint = apiBaseUrl + '/videos/' + next.assetId + '/products';
        productsCarousel.load('render', function(data){
          if(data && data.length){
            onProducts();
          }else{
            onNoProducts();
          }
        });
      } else {
        onNoProducts();
      }
  
      Utils.sendMessage({
        event: eventPrefix + ':player_next',
        next: next
      });
    };
  
    function initProducts() {
      function parseProducts(item){
        item.title = Utils.trimText(item.title || '', 50);
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
        itemsPerPage: 4,
        templates: {
          list: templates.modal.products.list,
          item: templates.modal.products.item
        },
        parse: parseProducts
      }, config);
  
      productsCarousel.initialize();
      productsCarousel.load('render', function(data){
        if(data && data.length){
          onProducts();
        }else{
          onNoProducts();
        }
      });
    };

    function initPlayer() {
      var playerConfig = Utils.copy(config);
  
      playerConfig.data = config.channel.videos;
      playerConfig.onResize = onPlayerResize;
      playerConfig.onNext = onPlayerNext;
  
      var player = new Player('player-el', playerConfig, config.clicked);
  
      player.initialize();
    };
  
    function initAnalytics() {
      analytics = new Analytics();
      analytics.initConfig({
        domain: location.hostname || '',
        logUrl: apiBaseUrl + '/__tvpa.gif',
        loginId: loginId,
        firstPartyCookies: config.firstpartycookies,
        cookieDomain: config.cookiedomain
      });
      analytics.track('ci', {
        li: loginId
      });
    };
  
    var depsCheck = 0;
    var deps = ['TVPage', 'Utils', 'Analytics', 'Player', 'Carousel', 'jQuery'];
  
    (function initModal() {
      setTimeout(function() {
        if (config.debug) {
          console.log('deps poll...');
        }
  
        var ready = true;
        for (var i = 0; i < deps.length; i++)
          if ('undefined' === typeof window[deps[i]])
            ready = false;
  
        if (ready) {
          
          initPlayer();
          initAnalytics();
          
          if(config.merchandise){
            initProducts();
          }else{
            onNoProducts();
          }
      
          Utils.sendMessage({
            event: eventPrefix + ':widget_modal_initialized',
            height: getWidgetHeight() + 'px'
          });

        } else if (++depsCheck < 200) {
          initModal()
        }
      }, 10);
    })();
  
  }());