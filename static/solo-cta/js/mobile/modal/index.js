(function () {
  var config = window.parent.__TVPage__.config[Utils.attr(document.body, 'data-id')];
  var clickedVideo;
  var player;
  var analytics;
  var apiBaseUrl = config.api_base_url;
  var loginId = config.loginId;
  var productsEnabled = config.merchandise;
  var isFirstVideoPlay = true;
  var isFirstPlayButtonClick = true;
  var productsSkeletonEl;
  var productsCarousel;
  var productsCarouselEl;

  function productClickTrack(product) {
    if(product){
      analytics.track('pk', {
        vd: product.entityIdParent,
        ct: product.id,
        pg: config.channelId
      }); 
    }
  }

  function productImpressionsTracking(data) {
    var dataLength = data.length;
    var product;
    var i;

    for (i = 0; i < dataLength; i++) {
      product = data[i];

      analytics.track('pi', {
        vd: product.entityIdParent,
        ct: product.id,
        pg: config.channelId
      });
    }
  }

  function initPlayer() {
    function onPlayerResize() {
      Utils.sendMessage({
        event: config.events.modal.resize
      });
    }

    function onPlayerNext(nextVideo) {
      modal.updateTitle(nextVideo.assetTitle);

      if (productsEnabled) {
        productsCarousel.endpoint = apiBaseUrl + '/videos/' + nextVideo.assetId + '/products';
        productsCarousel.load('render', productImpressionsTracking);
      }
    }

    function onPlayerChange(e, asset) {
      Utils.sendMessage({
        event: config.events.player.change,
        e: e,
        stateData: asset
      });

      //need to change this approach as on mobile we do not have autoplay
      if ("tvp:media:videoplaying" === e && isFirstVideoPlay) {
        isFirstVideoPlay = false;

        config.profiling['video_playing'] = Utils.now('parent') - config.profiling['video_playing'].start;

        //send the profile log of the collected metrics
        Utils.sendProfileData(config);
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

    player = new Player('player-el', {
      startWith: clickedVideo.id,
      data: config.channel.videos,
      onResize: onPlayerResize,
      onNext: onPlayerNext,
      onChange: onPlayerChange,
      onClick: onPlayerClick
    }, config);

    player.initialize();
  };

  function initAnalytics() {
    analytics = new Analytics({
      domain: location.hostname
    }, config);

    analytics.initialize();
  };

  function initProducts(style) {
    if (!productsEnabled) {
      return;
    }

    //track product click with delegation
    document.addEventListener('click', function (e) {
      var target = Utils.getRealTargetByClass(e.target, 'product');
      var targetId = target ? (Utils.attr(target, 'data-id') || null) : null;

      if (targetId) {
        productClickTrack(productsCarousel.getDataItemById(targetId));
      }
    }, false);

    function removeProductsSkelEl() {
      Utils.remove(productsSkeletonEl);
    }

    // We set the height of the player to the products element, we also do this on player resize, we
    // want the products scroller to have the same height as the player.
    style = style || 'default';

    var templates = config.templates.mobile.modal;

    if ('default' === style) {
      productsCarousel = new Carousel('products', {
        clean: true,
        loadMore: false,
        endpoint: apiBaseUrl + '/videos/' + clickedVideo.id + '/products',
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
        dotsClass: 'col py-3',
        templates: {
          list: templates.products.list,
          item: templates.products.item
        },
        parse: function (item) {
          item.title = Utils.trimText(item.title || '', 35);
          item.price = Utils.trimPrice(item.price || '');
          item.actionText = item.actionText || 'View Details';
          item.brand = item.brand || '';

          return item;
        },
        onNoData: removeProductsSkelEl,
        onRender: function () {
          setTimeout(function () {
            productsCarouselEl.style.height = 'auto';

            Utils.removeClass(productsCarouselEl, 'hide');
          }, 0);
        },
        onReady: function () {
          removeProductsSkelEl();

          Utils.removeClass(productsCarouselEl, 'hide-abs');
        },
        responsive: [{
          breakpoint: 1024,
          settings: {
            arrows: false,
            dots: true,
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }]
      }, config);

      productsCarousel.initialize();

      productsCarouselEl = productsCarousel.el;

      productsCarousel.load('render', function (data) {
        //delayed 1st pi track
        setTimeout(function () {
          productImpressionsTracking(data);
        }, 3000);
      });
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

      if (productsCarousel) {
        productsCarousel.endpoint = apiBaseUrl + '/videos/' + clickedVideo.id + '/products';
        productsCarousel.load('render', function(data){
          //delayed track for perf
          setTimeout(function () {
            productImpressionsTracking(data);
          }, 3000);
        });
      } else {
        initProducts();
      }

      if (!analytics) {
        initAnalytics();
      }

      config.profiling['modal_ready'] = Utils.now('parent') - config.profiling['modal_ready'].start;
    }

    function onModalHide() {
      productsCarouselEl.style.height = productsCarouselEl.offsetHeight + 'px';

      Utils.addClass(productsCarouselEl, 'hide');
    }

    function onModalHidden() {
      if (player && player.instance)
        player.instance.stop();

      Utils.sendMessage({
        event: config.events.modal.close
      });
    }

    modal = new Modal('modal', {
      onShow: onModalShow,
      onShown: onModalShown,
      onHide: onModalHide,
      onHidden: onModalHidden
    }, config);

    modal.initialize();
  }

  Utils.globalPoll(
    ['jQuery', 'Analytics', 'Carousel', 'Modal', 'Player'],
    function () {
      initModal();

      productsSkeletonEl = Utils.getById('skeleton').querySelector('.products-skel-delete');

      window.parent.addEventListener('message', function (e) {
        if (Utils.isEvent(e) && e.data.event === config.events.modal.open) {
          if(videoOnly){
            clickedVideo = config.video;

            if (player) {
              player.addAssets([clickedVideo]);
            }
          }else{
            var videos = config.channel.videos;

            if (player) {
              player.addAssets(videos);
            }

            clickedVideo = videos.filter(function (video) {
              return e.data.clicked == video.id;
            }).pop();
          }

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