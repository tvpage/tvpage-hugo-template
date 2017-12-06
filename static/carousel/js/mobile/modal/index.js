(function() {
    var body = document.body;
    var id = body.getAttribute('data-id');
    var config = window.parent.__TVPage__.config[id];
    var videos = config.channel.videos;
    var clickedVideoId = config.clicked;
    var clickedVideo;
    var eventPrefix = config.events.prefix;
    var mainEl;
    var analytics;
    var apiBaseUrl = config.api_base_url;
    var productsEndpoint = apiBaseUrl + '/videos/' + config.clicked + '/products';
    var baseUrl = config.baseUrl;
    var productsCarousel;
    var skeletonEl = document.getElementById('skeleton');
  
    //we check when critical css has loaded/parsed. At this step, we have data to
    //update the skeleton. We wait until css has really executed in order to send
    //the right measurements.
    var cssLoadedCheck = 0;
    var cssLoadedCheckLimit = 1000;
  
    (function cssPoll() {
      setTimeout(function() {
        console.log('css loaded poll...');
  
        var bsCheckerEl = document.getElementById('bs-checker');
        var bsCheckerElVisibility = getComputedStyle(bsCheckerEl, null).getPropertyValue('visibility');
  
        if ('hidden' === bsCheckerElVisibility) {
          var clickedVideo = videos.filter(function(video) {
            return clickedVideoId == video.id;
          }).pop();
  
          updateModalTitle(clickedVideo.title);
  
          skeletonEl.style.visibility = 'visible';
          skeletonEl.style.opacity = '1';
        } else if (++cssLoadedCheck < cssLoadedCheckLimit) {
          cssPoll()
        }
      }, 50);
    })();
  
    function pkTrack() {
    analytics.track('pk', {
        vd: Utils.attr(this, 'data-vd'),
        ct: this.id.split('-').pop(),
        pg: config.channelId
      });
    }
  
    function onPlayerResize(initial, size) {
      Utils.sendMessage({
        event: eventPrefix + ':widget_modal_resize'
      });
    }
  
    function updateModalTitle(title) {
      if (!title)
        debugger
      document.getElementById('modalElementTitle').innerHTML = title || '';
    }
  
    function onPlayerNext(nextVideo) {
      if (!config.merchandise) {
        return;
      }
  
      updateModalTitle(nextVideo.assetTitle);
  
      productsCarousel.endpoint = apiBaseUrl + '/videos/' + nextVideo.assetId + '/products';
      productsCarousel.load('render');
    }
  
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
        loginId: config.loginId,
        firstPartyCookies: config.firstpartycookies,
        cookieDomain: config.cookiedomain
      });
      analytics.track('ci', {
        li: config.loginId
      });
    };
  
    function initProducts(style) {
      if (!config.merchandise) {
        return;
      }

      function removeProductsSkelEl() {
        var productsSkelEl = skeletonEl.querySelector('.products-skel-delete');
  
        if (productsSkelEl) {
          Utils.remove(productsSkelEl);
        }
      }
  
      // We set the height of the player to the products element, we also do this on player resize, we
      // want the products scroller to have the same height as the player.
      style = style || 'default';
  
      var templates = config.templates.mobile.modal;
  
      if ('default' === style) {
        productsCarousel = new Carousel('products',{
          clean: true,
          loadMore: false,
          endpoint: productsEndpoint,
          params: {
            o: config.products_order_by,
            od: config.products_order_direction
          },
          slidesToShow: 2,
          slidesToScroll: 2,
          itemsTarget: '.slick-carousel',
          arrows: false,
          dots: true,
          dotsCenter: true,
          templates: {
            list: templates.products.list,
            item: templates.products.item
          },
          parse: function(item) {
            item.title = Utils.trimText(item.title || '', 35);
            item.price = Utils.trimPrice(item.price || '');
            item.actionText = item.actionText || 'View Details';
            item.brand = item.brand || '';

            return item;
          },
          onNoData: removeProductsSkelEl,
          onReady: function(){
            removeProductsSkelEl();

            Utils.removeClass(productsCarousel.el, 'hide-abs');
          },
          responsive: [
            {
            breakpoint: 1024,
            settings: {
              arrows: false,
              dots: true,
              slidesToShow: 1,
              slidesToScroll: 1
            }
          }
          ]
        }, config);
  
        productsCarousel.initialize();
        productsCarousel.load('render');
      }
    }
  
    function loadLib(url, callback) {
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
        if (config.debug) {
          console.log('deps poll...');
        }
  
        var ready = true;
        var missing;
        for (var i = 0; i < deps.length; i++) {
          var dep = deps[i];
  
          if ('undefined' === typeof window[dep]) {
            ready = false;
  
            missing = dep;
          }
        }
  
        if (ready) {
          function onBSUtilLoad() {
            loadLib(baseUrl + '/bootstrap/js/modal.js', onBSModalLoad);
          }
  
          function onBSModalLoad() {
            var $modalEl = $('#modalElement');
  
            $modalEl.on('shown.bs.modal', function(e) {
              initPlayer();
              initProducts();
              initAnalytics();
            });
  
            $modalEl.on('hidden.bs.modal', function(e) {
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
        } else if (++depsCheck < 200) {
          initModal()
        } else {
          console.log("missing: ", missing);
        }
      }, 10);
    })();
  
  }());
  