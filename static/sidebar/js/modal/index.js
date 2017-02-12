(function(document){
	
	var isset = function(o,p){
		return 'undefined' !== typeof o[p];
	};

  var getbyClass = function(c){
    return document.getElementsByClassName(c || '')[0];
  };

  var render = function(data){
    var container = getbyClass('tvp-products');
    var dataCount = data.length;
    var thumbsFrag = document.createDocumentFragment();
    var popupsFrag = document.createDocumentFragment();
    
    for (var i = 0; i < data.length; i++) {
      var product = data[i];
      
      var prodNode = document.createElement('a');
      prodNode.classList.add('tvp-product');
      prodNode.id = 'tvp-product-' + product.id;
      prodNode.href = product.linkUrl;
      prodNode.innerHTML = '<div class="tvp-product-image" style="background-image:url(' + product.imageUrl + ')"><div/>';
      thumbsFrag.appendChild(prodNode);

      var prodPopupNode = document.createElement('a');
      prodPopupNode.id = 'tvp-product-popup-' + product.id;
      prodPopupNode.classList.add('tvp-product-popup');
      prodPopupNode.href = product.linkUrl;
      prodPopupNode.innerHTML = '<div class="tvp-product-popup-image" style="background-image:url(' + product.imageUrl + ');"></div>'+
      '<p class="tvp-product-title">'+product.title+'</p><div class="tvp-clearfix"><p class="tvp-product-price"><span>$</span>'+product.price+'</p></div>'+
      '<button class="tvp-product-cta">View Details</button>';
      popupsFrag.appendChild(prodPopupNode);
      
    }

    container.innerHTML = '';
    var arrow = document.createElement('div');
    arrow.classList.add('tvp-arrow-indicator');
    thumbsFrag.appendChild(arrow);
    container.appendChild(thumbsFrag);

    container.parentNode.appendChild(popupsFrag);

    setTimeout(function(){
      var holder = getbyClass('tvp-products-holder');
      
      holder.onmouseover = function(e){

        if (!e.target.classList.contains('tvp-product-image')) return;
        document.querySelectorAll('.tvp-product-popup.active').forEach(function(el){
          el.classList.remove('active');
        });
        
        var productEl = e.target.parentNode;
        var id = productEl.id.split('-').pop();
        productEl.classList.add('active');

        var popup = document.getElementById('tvp-product-popup-'+id);
        var topValue = productEl.getBoundingClientRect().top;
        popup.classList.add('active');
        var bottomLimit = topValue + popup.offsetHeight;
        var holderHeight = holder.offsetHeight;
        
        //We must first check if it's overflowing. To do this we first check if it's overflowing in the top, this is an
        //easy one, if it's a negative value then it's overflowing.
        if (topValue <= 10) {
          topValue = -10;
        }
        
        //Otherwise if it's failing in the bottom, we rectify by removing the excess from the top value.
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
        document.querySelectorAll('.tvp-product.active').forEach(function(el){
          el.classList.remove('active');
        });
        
        arrow.classList.remove('active');

        document.querySelectorAll('.tvp-product-popup.active').forEach(function(el){
          el.classList.remove('active');
        });
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
        
        var selectedVideo = data.selectedVideo;
        if (Utils.isset(selectedVideo,'products')) {
          render(selectedVideo.products);
        } else {
          var src = '//api.tvpage.com/v1/videos/' + selectedVideo.id + '/products?X-login-id=' + data.runTime.config[el.id].loginid;
          var cbName = 'tvp_' + Math.floor(Math.random() * 555);
          src += '&callback='+cbName;
          var script = document.createElement('script');
          script.src = src;
          window[cbName || 'callback'] = function(data){
            if (!data && !data.length) return console.log('no products');
            setTimeout(function(){
              render(data);
            },0);
            
          };
          document.body.appendChild(script);
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
  if (not(window.Player) || not(window.Utils)) {
    var libsCheck = 0;
    (function libsReady() {
      setTimeout(function() {
        if (not(window.Player) || not(window.Utils)) {
          (++libsCheck < 20) ? libsReady() : console.log('limit reached');
        } else {
          initialize();
        }
      },50);
    })();
  } else {
    initialize();
  }

}(document));