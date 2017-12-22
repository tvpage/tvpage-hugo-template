(function () {
  var config = window.parent.__TVPage__.config[Utils.attr(document.body, 'data-id')];
  var clickedVideo;
  var modal;
  var player;
  var productsRail;
  var analytics;
  var apiBaseUrl = config.api_base_url;
  var loginId = config.loginId;
  var productsEnabled = config.merchandise;
  var isFirstVideoPlay = true;
  var productRatingAttrName = config.product_rating_attribute;
  var productReviewAttrName = config.product_review_attribute;

  //TODO
  // function pkTrack(){
  //   analytics.track('pk', {
  //     vd: Utils.attr(this, 'data-vd'),
  //     ct: this.id.split('-').pop(),
  //     pg: config.channelId
  //   });
  // }

  function initPlayer() {
    function onPlayerResize(initial, size) {
      if (size && size.length > 1 && productsRail && productsRail.railEl) {
        productsRail.railEl.style.height = size[1];
      }

      Utils.sendMessage({
        event: config.events.modal.resize
      });
    }

    function onPlayerNext(nextVideo) {
      modal.updateTitle(nextVideo.assetTitle);

      if (productsEnabled) {
        productsRail.endpoint = apiBaseUrl + '/videos/' + nextVideo.assetId + '/products';
        productsRail.load('render');
      }
    }

    function onPlayerChange(e, currentAsset) {
      Utils.sendMessage({
        event: config.events.player.change,
        e: e,
        stateData: currentAsset
      });

      if ("tvp:media:videoplaying" === e && isFirstVideoPlay) {
        isFirstVideoPlay = false;

        Utils.profile(config, {
          metric_type: 'video_playing',
          metric_value: Utils.now('parent') - config.profiling['modal_ready'].start
        });
      }
    }

    player = new Player('player-el', {
      startWith: clickedVideo.id,
      data: config.channel.videos,
      onResize: onPlayerResize,
      onNext: onPlayerNext,
      onChange: onPlayerChange
    }, config);

    player.initialize();
  };

  function initAnalytics() {
    analytics = new Analytics({
      domain: location.hostname
    }, config);

    analytics.initialize();
    analytics.track('ci');
  };

  function initProducts(style) {
    if (!productsEnabled) {
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
      productsRail.el.querySelectorAll('.pop-over.active').forEach(function (item) {
        Utils.removeClass(item, 'active');
      });

      Utils.removeClass(productsRail.el.querySelector('.pop-over-pointer'), 'active');
    }

    function renderPopOver(railEl, product) {
      var productPopOverEl = Utils.createEl('div');

      productPopOverEl.id = 'pop-over-' + product.id;
      productPopOverEl.className = 'pop-over product-pop-over';
      productPopOverEl.innerHTML = Utils.tmpl(templates.products.itemPopOver, product);

      productsRail.el.appendChild(productPopOverEl);
      
      productPopOverEl.style.top = getPopOverTop(railEl, productPopOverEl);

      Utils.addClass(productPopOverEl, 'active');
    }

    function renderPopOverPointer(railEl, product) {
      var popOverPointerEl = Utils.createEl('div');
      popOverPointerEl.className = 'pop-over-pointer product-pop-over-pointer';

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
      Utils.remove(Utils.getById('skeleton').querySelector('.products-skel-delete'));
    }

    // We set the height of the player to the products element, we also do this on player resize, we
    // want the products scroller to have the same height as the player.
    style = style || 'default';

    if ('default' === style) {
      var templates = config.templates.modal;

      productsRail = new Rail('products', {
        clean: true,
        snapReference: '[rail-ref]',
        endpoint: apiBaseUrl + '/videos/' + clickedVideo.id + '/products',
        templates: {
          list: templates.products.list,
          item: templates.products.item
        },
        parse: function (item) {
          item.title = Utils.trimText(item.title, 50);
          item.price = Utils.trimPrice(item.price);
          item.actionText = item.actionText || 'View Details'
          item.rating = !!productRatingAttrName ? item[productRatingAttrName] : null;
          item.reviews = !!productReviewAttrName ? item[productReviewAttrName] : null;
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

  function initModal() {
    function onModalShow() {
      if (player)
        player.play(clickedVideo.id);
    }

    function onModalShown() {
      if (player) {
        player.resize();
      } else {
        initPlayer();
      }

      if (productsRail) {
        productsRail.endpoint = apiBaseUrl + '/videos/' + clickedVideo.id + '/products';
        productsRail.load('render');
      } else {
        initProducts();
      }

      if (!analytics) {
        initAnalytics();
      }

      Utils.profile(config, {
        metric_type: 'modal_ready',
        metric_value: Utils.now('parent') - config.profiling['modal_ready'].start
      });
    }

    function onModalHidden() {
      player.instance.stop();

      Utils.sendMessage({
        event: config.events.modal.close
      });
    }

    modal = new Modal('modal', {
      onShow: onModalShow,
      onShown: onModalShown,
      onHidden: onModalHidden
    }, config);

    modal.initialize();
  }

  //global deps check before execute
  Utils.globalPoll(
    ['Utils', 'Analytics', 'Player', 'Modal', 'Ps', 'jQuery'],
    function () {
      initModal();

      window.parent.addEventListener('message', function (e) {
        if (Utils.isEvent(e) && e.data.event === config.events.modal.open) {
          var videos = config.channel.videos;

          if (player) {
            player.addAssets(videos);
          }

          clickedVideo = videos.filter(function (video) {
            return e.data.clicked == video.id;
          }).pop();

          if (clickedVideo) {
            modal.updateTitle(clickedVideo.title);
            modal.show();
          } else {
            throw new Error("video not found in data");
          }
        }
      });

      Utils.sendMessage({
        event: config.events.modal.initialized
      });
    });
}());
