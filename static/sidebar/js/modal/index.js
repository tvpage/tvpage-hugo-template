(function(window,document){

  var analytics,
      channelId;

  var pkTrack = function(){
    analytics.track('pk',{
      vd: this.getAttribute('data-vd'),
      ct: this.id.split('-').pop(),
      pg: channelId
    });
  };
	
	var isset = function(o,p){
		return 'undefined' !== typeof o[p];
	};

  var getbyClass = function(c){
    return document.getElementsByClassName(c || '')[0];
  };

  var loadProducts = function(videoId,loginId,fn){
    if (!videoId) return;
    var src = '//api.tvpage.com/v1/videos/' + videoId + '/products?X-login-id=' + loginId;
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
    var container = getbyClass('tvp-products');
    var dataCount = data.length;
    var thumbsFrag = document.createDocumentFragment();
    var popupsFrag = document.createDocumentFragment();
    
    for (var i = 0; i < data.length; i++) {
      var product = data[i];
      var productId = product.id;
      var productLink = product.linkUrl;
      var productImgStyle = 'style="background-image:url(\''+product.imageUrl+'\');"';
      var productVideoId = product.entityIdParent;
      var fixedPrice = '';
      var prodTitle = product.title || '';
      
      var prodNode = document.createElement('a');
      prodNode.classList.add('tvp-product');
      prodNode.id = 'tvp-product-' + productId;
      prodNode.setAttribute('data-vd', productVideoId);
      prodNode.href = productLink;
      prodNode.innerHTML = '<div class="tvp-product-image" '+productImgStyle+'><div/>';
      thumbsFrag.appendChild(prodNode);
      
      //we want to remove all special character, so they don't duplicate
      //also we shorten the lenght of long titles and add 3 point at the end
      if (prodTitle || product.price) {
        prodTitle = prodTitle.length > 50 ? prodTitle.substring(0, 50) + "...":prodTitle;
        var price = product.price.toString().replace(/[^0-9.]+/g, '');
        price = parseFloat(price).toFixed(2);
        fixedPrice = price > 0 ? ('$' + price):'';
      }

      var prodPopupNode = document.createElement('a');
      prodPopupNode.classList.add('tvp-product-popup');
      prodPopupNode.id = 'tvp-product-popup-' + productId;
      prodPopupNode.setAttribute('data-vd', productVideoId);
      prodPopupNode.href = productLink;
      prodPopupNode.innerHTML = '<div class="tvp-product-popup-image" '+productImgStyle+'></div>'+
      '<p class="tvp-product-title">'+prodTitle+'<span class="tvp-tooltip">'+product.title+'</span></p><div class="tvp-clearfix"><p class="tvp-product-price">'+fixedPrice+'</p></div>'+
      '<button class="tvp-product-cta">View Details</button>';
      popupsFrag.appendChild(prodPopupNode);

      analytics.track('pi',{
        vd: productVideoId,
        ct: productId,
        pg: channelId
      });
    }

    var classNames = ['tvp-product', 'tvp-product-popup'];
    for (var i = 0; i < classNames.length; i++) {
      var elements = container.getElementsByClassName(classNames[i]);
      for (var j = 0; j < elements.length; j++) {
        elements[j].removeEventListener('click', pkTrack, false);
      }
    }

    container.innerHTML = '';
    
    var arrow = document.createElement('div');
    arrow.classList.add('tvp-arrow-indicator');
    thumbsFrag.appendChild(arrow);

    container.appendChild(thumbsFrag);
    container.parentNode.appendChild(popupsFrag);

    setTimeout(function(){
      
      var holder = getbyClass('tvp-products-holder');
      var classNames = ['tvp-product', 'tvp-product-popup'];
      for (var i = 0; i < classNames.length; i++) {
        var elements = holder.getElementsByClassName(classNames[i]);
        for (var j = 0; j < elements.length; j++) {
          elements[j].addEventListener('click', pkTrack, false);
        }
      }
      holder.onmouseover = function(e){
        if (!e.target.classList.contains('tvp-product-image')) return;
        var activePopups = document.querySelectorAll('.tvp-product-popup.active');
        for (var i = activePopups.length - 1; i >= 0; i--) {
          activePopups[i].classList.remove('active');
        }
        
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
      };

      holder.onmouseleave = function(e){
        var activeThumbs = document.querySelectorAll('.tvp-product.active');
        for (var i = activeThumbs.length - 1; i >= 0; i--) {
          activeThumbs[i].classList.remove('active');
        }
        
        arrow.classList.remove('active');

        var activePopups = document.querySelectorAll('.tvp-product-popup.active');
        for (var i = activePopups.length - 1; i >= 0; i--) {
          activePopups[i].classList.remove('active');
        }
      }
    },0);

  };

  var initialize = function(){
    var el = getbyClass('iframe-content');
    var products = getbyClass('tvp-products-holder');
    var resizeProducts = function(height){
      products.style.height = height + 'px';
    };

    var player = getbyClass('tvp-player-holder');
    resizeProducts(player.offsetHeight);

    var initPlayer = function(data){
      var s = JSON.parse(JSON.stringify(data.runTime));
      s.data = data.data;

      s.onResize = function(size){
        resizeProducts(size[1]);
        if (window.parent && window.parent.parent) {
          window.parent.parent.postMessage({
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
              },0);
          });
        }
        
        if (window.parent && window.parent.parent) {
          window.parent.parent.postMessage({
            event: 'tvp_sidebar:player_next',
            next: next
          }, '*');
        }
      };

      var player = new Player('tvp-player-el',s,data.selectedVideo.id);
      window.addEventListener('resize', Utils.debounce(function(){
        player.resize();
      },85));
    };

    window.addEventListener('message', function(e){
      if (!e || !isset(e, 'data') || !isset(e.data, 'event')) return;
      var data = e.data;
      
      if ('_tvp_sidebar_modal_data' === data.event) {
        initPlayer(data);
        
        var loginId = data.runTime.loginid || data.runTime.loginId;
        channelId = data.runTime.channel.id;
        
        analytics =  new Analytics();
        analytics.initConfig({
          logUrl: '\/\/api.tvpage.com\/v1\/__tvpa.gif',
          domain: isset(location,'hostname') ?  location.hostname : '',
          loginId: loginId
        });

        var selectedVideo = data.selectedVideo;
        if (Utils.isset(selectedVideo,'products')) {
          render(selectedVideo.products);
        } else {
          loadProducts(
            selectedVideo.id,
            loginId,
            function(data){
              setTimeout(function(){
                render(data);
              },0);
          });
        }
      }
    });

    setTimeout(function(){
      if (window.parent && window.parent.parent) {
        window.parent.parent.postMessage({
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