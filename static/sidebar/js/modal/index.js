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
    var frag = document.createDocumentFragment();
    
    for (var i = 0; i < data.length; i++) {
      var product = data[i];
      
      var prodNode = document.createElement('a');
      prodNode.classList.add('tvp-product');
      prodNode.id = 'tvp-product-' + product.id;
      prodNode.href = product.linkUrl;
      prodNode.innerHTML = '<div class="tvp-product-image" style="background-image:url(' + product.imageUrl + ')"><div/>';
      frag.appendChild(prodNode);

      var prodPopupNode = document.createElement('a');
      prodPopupNode.id = 'tvp-product-popup-' + product.id;
      prodPopupNode.classList.add('tvp-product-popup');
      prodPopupNode.href = product.linkUrl;
      prodPopupNode.innerHTML = '<div class="tvp-product-image" style="background-image:url(' + product.imageUrl + ')"><div/>'+
      '<p class="tvp-product-title">'+product.title+'</p><div class="tvp-clearfix"><p class="tvp-product-price"><span>$</span>'+product.price+'</p></div>'+
      '<button class="tvp-product-cta">View Details</button>';
      frag.appendChild(prodPopupNode);
      
    }

    container.innerHTML = '';
    var arrow = document.createElement('div');
    arrow.id = 'tvp-arrow-indicator';
    frag.appendChild(arrow);
    container.appendChild(frag);

    setTimeout(function(){
      var holder = getbyClass('tvp-products-holder');
      
      holder.onmouseover = function(e){
        if (!e.target.classList.contains('tvp-product-image')) return;
        document.querySelectorAll('.tvp-product-popup.active').forEach(function(el){
          console.log(el);
        });
        var productEl = e.target.parentNode;
        var id = productEl.id.split('-').pop();

        productEl.classList.add('active');

        var popup = document.getElementById('tvp-product-popup-'+id);

        var topValue = productEl.offsetTop;
        
        console.log(popup)

        var popupBottomEdge = topValue + popup.offsetHeight;
        
        console.log(topValue, popupBottomEdge)
        
        
      };

      container.onmouseleave = function(){
        console.log('hide');
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

    //Notify when products had been rendered (should we wait?)
    setTimeout(function(){
      if (window.parent && window.parent.parent) {
        window.parent.parent.postMessage({
          event: 'tvp_sidebar:modal_initialized',
          height: (el.offsetHeight + 20) + 'px'
        }, '*');
      }
    },0);

    var initPlayer = function(data){
      var s = JSON.parse(JSON.stringify(data.runTime));
      s.data = data.data;

      s.onResize = function(size){
        resizeProducts(size[1]);
        if (window.parent && window.parent.parent) {
          window.parent.parent.postMessage({
            event: 'tvp_sidebar:modal_rendered',
            height: (el.offsetHeight + 20) + 'px'
          }, '*');
        }
      };

      var player = new Player('tvp-player-el',s,data.selectedVideo.id);

      //Resize player when this window is resized.
      window.addEventListener('resize', Utils.debounce(function(){
        player.resize();
      },100));
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