(function(window, document) {
  var analytics,
    channelId,
    eventName,
    productElements = [],
    eventPrefix = "tvp_" + (document.body.getAttribute("data-id") || "").replace(/-/g, '_');

  var pkTrack = function() {
    analytics.track('pk', {
      vd: this.getAttribute('data-vd'),
      ct: this.id.split('-').pop(),
      pg: channelId
    });
  };

  var checkProducts = function(data, el) {
    if (!data || !data.length) {
      el.classList.add('tvp-no-products');
      eventName = eventPrefix + ':modal_no_products';
      notify();
    } else {
      el.classList.remove('tvp-no-products');
      eventName = eventPrefix + ':modal_products';
      notify();
    }
  };

  var notify = function(argument) {
    setTimeout(function() {
      if (window.parent) {
        window.parent.postMessage({
          event: eventName
        }, '*');
      }
    }, 0);
  };

  var loadProducts = function(videoId, settings, fn) {
    if (!videoId) return;
    var src = settings.api_base_url + '/videos/' + videoId + '/products?X-login-id=' + settings.loginId;
    var cbName = 'tvp_' + Math.floor(Math.random() * 555);
    src += '&callback=' + cbName;
    var script = document.createElement('script');
    script.src = src;
    window[cbName || 'callback'] = function(data) {
      if (data && data.length && 'function' === typeof fn) {
        fn(data);
      } else {
        fn([]);
      }
    };
    document.body.appendChild(script);
  };

  var render = function(data) {
    for (var i = 0; i < productElements.length; i++) {
      productElements[i].addEventListener('click', pkTrack, false);
    }

    var hasData = false;
    if (data && data.length) {
      hasData = true;
    }

    var notify = function() {
      if (window.parent) {
        window.parent.postMessage({
          event: eventPrefix + ':modal' + (hasData ? '' : '_no') + '_products'
        }, '*');
      }
    };

    var el = Utils.getByClass('iframe-content');
    if (hasData) {
      el.classList.remove('tvp-no-products');
      notify();
    } else {
      el.classList.add('tvp-no-products');
      notify();
      return;
    }

    var prodsFrag = document.createDocumentFragment();
    var pfix = 'tvp-product';

    for (var i = 0; i < data.length; i++) {
      var product = data[i];
      product.title = Utils.trimText(product.title || '', 50);
      product.price = Utils.trimPrice(product.price || '');

      var productId = product.id;
      var videoId = product.entityIdParent;

      var prodEl = document.createElement('a');
      prodEl.classList.add('tvp-product');
      prodEl.id = 'tvp-product-' + productId;
      prodEl.setAttribute('data-vd', videoId);
      prodEl.href = product.linkUrl;
      prodEl.innerHTML = '<div class="' + pfix + '-content"><div class="' + pfix + '-image"><div style="background-image:url(' + product.imageUrl + ');"></div></div>' +
        '<p class="' + pfix + '-title">' + product.title + '</p><p class="' + pfix + '-price">' + product.price + '</p>' +
        '<button class="' + pfix + '-cta">View Details</button></div>';
      prodEl.addEventListener('click', pkTrack, false);
      productElements.push(prodEl);

      var prodElHolder = document.createElement('div');
      prodElHolder.appendChild(prodEl);

      prodsFrag.appendChild(prodElHolder);

      analytics.track('pi', {
        vd: videoId,
        ct: productId,
        pg: channelId
      });
    }

    var container = Utils.getByClass('tvp-products');
    container.innerHTML = '';

    var carousel = document.createElement('div');
    carousel.classList.add('tvp-products-carousel');
    carousel.appendChild(prodsFrag);

    container.appendChild(carousel);

    var $el = $(carousel);
    var startSlick = function() {
      setTimeout(function() {
        var config = {
          slidesToSlide: 1,
          slidesToShow: 1,
          arrows: false
        };

        $el.on('init', function() {
          carousel.classList.add('enabled');

          var arrows = document.createDocumentFragment();

          var prev = document.createElement('div');
          prev.className = 'tvp-products-carousel-arrow prev';
          prev.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/><path d="M0-.5h24v24H0z" fill="none"/></svg>';
          prev.addEventListener('click', function() {
            $el.slick('slickPrev');
          });

          var next = document.createElement('div');
          next.className = 'tvp-products-carousel-arrow next';
          next.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/>' +
            '<path d="M0-.25h24v24H0z" fill="none"/></svg>';
          next.addEventListener('click', function() {
            $el.slick('slickNext');
          });

          arrows.appendChild(prev);
          arrows.appendChild(next);
          container.appendChild(arrows)
        });

        $el.slick(config);
      }, 10);
    };

    if (data.length > 1) {
      if ('undefined' === typeof $.fn.slick) {
        $.ajax({
          dataType: 'script',
          cache: true,
          url: document.body.getAttribute('data-domain') + '/carousel/js/vendor/slick-min.js'
        }).done(startSlick);
      } else {
        startSlick();
      }
    } else {
      $el.addClass('initialized');
    }
  };

  var initialize = function() {
    var el = Utils.getByClass('iframe-content');

    var initPlayer = function(data) {
      var s = JSON.parse(JSON.stringify(data.runTime));
      var player = null;

      s.data = data.data;

      s.onResize = function(initial, size) {
        if (window.parent) {
          window.parent.postMessage({
            event: eventPrefix + ':modal_resize',
            height: (el.offsetHeight + 20) + 'px'
          }, '*');
        }
      };

      s.onNext = function(next) {
        if (!next) return;

        data.runTime.loginId = data.runTime.loginId || data.runTime.loginid;

        if (Utils.isset(next, 'products')) {
          render(next.products);
        } else {
          if (!data.runTime.merchandise) {
            el.classList.add('tvp-no-products');
            eventName = eventPrefix + ':modal_no_products';
            notify();
          } else {
            loadProducts(next.assetId, data.runTime, function(products) {
              setTimeout(function() {
                checkProducts(products, el);
                render(products);
                player.resize();
              }, 0);
            });
          }
        }

        if (window.parent) {
          window.parent.postMessage({
            event: eventPrefix + ':player_next',
            next: next
          }, '*');
        }
      };

      player = new Player('tvp-player-el', s, data.selectedVideo.id);
      window.addEventListener('resize', Utils.debounce(function() {
        player.resize();
      }, 85));
    };

    window.addEventListener('message', function(e) {
      if (!e || !Utils.isset(e, 'data') || !Utils.isset(e.data, 'event')) return;
      var data = e.data;

      if (eventPrefix + ':modal_data' === data.event) {

        initPlayer(data);

        var settings = data.runTime;
        settings.loginId = settings.loginId || settings.loginid;

        channelId = Utils.isset(settings.channel) && Utils.isset(settings.channel.id) ? settings.channel.id : (settings.channelId || settings.channelid);
        analytics = new Analytics();

        analytics.initConfig({
          logUrl: settings.api_base_url + '/__tvpa.gif',
          domain: Utils.isset(location, 'hostname') ? location.hostname : '',
          loginId: settings.loginId
        });

        var selectedVideo = data.selectedVideo;
        if (Utils.isset(selectedVideo, 'products')) {
          render(selectedVideo.products);
        } else {
          if (!settings.merchandise) {
            el.classList.add('tvp-no-products');
            eventName = eventPrefix + ':modal_no_products';
            notify();
          } else {
            loadProducts(selectedVideo.id, settings,
              function(products) {
                setTimeout(function() {
                  checkProducts(products, el);
                  render(products);
                }, 0);
              });
          }
        }
      }
    });

    setTimeout(function() {
      if (window.parent) {
        window.parent.postMessage({
          event: eventPrefix + ':modal_initialized',
          height: (el.offsetHeight + 20) + 'px'
        }, '*');
      }
    }, 0);
  };

  var not = function(obj) {
    return 'undefined' === typeof obj
  };
  if (not(window.TVPage) || not(window._tvpa) || not(window.Utils) || not(window.Analytics) || not(window.Player)) {
    var libsCheck = 0;
    (function libsReady() {
      setTimeout(function() {
        if (not(window.TVPage) || not(window._tvpa) || not(window.Utils) || not(window.Analytics) || not(window.Player)) {
          (++libsCheck < 200) ? libsReady(): console.warn('limit reached');
        } else {
          initialize();
        }
      }, 150);
    })();
  } else {
    initialize();
  }

}(window, document));