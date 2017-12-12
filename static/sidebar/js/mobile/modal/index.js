(function() {
  var body = document.body;
  var id = body.getAttribute('data-id');
  var config = window.parent.__TVPage__.config[id];
  var clickedVideo;
  var eventPrefix = config.events.prefix;
  var player;
  var productsCarousel;
  var analytics;
  var apiBaseUrl = config.api_base_url;
  var baseUrl = config.baseUrl;
  var skeletonEl = document.getElementById('skeleton');
  var isFirstVideoPlay = true;
  var isFirstPlayButtonClick = true;

  //we check when critical css has loaded/parsed. At this step, we have data to
  //update the skeleton. We wait until css has really executed in order to send
  //the right measurements.
  var cssLoadedCheck = 0;
  var cssLoadedCheckLimit = 1000;

  (function cssPoll() {
    setTimeout(function() {
      console.log('css loaded poll...');

      var bsCheckerEl = document.getElementById('bscheck');
      var bsCheckerElVisibility = getComputedStyle(bsCheckerEl, null).getPropertyValue('visibility');

      if ('hidden' === bsCheckerElVisibility) {
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

  function onPlayerChange(e, currentAsset){
    Utils.sendMessage({
      event: eventPrefix + ':widget_player_change',
      e: e,
      stateData : currentAsset
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

  function initPlayer() {
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
      if(config.debug){
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

      if(ready){
        function onBootstrapModalLoad(){
          var $modalEl = $('#modal');

          //we need to start the video playback as soon as the modal starts launching to clear the image
          //from the previous video.
          $modalEl.on('show.bs.modal', function(e){
            if(player){
              player.play(clickedVideo.id);
            }
          });

          $modalEl.on('shown.bs.modal', function(e){
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
          });

          $modalEl.on('hidden.bs.modal', function(e){
            $(this).modal('dispose');
            $(this).removeData('bs.modal');

            if(player){
              player.instance.stop();
            }

            Utils.sendMessage({
              event: eventPrefix + ':widget_modal_close'
            });
          });

          $modalEl.modal('hide');

          window.parent.addEventListener('message', function(e){
            if(!Utils.isEvent(e)){
              return;
            }
            
            var eventData = e.data;

            if((eventData.event === eventPrefix + ':widget_modal_open')){
              var videos = config.channel.videos;

              if(player){
                player.addAssets(videos);
              }

              clickedVideo = videos.filter(function(video){
                return e.data.clicked == video.id;
              }).pop();

              if(clickedVideo){
                Utils.getById('modalTitle').innerHTML = clickedVideo.title;
                
                $modalEl.modal('show');
              }else{
                throw new Error("video not found in data");
              }
            }
          });

          Utils.sendMessage({
            event: eventPrefix + ':widget_modal_initialized'
          });
        }

        function onBootstrapUtilLoad(){
          $.ajax({
            dataType: 'script',
            cache: true,
            url: baseUrl + '/bootstrap/js/modal.js'
          }).done(onBootstrapModalLoad);  
        }

        $.ajax({
          dataType: 'script',
          cache: true,
          url: baseUrl + '/bootstrap/js/util.js'
        }).done(onBootstrapUtilLoad);
      } else if (++depsCheck < 200) {
        initModal()
      } else if(config.debug){
        console.log("missing: ", missing);
      }
    }, 10);
  })();

}());