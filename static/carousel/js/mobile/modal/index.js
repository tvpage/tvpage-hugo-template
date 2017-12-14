(function() {
    var config = window.parent.__TVPage__.config[Utils.attr(document.body, 'data-id')];
    var clickedVideo;
    var eventPrefix = config.events.prefix;
    var modalResizeEvent = eventPrefix + ':widget_modal_resize';
    var playerChangeEvent = eventPrefix + ':widget_player_change';
    var modalCloseEvent = eventPrefix + ':widget_modal_close';
    var modalOpenEvent = eventPrefix + ':widget_modal_open';
    var modalInitializedEvent = eventPrefix + ':widget_modal_initialized';
    var player;
    var productsCarousel;
    var analytics;
    var apiBaseUrl = config.api_base_url;
    var loginId = config.loginId;
    var productsEnabled = config.merchandise;
    var skeletonEl = Utils.getById('skeleton');
    var isFirstVideoPlay = true;
    var isFirstPlayButtonClick = true;
  
    //we check when critical css has loaded/parsed. At this step, we have data to
    //update the skeleton. We wait until css has really executed in order to send
    //the right measurements.
    Utils.poll(function(){
      return 'hidden' === Utils.getStyle(Utils.getById('bscheck'), 'visibility');
    },
    function(){
      Utils.addClass(skeletonEl, 'ready');
    });
  
    //TODO
    // function pkTrack(){
    //   analytics.track('pk', {
    //     vd: Utils.attr(this, 'data-vd'),
    //     ct: this.id.split('-').pop(),
    //     pg: config.channelId
    //   });
    // }
  
    function buildProductsEndpoint(videoId) {
      return apiBaseUrl + '/videos/' + videoId + '/products'
    }

    function initPlayer() {
      function onPlayerResize(){
        Utils.sendMessage({
          event: modalResizeEvent
        });
      }
  
      function onPlayerNext(nextVideo){
        modal.updateTitle(nextVideo.assetTitle);
        
        if(productsEnabled){
          productsCarousel.endpoint = buildProductsEndpoint(nextVideo.assetId);
          productsCarousel.load('render');
        }
      }
  
      function onPlayerChange(e, asset){
        Utils.sendMessage({
          event: playerChangeEvent,
          e: e,
          stateData : asset
        });
  
        //need to change this approach as on mobile we do not have autoplay
        if("tvp:media:videoplaying" === e && isFirstVideoPlay){
          isFirstVideoPlay = false;
    
          Utils.profile(config, {
            metric_type: 'video_playing',
            metric_value: Utils.now('parent') - config.profiling['video_playing'].start
          });
        }
      }
  
      function onPlayerClick(e){
        if(e && e.target){
          var target = Utils.getRealTargetByClass(e.target, 'tvplayer-playbutton');
            
          if(target && isFirstPlayButtonClick){
            isFirstPlayButtonClick = false;
            
            config.profiling['video_playing'] = {
              start: Utils.now('parent')
            }
          }
        }
      }

      var playerConfig = Utils.copy(config);
  
      playerConfig.data = config.channel.videos;
      playerConfig.onResize = onPlayerResize;
      playerConfig.onNext = onPlayerNext;
      playerConfig.onChange = onPlayerChange;
      playerConfig.onClick = onPlayerClick;
  
      player = new Player('player-el', playerConfig, clickedVideo.id);
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
  
    function initProducts(style) {
      if (!productsEnabled) {
        return;
      }

      function removeProductsSkelEl() {
        Utils.remove(skeletonEl.querySelector('.products-skel-delete'));
      }
  
      // We set the height of the player to the products element, we also do this on player resize, we
      // want the products scroller to have the same height as the player.
      style = style || 'default';
  
      var templates = config.templates.mobile.modal;
  
      if ('default' === style) {
        productsCarousel = new Carousel('products',{
          clean: true,
          loadMore: false,
          endpoint: buildProductsEndpoint(clickedVideo.id),
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

    function initModal(){
      function onModalShow(){
        if(player)
          player.play(clickedVideo.id);
      }
  
      function onModalShown(){
        if(player){
          player.resize();
        }else{
          initPlayer();
        }
  
        if(productsCarousel){
          productsCarousel.endpoint = apiBaseUrl + '/videos/' + clickedVideo.id + '/products';
          productsCarousel.load('render');
        }else{
          initProducts();
        }
  
        if(!analytics){
          initAnalytics();
        }
  
        Utils.profile(config, {
          metric_type: 'modal_ready',
          metric_value: Utils.now('parent') - config.profiling['modal_ready'].start
        });
      }
  
      function onModalHidden(){
        player.instance.stop();
  
        Utils.sendMessage({
          event: modalCloseEvent
        });
      }
  
      modal = new Modal('modal', {
        onShow: onModalShow,
        onShown: onModalShown,
        onHidden: onModalHidden
      }, config);
  
      modal.initialize();
    }

    Utils.globalPoll(
      ['jQuery', 'Utils', 'Analytics', 'Carousel', 'Modal', 'Player'],
      function(){
        initModal();
        
        window.parent.addEventListener('message', function(e){
          if(Utils.isEvent(e) && e.data.event === modalOpenEvent){
            var videos = config.channel.videos;
            
            if(player){
              player.addAssets(videos);
            }
        
            clickedVideo = videos.filter(function(video){
              return e.data.clicked == video.id;
            }).pop();
        
            if(clickedVideo){
              modal.updateTitle(clickedVideo.title);
              modal.show();
            }else{
              throw new Error("video not found in data");
            }
          }
        });

        Utils.sendMessage({
          event: modalInitializedEvent
        });
    });
  }());