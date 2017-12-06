(function() {
  var body = document.body;
  var id = body.getAttribute('data-id');
  var config = window.parent.__TVPage__.config[id];
  var videos = config.channel.videos;
  var clickedVideoId = config.clicked;
  var clickedVideo;
  var eventPrefix = config.events.prefix;
  var mainEl;
  var productsRail;
  var analytics;
  var apiBaseUrl = config.api_base_url;
  var baseUrl = config.baseUrl;
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
    if (size && size.length > 1 && productsRail && productsRail.railEl) {
      productsRail.railEl.style.height = size[1];
    }

    Utils.sendMessage({
      event: eventPrefix + ':widget_modal_resize'
    });
  }

  function updateModalTitle(title) {
    document.getElementById('modalElementTitle').innerHTML = title || '';
  }

  function onPlayerNext(nextVideo) {
    if (!config.merchandise) {
      return;
    }

    updateModalTitle(nextVideo.assetTitle);

    productsRail.endpoint = apiBaseUrl + '/videos/' + nextVideo.assetId + '/products';
    productsRail.load('render');
  }

  function initPlayer() {
    var playerConfig = Utils.copy(config);

    playerConfig.data = videos;
    playerConfig.onResize = onPlayerResize;
    playerConfig.onNext = onPlayerNext;

    var player = new Player('player-el', playerConfig, clickedVideoId);

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

    //both rail elements and pop overs have to be relative to this.el
    function getPopOverTop(railItemEl, popOverEl, rectify) {
      rectify = rectify || true;

      //we must take the top value reative to the document because we will scroll and move the position of the rail element
      var railItemElTop = railItemEl.getBoundingClientRect().top;

      //now we need to pull the measure to be relative to this.el
      railItemElTop -= Math.floor(productsRail.el.getBoundingClientRect().top);

      var railHeight = productsRail.el.offsetHeight || productsRail.el.getBoundingClientRect().height;

      var popOverTop = railItemElTop;
      var popPoverBottom = popOverTop + popOverEl.getBoundingClientRect().height;

      if (!rectify) {
        return popOverTop;
      }

      if (popOverTop <= 0) {
        popOverTop = 0;
      } else if (popPoverBottom > railHeight) {
        popOverTop -= popPoverBottom - railHeight;
      }

      return popOverTop;
    }

    function hideAllPopOvers() {
      productsRail.el.querySelectorAll('.pop-over.active').forEach(function(item) {
        Utils.removeClass(item, 'active');
      });

      var popOverPointerEl = productsRail.el.querySelector('.pop-over-pointer');

      if (popOverPointerEl) {
        Utils.removeClass(popOverPointerEl, 'active');
      }
    }

    function renderPopOver(railEl, product) {
      var productPopOverEl = Utils.createEl('div');

      productPopOverEl.id = 'pop-over-' + product.id;
      productPopOverEl.className = 'pop-over';
      productPopOverEl.innerHTML = Utils.tmpl(templates.products.itemPopOver, product);

      productsRail.el.appendChild(productPopOverEl);
      productPopOverEl.style.top = getPopOverTop(railEl, productPopOverEl);
      Utils.addClass(productPopOverEl, 'active');
    }

    function renderPopOverPointer(railEl, product) {
      var popOverPointerEl = Utils.createEl('div');
      popOverPointerEl.className = 'pop-over-pointer';

      productsRail.el.appendChild(popOverPointerEl);
      popOverPointerEl.style.top = getPopOverTop(railEl, popOverPointerEl);
      Utils.addClass(popOverPointerEl, 'active');
    }

    function onProductsItemOver(e) {
      hideAllPopOvers();

      var target = Utils.getRealTargetByClass(e.target, 'rail-item');
      var product = productsRail.getDataItemById(target.getAttribute('data-id'));

      if (!product) {
        return;
      }

      var productPopOverEl = Utils.getById('pop-over-' + product.id);

      if (productPopOverEl) {
        productPopOverEl.style.top = getPopOverTop(target, productPopOverEl);
        Utils.addClass(productPopOverEl, 'active');
      } else {
        renderPopOver(target, product);
      }

      var popOverPointerEl = productsRail.el.querySelector('.pop-over-pointer');

      if (popOverPointerEl) {
        popOverPointerEl.style.top = getPopOverTop(target, popOverPointerEl);
        Utils.addClass(popOverPointerEl, 'active');
      } else {
        renderPopOverPointer(target, product);
      }
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

    if ('default' === style) {
      var templates = config.templates.modal;

      productsRail = new Rail('products', {
        clean: true,
        snapReference: '[rail-ref]',
        endpoint: apiBaseUrl + '/videos/' + clickedVideoId + '/products',
        templates: {
          list: templates.products.list,
          item: templates.products.item
        },
        parse: function(item) {
          var ratingAttrName = config.product_rating_attribute;
          item.rating = item[!!ratingAttrName ? ratingAttrName : 0];

          var reviewsAttrName = config.product_review_attribute;
          item.reviews = item[!!reviewsAttrName ? reviewsAttrName : 0];

          item.title = Utils.trimText(item.title, 50);
          item.price = Utils.trimPrice(item.price);
          item.actionText = item.actionText || 'View Details';
        },
        onNoData: removeProductsSkelEl,
        onReady: removeProductsSkelEl,
        onItemOver: onProductsItemOver,
        onLeave: hideAllPopOvers
      }, config);

      productsRail.init();
      productsRail.load('render');
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
  var deps = ['Utils', 'Analytics', 'Player', 'Ps', 'jQuery'];

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
      }
    }, 10);
  })();

}());
