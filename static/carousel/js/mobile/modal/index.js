(function(){
    var body = document.body;
    var id = body.getAttribute('data-id');
    var config = window.parent.__TVPage__.config[id];
    var eventPrefix = config.events.prefix;
    var mainEl;
    var analytics;
    var apiBaseUrl = config.api_base_url;
    var productsEndpoint = apiBaseUrl + '/videos/' + config.clicked + '/products';
    var baseUrl = config.baseUrl;
    var skeletonEl = document.getElementById('skeleton');

    function pkTrack(){
        analytics.track('pk',{
            vd: Utils.attr(this,'data-vd'),
            ct: this.id.split('-').pop(),
            pg: config.channelId
        });
    }

    function onPlayerResize(initial, size){
      Utils.sendMessage({
          event: eventPrefix + ':widget_modal_resize',
          //height: getWidgetHeight() + 'px'
      });
    }

    function onPlayerNext(next){
        // if (config.merchandise && next) {
        //     loadProducts(next.assetId, function(data){
        //         render(data);
        //     });
        // }

        // Utils.sendMessage({
        //     event: eventPrefix + ':player_next',
        //     next: next
        // });
    }

    function initPlayer(){
        var playerConfig = Utils.copy(config);

        playerConfig.data = config.channel.videos;
        playerConfig.onResize = onPlayerResize;
        playerConfig.onNext = onPlayerNext;

        var player = new Player('player-el', playerConfig, config.clicked);
        
        player.initialize();
    };

    function initAnalytics(){
        analytics =  new Analytics();
        analytics.initConfig({
            domain: location.hostname || '',
            logUrl: apiBaseUrl + '/__tvpa.gif',
            loginId: config.loginId,
            firstPartyCookies: config.firstpartycookies,
            cookieDomain: config.cookiedomain
        });
        analytics.track('ci', {
            li: config.loginId
        });
    };

    function initProducts(style){
        if (!config.merchandise) {
            return;
        }

        // We set the height of the player to the products element, we also do this on player resize, we
        // want the products scroller to have the same height as the player.
        style = style || 'default';

        var templates = config.templates.mobile.modal;

        if('default' === style){
          productsCarousel = new Carousel('products',{
            clean: true,
            loadMore: false,
            endpoint: productsEndpoint,
            params: {
              o: config.products_order_by,
              od: config.products_order_direction
            },
            slidesToShow: 4,
            slidesToScroll: 1,
            itemsTarget: '.slick-carousel',
            templates: {
              list: templates.products.list,
              item: templates.products.item
            },
            parse: function(item){
              item.title = Utils.trimText(item.title || '', 35);
              item.price = Utils.trimPrice(item.price || '');
              item.actionText = item.actionText || 'View Details';
              return item;
            },
            onReady:function(){
              Utils.remove(skeletonEl.querySelector('.products-skel-delete'));
            },
            //onResize:onWidgetResize,
            responsive: [
              {
                breakpoint: 499,
                settings: {
                  slidesToShow: 4,
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
    }

    function loadLib(url, callback){
        $.ajax({
            dataType: 'script',
            cache: true,          
            url: url
        }).done(callback);
    }
    
    var depsCheck = 0;
    var deps = ['jQuery', 'Utils', 'Analytics', 'Carousel', 'Player'];

    (function initModal() {
        setTimeout(function() {
            if(config.debug){
                console.log('deps poll...');
            }
        
        var ready = true;
        var missing;
        for (var i = 0; i < deps.length; i++){
          var dep =  deps[i];

          if ('undefined' === typeof window[dep]){
            ready = false;

            missing = dep;
          }
        }

        if(ready){
          function onBSUtilLoad(){
              loadLib(baseUrl + '/bootstrap/js/modal.js', onBSModalLoad);
          }

          function onBSModalLoad(){
              var $modalEl = $('#modalElement');

              $modalEl.on('shown.bs.modal', function(e){
                  initPlayer();
                  initProducts();
                  initAnalytics();
              });

              $modalEl.on('hidden.bs.modal', function(e){
                  Utils.sendMessage({
                      event: eventPrefix + ':widget_modal_close'
                  });
              });

              $modalEl.modal('show');

              Utils.sendMessage({
                  event: eventPrefix + ':widget_modal_initialized'
              });
          }

          loadLib(baseUrl + '/bootstrap/js/util.js', onBSUtilLoad);

        }else if(++depsCheck < 200){
            initModal()
        }else{
          console.log("missing: ", missing);
        }
        },10);
    })();

    //we check when critical css has loaded/parsed. At this step, we have data to
    //update the skeleton. We wait until css has really executed in order to send
    //the right measurements.
    var cssLoadedCheck = 0;
    var cssLoadedCheckLimit = 1000;

    (function cssPoll() {
        setTimeout(function() {
          console.log('css loaded poll...');
          
          if('hidden' === Utils.getStyle(Utils.getById('bs-checker'), 'visibility')){
            //add widget title
            // var widgetTitleEl = Utils.getById('widget-title');
            // widgetTitleEl.innerHTML = firstVideo.title;
            // Utils.addClass(widgetTitleEl, 'ready');

            skeletonEl.classList.remove('hide');

          }else if(++cssLoadedCheck < cssLoadedCheckLimit){
            cssPoll()
          }
        },50);
    })();

}());





// (function() {
//   var body = document.body;
//   var id = body.getAttribute("data-id") || "";
//   var config = window.parent.__TVPage__.config[id];
//   var templates = config.templates.mobile;
//   var apiBaseUrl = config.api_base_url;
//   var mainEl;
//   var eventPrefix = config.events.prefix;
//   var productsEndpoint = apiBaseUrl + '/videos/' + config.clicked + '/products';
//   var productsCarousel;
  
//   function onWidgetResize(){
//     Utils.sendMessage({
//       event: eventPrefix + ':widget_modal_resize',
//       height: getWidgetHeight() + 'px'
//     });
//   }

//   function getBodyPadding(){
//     var bodyProps = [
//       'padding-top',
//       'padding-bottom'
//     ];
    
//     var padding = 0;

//     for (var i = 0; i < bodyProps.length; i++) {
//       padding += parseInt(Utils.getStyle(body, bodyProps[i]));
//     }

//     return padding;
//   }

//   function getWidgetHeight() {
//     var height = Math.floor(mainEl.getBoundingClientRect().height);

//     return height + getBodyPadding();
//   }

//   function initProducts() {
//     function parseProducts(item){
//       item.title = Utils.trimText(item.title || '', 35);
//       item.price = Utils.trimPrice(item.price || '');
//       item.actionText = item.actionText || 'View Details';
//       return item;
//     }

//     productsCarousel = new Carousel('products',{
//       clean: true,
//       loadMore: false,
//       endpoint: productsEndpoint,
//       params: {
//         o: config.products_order_by,
//         od: config.products_order_direction
//       },
//       slidesToShow: 1,
//       slidesToScroll: 1,
//       itemsTarget: '.slick-carousel',
//       templates: {
//         list: templates.modal.products.list,
//         item: templates.modal.products.item
//       },
//       parse: parseProducts,
//       onResize:onWidgetResize,
//       responsive: [
//         {
//           breakpoint: 499,
//           settings: {
//             slidesToShow: 1,
//             slidesToScroll: 1
//           }
//         },
//         {
//           breakpoint: 767,
//           settings: {
//             slidesToShow: 2,
//             slidesToScroll: 2
//           }
//         }
//       ]
//     }, config);

//     productsCarousel.initialize();
//     productsCarousel.load('render');
//   }

//   function onPlayerNext(next) {
//     if (config.merchandise && next) {
//       productsCarousel.endpoint = apiBaseUrl + '/videos/' + next.assetId + '/products';
//       productsCarousel.load('render');
//     }

//     Utils.sendMessage({
//       event: eventPrefix + ':player_next',
//       next: next
//     });
//   }

//   function initPlayer() {
//     var playerConfig = Utils.copy(config);

//     playerConfig.data = config.channel.videos;
//     playerConfig.onResize = onWidgetResize;
//     playerConfig.onNext = onPlayerNext;

//     var player = new Player('tvp-player-el', playerConfig, config.clicked);

//     player.initialize();
//   };

//   function initAnalytics() {
//     analytics = new Analytics();

//     analytics.initConfig({
//       domain: location.hostname || '',
//       logUrl: apiBaseUrl + '/__tvpa.gif',
//       loginId: config.loginId,
//       firstPartyCookies: config.firstpartycookies,
//       cookieDomain: config.cookiedomain
//     });
//   };

//   var depsCheck = 0;
//   var deps = ['TVPage', 'jQuery', 'Utils', 'Analytics', 'Carousel', 'Player'];

//   (function initModal() {
//     setTimeout(function() {
//       if (config.debug) {
//         console.log('deps poll...');
//       }

//       var ready = true;
//       var depsLength = deps.length;

//       for (var i = 0; i < depsLength; i++)
//         if ('undefined' === typeof window[deps[i]])
//           ready = false;

//       if (ready) {
//         mainEl = Utils.getById(id);

//         initPlayer();
//         initAnalytics();
//         initProducts();

//       } else if (++depsCheck < 200) {
//         initModal()
//       }
//     }, 10);
//   })();

// }());