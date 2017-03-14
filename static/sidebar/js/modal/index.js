(function(window,document){

  var analytics,
      channelId,
      apiBaseUrl;

  var pkTrack = function(){
    analytics.track('pk',{
      vd: this.getAttribute('data-vd'),
      ct: this.id.split('-').pop(),
      pg: channelId
    });
  };

  var loadProducts = function(videoId,loginId,fn){    
    if (!videoId) return;
    var src = apiBaseUrl + '/videos/' + videoId + '/products?X-login-id=' + loginId;
    var cbName = 'tvp_' + Math.floor(Math.random() * 555);
    src += '&callback='+cbName;
    var script = document.createElement('script');
    script.src = src;
    window[cbName || 'callback'] = function(data){
      if (data && data.length && 'function' === typeof fn) {
        fn(data);
      } else {
        fn([]);
      }
    };
    document.body.appendChild(script);
  };

  var render = function(data){
    var el = Utils.getByClass('iframe-content');
    var container = Utils.getByClass('tvp-products');
    var hasData = false;

    if (data && data.length){
        hasData = true;
    }

    var notifyState = function () {
        setTimeout(function () {
            if (window.parent) {
                window.parent.postMessage({event: 'tvp_sidebar:modal' + (hasData ? '' : '_no') + '_products'}, '*');
            }
        },0);
    };

    if (hasData) {
        el.classList.remove('tvp-no-products');
        notifyState();
    } else {
        el.classList.add('tvp-no-products');
        notifyState();
        return;
    }

    var thumbsFrag = document.createDocumentFragment();
    var popupsFrag = document.createDocumentFragment();
    
    for (var i = 0; i < data.length; i++) {
      var product = data[i];
      var productId = product.id;
      var productLink = product.linkUrl;
      var productImgStyle = 'style="background-image:url(\''+product.imageUrl+'\');"';
      var productVideoId = product.entityIdParent;
      var prodNode = document.createElement('a');
      prodNode.classList.add('tvp-product');
      prodNode.id = 'tvp-product-' + productId;
      prodNode.setAttribute('data-vd', productVideoId);
      prodNode.href = productLink;
      prodNode.innerHTML = '<div class="tvp-product-image" '+productImgStyle+'><div class="tvp-product-image-overlay"></div></div>';
      thumbsFrag.appendChild(prodNode);

      var prodTitle = product.title || '';
      //shorten the lenght of long titles, we need to set a character limit
      prodTitle = Utils.trimText(prodTitle, 50);
   
      var fixedPrice = product.price || '';
      //remove all special character, so they don't duplicate
      fixedPrice = Utils.trimPrice(fixedPrice);

      var prodPopupNode = document.createElement('a');
      prodPopupNode.classList.add('tvp-product-popup');
      prodPopupNode.id = 'tvp-product-popup-' + productId;
      prodPopupNode.setAttribute('data-vd', productVideoId);
      prodPopupNode.href = productLink;
      prodPopupNode.innerHTML = '<div class="tvp-product-popup-image" '+productImgStyle+'></div>'+
      '<p class="tvp-product-title">'+prodTitle+'</p><div class="tvp-clearfix"><p class="tvp-product-price">'+fixedPrice+'</p></div>'+
      '<button class="tvp-product-cta">View Details</button>';
      popupsFrag.appendChild(prodPopupNode);

      analytics.track('pi',{
        vd: productVideoId,
        ct: productId,
        pg: channelId
      });
    }
  
    var arrow = document.createElement('div');
    arrow.classList.add('tvp-arrow-indicator');
    container.innerHTML = '';
    container.appendChild(thumbsFrag);
    container.parentNode.appendChild(popupsFrag);
    container.parentNode.insertBefore(arrow, container.nextSibling);
    SimpleScrollbar.initEl(container);
    bindPopUpEvent();  
  };

  var bindPopUpEvent = function(){
    var holder = Utils.getByClass('tvp-products-holder'),
        classNames = ['tvp-product', 'tvp-product-popup'],
        arrow = document.querySelectorAll('.tvp-arrow-indicator')[0],
        TimeOut,
        elements;
    showPopUp = function (e) {
      if (!e.target.classList.contains('tvp-product-image')) return;
      removeClass();
      var productEl = e.target.parentNode;
      var id = productEl.id.split('-').pop();
      productEl.classList.add('active');
      var popup = document.getElementById('tvp-product-popup-'+id);
      var topValue = productEl.getBoundingClientRect().top;
      popup.classList.add('active');
      var bottomLimit = topValue + popup.offsetHeight;
      var holderHeight = holder.offsetHeight;

      //We must first check if it's overflowing. To do this we first check if it's overflowing in the top, this is an
      //easy one, if it's a negative value then it's overflowing. Otherwise if it's failing in the bottom, we rectify 
      //by removing the excess from the top value.
      if (topValue <= 10) {
        topValue = -10;
      }
      else if ( bottomLimit > holderHeight )  {
        topValue = topValue - (bottomLimit - holderHeight);
        topValue = topValue + 10;
      }

      popup.classList.add('active');
      popup.style.top = topValue + 'px';

      arrow.classList.add('active');
      arrow.style.top = (productEl.getBoundingClientRect().top + 20) + 'px';
    },

    removeClass = function(){
      for (var i = elements.length; i--;) {
        elements[i].classList.remove('active');
        arrow.classList.remove('active');
      }
    };

    for (var i = 0; i < classNames.length; i++) {
      elements = holder.getElementsByClassName(classNames[i]);
      for (var j = 0; j < elements.length; j++) {
        elements[j].addEventListener('click', pkTrack, false);
        elements[j].onmouseover = function(e){
          clearTimeout(TimeOut);
          showPopUp(e);
        };
        elements[j].onmouseleave = function(){
          TimeOut = setTimeout(function() {
            removeClass();
          }, 100);
        };  
      }
    }
  };
  
  var initialize = function(){
    var el = Utils.getByClass('iframe-content');
    var products = Utils.getByClass('tvp-products-holder');
    var resizeProducts = function(height){
      products.style.height = height + 'px';
    };

    var playerEl = Utils.getByClass('tvp-player-holder');
    resizeProducts(playerEl.offsetHeight);

    var initPlayer = function(data){
      var s = JSON.parse(JSON.stringify(data.runTime));
      var player = null;

      s.data = data.data;

      s.onResize = function(initial, size){
        resizeProducts(size[1]);
        if (window.parent) {
          window.parent.postMessage({
            event: 'tvp_sidebar:modal_resized',
            height: (el.offsetHeight + 20) + 'px'
          }, '*');
        }
      };

      s.onNext = function(next){
        if (!next) return;
        if (Utils.isset(next,'products')) {
          render(next.products);
        } else {
          loadProducts(
            next.assetId,
            data.runTime.loginid,
            function(data){
              setTimeout(function(){
                render(data);
                player.resize();
              },0);
          });
        }
        
        if (window.parent) {
          window.parent.postMessage({
            event: 'tvp_sidebar:player_next',
            next: next
          }, '*');
        }
      };

      player = new Player('tvp-player-el',s,data.selectedVideo.id);
      window.addEventListener('resize', Utils.debounce(function(){
        player.resize();
      },85));
    };

    window.addEventListener('message', function(e){
      if (!e || !Utils.isset(e, 'data') || !Utils.isset(e.data, 'event')) return;
      var eventData = e.data;

      if ('tvp_sidebar:modal_data' === eventData.event) {

        var loginId = eventData.runTime.loginid || eventData.runTime.loginId;
        channelId = eventData.runTime.channel.id || eventData.runTime.channelid;
        apiBaseUrl = eventData.runTime.apiBaseUrl;
        analytics =  new Analytics();
        analytics.initConfig({
            logUrl: '\/\/api.tvpage.com\/v1\/__tvpa.gif',
            domain: Utils.isset(location,'hostname') ?  location.hostname : '',
            loginId: loginId
        });

        var selectedVideo = eventData.selectedVideo;
        if (Utils.isset(selectedVideo,'products')) {
          render(selectedVideo.products);
          initPlayer(eventData);
        } else {
          loadProducts(
            selectedVideo.id,
            loginId,
            function(productsData){
              setTimeout(function(){render(productsData);},0);
              initPlayer(eventData);
          });
        }
      }
    });

    setTimeout(function(){
      if (window.parent) {
        window.parent.postMessage({
          event: 'tvp_sidebar:modal_initialized',
          height: (el.offsetHeight + 20) + 'px'
        }, '*');
      }
    },0);
  };

  var not = function(obj){return 'undefined' === typeof obj};
  if (not(window.TVPage) || not(window._tvpa) || not(window.Utils) || not(window.Analytics) || not(window.Player)) {
    var libsCheck = 0;
    (function libsReady() {
      setTimeout(function(){
        if (not(window.TVPage) || not(window._tvpa) || not(window.Utils) || not(window.Analytics) || not(window.Player)) {
          (++libsCheck < 50) ? libsReady() : console.log('limit reached');
        } else {
          initialize();
        }
      },150);
    })();
  } else {
    initialize();
  }

}(window, document));