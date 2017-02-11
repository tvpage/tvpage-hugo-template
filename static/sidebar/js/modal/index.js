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
      prodNode.href = product.linkUrl;
      prodNode.innerHTML = '<div class="tvp-product-image" style="background-image:url(' + product.imageUrl + ')"><div/>';
      frag.appendChild(prodNode);
    }

    container.innerHTML = '';
    container.appendChild(frag);

    // var dataCount = products.length,
    //     thumbTmpl = $('#productTemplate').html(),
    //     popupTmpl = $('#productPopupTemplate').html(),
    //     popupHtml = '',
    //     thumbHtml = '';

    // while (dataCount > 0) {
      // var prod = products[dataCount-1];

      //console.log(prod)

      // thumbHtml += utils.tmpl(thumbTmpl, prod);
      // popupHtml += utils.tmpl(popupTmpl, prod);
      // dataCount--;
    // }
    
    // var $products = $el.find('.tvp-products');
    // $products.html(thumbHtml);
    // var $productsHolder = $products.parent();
    // $productsHolder.append(popupHtml);
    
    // setTimeout(function(){

    //   //Notify when products had been rendered (should we wait?)
    //   if (window.parent && window.parent.parent) {
    //     window.parent.parent.postMessage({
    //       event: 'tvp_sidebar:modal_rendered',
    //       height: ($el.height() + 20) + 'px'
    //     }, '*');
    //   }

    //   var $indicator = $productsHolder.find('#tvp-arrow-indicator');
      
    //   $productsHolder.on('mouseleave', function(){
    //     $(this).removeClass('active');
    //     $indicator.css('display','none');
    //     $productsHolder.find('.tvp-product-popup.active').hide();
    //   });
      
    //   $products.on('mouseover', '.tvp-product', function(e){
    //     $productsHolder.find('.tvp-product-popup.active').hide();

    //     var $prodThumbnail = $(this).addClass('active');
    //     var $productPopup = $productsHolder.find('#tvp-product-popup-'+$prodThumbnail.attr('id').split('-').pop());
    //     var topValue = $prodThumbnail.position().top;
    //     var popupBottomEdge = topValue + $productPopup.outerHeight();
        
    //     //We must first check if it's overflowing. To do this we first check if it's overflowing in the top, this is an
    //     //easy one, if it's a negative value then it's overflowing.
    //     if (topValue <= 0) {
    //       topValue = -10;
    //     }
        
    //     //Otherwise if it's failing in the bottom, we rectify by removing the excess from the top value.
    //     else if ( popupBottomEdge > $productsHolder.outerHeight() )  {
    //       topValue = topValue - (popupBottomEdge - $productsHolder.outerHeight()) + 1;
    //       topValue = topValue + 10;
    //     }

    //     //Arrow indicator shall just be aligned to the middile of thumb.
    //     $indicator.css({
    //       top: $prodThumbnail.position().top + 20,
    //       display: 'block'
    //     });
        
    //     $productPopup.css({ top: topValue});
    //     $productPopup.show().addClass('active');

    //   });
    // },5);
  };

  var initialize = function(){
    var el = getbyClass('iframe-content');
    var products = getbyClass('tvp-products-holder');
    var resizeProducts = function(height){
      products.style.height = height + 'px';
    };

    var player = getbyClass('tvp-player-holder');
    resizeProducts(player.offsetHeight);

    if (window.parent && window.parent.parent) {
      window.parent.parent.postMessage({
        event: 'tvp_sidebar:modal_rendered',
        height: (el.offsetHeight + 20) + 'px'
      }, '*');
    }    

    var initPlayer = function(data){
      var s = JSON.parse(JSON.stringify(data.runTime));
      s.data = data.data;

      var player = new Player('tvp-player-el',s,data.selectedVideo.id);

      s.onResize = function(size){
        resizeProducts(size[1]);
        if (window.parent && window.parent.parent) {
          window.parent.parent.postMessage({
            event: 'tvp_sidebar:modal_resized',
            height: (el.offsetHeight + 20) + 'px'
          }, '*');
        }
      };

      window.addEventListener('resize', Utils.debounce(function(){
        player.resize();
      },100));
    };

    window.addEventListener('message', function(e){
      if (!e || !isset(e, 'data') || !isset(e.data, 'event')) return;

      var data = e.data;
      if ('_tvp_sidebar_modal_data' === data.event) {
        console.log('here')  
      }
      
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

    });
  };

  if ('undefined' === typeof window.Player) {
    var libsCheck = 0,
        not = function(obj){return 'undefined' === typeof obj};
    (function libsReady() {
      setTimeout(function() {
        if (not(window.Player) || not(window.Utils)) {
          (++libsCheck < 20) ? libsReady() : console.log('limit reached');
        } else  {
          initialize();
        }
      },100);
    })();
  } else {
    initialize();
  }

}(document));