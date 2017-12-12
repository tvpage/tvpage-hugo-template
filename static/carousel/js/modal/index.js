(function() {
  var body = document.body;
  var id = body.getAttribute('data-id');
  var config = window.parent.__TVPage__.config[id];
  var clickedVideo;
  var eventPrefix = config.events.prefix;
  var player;
  var productsRail;
  var analytics;
  var apiBaseUrl = config.api_base_url;
  var baseUrl = config.baseUrl;
  var skeletonEl = document.getElementById('skeleton');
  var isFirstVideoPlay = true;

  //we check when critical css has loaded/parsed. At this step, we have data to
  //update the skeleton. We wait until css has really executed in order to send
  //the right measurements.
  var cssLoadedCheck = 0;
  var cssLoadedCheckLimit = 1000;

  (function cssPoll(){
    setTimeout(function(){
      console.log('css loaded poll...');

      var bsCheckEl = document.getElementById('bscheck');
      var bsCheckElVisibility = getComputedStyle(bsCheckEl, null).getPropertyValue('visibility');

      if ('hidden' === bsCheckElVisibility) {
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

  function onPlayerNext(nextVideo) {
    if(!config.merchandise){
      return;
    }

    Utils.getById('modalTitle').innerHTML = nextVideo.assetTitle;

    productsRail.endpoint = apiBaseUrl + '/videos/' + nextVideo.assetId + '/products';
    productsRail.load('render');
  }

  function onPlayerChange(e, currentAsset){
    Utils.sendMessage({
      event: eventPrefix + ':widget_player_change',
      e: e,
      stateData : currentAsset
    });

    if("tvp:media:videoplaying" === e && isFirstVideoPlay){
      isFirstVideoPlay = false;

      Utils.profile(config, {
        metric_type: 'video_playing',
        metric_value: Utils.now('parent') - config.profiling['modal_ready'].start
      });
    }
  }

  function initPlayer(){
    var playerConfig = Utils.copy(config);

    playerConfig.data = config.channel.videos;
    playerConfig.onResize = onPlayerResize;
    playerConfig.onNext = onPlayerNext;
    playerConfig.onChange = onPlayerChange;

    player = new Player('player-el', playerConfig, clickedVideo.id);
    player.initialize();
  };

  function initAnalytics(){
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

  function initProducts(style){
    if(!config.merchandise){
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

      Utils.removeClass(productsRail.el.querySelector('.pop-over-pointer'), 'active');
    }

    function renderPopOver(railEl, product){
      var productPopOverEl = Utils.createEl('div');

      productPopOverEl.id = 'pop-over-' + product.id;
      productPopOverEl.className = 'pop-over';
      productPopOverEl.innerHTML = Utils.tmpl(templates.products.itemPopOver, product);

      productsRail.el.appendChild(productPopOverEl);
      productPopOverEl.style.top = getPopOverTop(railEl, productPopOverEl);
      Utils.addClass(productPopOverEl, 'active');
    }

    function renderPopOverPointer(railEl, product){
      var popOverPointerEl = Utils.createEl('div');
      popOverPointerEl.className = 'pop-over-pointer';

      productsRail.el.appendChild(popOverPointerEl);
      popOverPointerEl.style.top = getPopOverTop(railEl, popOverPointerEl);
      Utils.addClass(popOverPointerEl, 'active');
    }

    function onProductsItemOver(e){
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
      Utils.remove(skeletonEl.querySelector('.products-skel-delete'));
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
        parse: function(item) {
          var ratingAttrName = config.product_rating_attribute;
          item.rating = item[!!ratingAttrName ? ratingAttrName : ''];

          var reviewsAttrName = config.product_review_attribute;
          item.reviews = item[!!reviewsAttrName ? reviewsAttrName : ''];

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

  var depsCheck = 0;
  var deps = ['Utils', 'Analytics', 'Player', 'Ps', 'jQuery'];
  var depsLength = deps.length;

  (function initModal(){
    setTimeout(function(){
      if(config.debug){
        console.log('deps poll...');
      }

      var ready = true;
      for (var i = 0; i < depsLength; i++)
        if ('undefined' === typeof window[deps[i]])
          ready = false;

      if(ready){
        function onBootstrapModalLoad(){
          var $modalEl = $('#modal');

          //we need to start the video playback as soon as the modal starts launching to clear the image
          //from the previous video.
          $modalEl.on('show.bs.modal', function(e){
            if(player){
              player.play(clickedVideo.id);
            }

            if(productsRail){
              productsRail.clean();
            }
          });

          $modalEl.on('shown.bs.modal', function(e){
            if(player){
              player.resize();
            }else{
              initPlayer();
            }

            if(productsRail){
              productsRail.endpoint = apiBaseUrl + '/videos/' + clickedVideo.id + '/products';
              productsRail.load('render');
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
              clickedVideo = config.channel.videos.filter(function(video){
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
