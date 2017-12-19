(function() {
  var config = window.parent.__TVPage__.config[Utils.attr(document.body, 'data-id')];
  var clickedVideo;
  var player;
  var productsCarousel;
  var analytics;
  var apiBaseUrl = config.api_base_url;
  var loginId = config.loginId;
  var productsEnabled = config.merchandise;
  var isFirstVideoPlay = true;
  var isFirstPlayButtonClick = true;

  //TODO
  // function pkTrack(){
  //   analytics.track('pk', {
  //     vd: Utils.attr(this, 'data-vd'),
  //     ct: this.id.split('-').pop(),
  //     pg: config.channelId
  //   });
  // }

  function initPlayer() {
    function onPlayerResize(){
      Utils.sendMessage({
        event: config.events.modal.resize
      });
    }

    function onPlayerNext(nextVideo){
      modal.updateTitle(nextVideo.assetTitle);
      
      if(productsEnabled){
        productsCarousel.endpoint = apiBaseUrl + '/videos/' + nextVideo.assetId + '/products';
        productsCarousel.load('render');
      }
    }

    function onPlayerChange(e, asset){
      Utils.sendMessage({
        event: config.events.player.change,
        e: e,
        stateData : asset
      });

      //need to change this approach as on mobile we do not have autoplay
      if("tvp:media:videoplaying" === e && isFirstVideoPlay){
        isFirstVideoPlay = false;
        
        config.profiling['video_playing'] = Utils.now('parent') - config.profiling['video_playing'].start;
        
        //send the profile log of the collected metrics
        Utils.sendProfileData(config);
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
    analytics.track('ci');
  };

  function initProducts(style) {
    if (!productsEnabled) {
      return;
    }

    function removeProductsSkelEl() {
      Utils.remove(Utils.getById('skeleton').querySelector('.products-skel-delete'));
    }

    // We set the height of the player to the products element, we also do this on player resize, we
    // want the products scroller to have the same height as the player.
    style = style || 'default';

    var templates = config.templates.mobile.modal;

    if ('default' === style) {
      productsCarousel = new Carousel('products',{
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

      config.profiling['modal_ready'] = Utils.now('parent') - config.profiling['modal_ready'].start;
    }

    function onModalHidden(){
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

  Utils.globalPoll(
    ['jQuery', 'Utils', 'Analytics', 'Carousel', 'Modal', 'Player'],
    function(){
      initModal();
      
      window.parent.addEventListener('message', function(e){
        if(Utils.isEvent(e) && e.data.event === config.events.modal.open){
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
        event: config.events.modal.initialized
      });
  });
}());