(function(document){
	
	var isset = function(o,p){
		return 'undefined' !== typeof o[p];
	};

  var getbyClass = function(c){
    return document.getElementsByClassName(c || '')[0];
  };

  var initialize = function(){
    var el = getbyClass('iframe-content');
    var products = getbyClass('tvp-products-holder');
    var player = getbyClass('tvp-player-holder');

    products.style.height = player.offsetHeight;

    if (window.parent && window.parent.parent) {
      window.parent.parent.postMessage({
        event: 'tvp_sidebar:modal_rendered',
        height: (el.offsetHeight + 20) + 'px'
      }, '*');
    }

    parent.addEventListener('message', function(e){
      if (!e || !isset(e, 'data') || !isset(e.data, 'event')) return;
      
      var data = e.data;
      if ('_tvp_sidebar_modal_data' === data.event) {

        var playerSettings = JSON.parse(JSON.stringify(data.runTime));
        var selectedVideo = data.selectedVideo;

        playerSettings.data = data.data;

        //Need to lock for the initial resize event is happening.
        playerSettings.onResize = function(size){
          products.style.height = size[1] + 'px';
          if (window.parent && window.parent.parent) {
            window.parent.parent.postMessage({
              event: 'tvp_sidebar:modal_resized',
              height: (el.offsetHeight + 20) + 'px'
            }, '*');
          }
        };

        var player = new Player(
          'tvp-player-el',
          playerSettings,
          selectedVideo.id
        );

        window.addEventListener('resize', Utils.debounce(function(){
          player.resize();
        },50));

        if (Utils.isset(selectedVideo,'products')) {
          renderProducts(selectedVideo.products);
        } else {
          console.log( data.runTime.config )
          
          var src = '//api.tvpage.com/v1/videos/' + selectedVideo.id + '/products?X-login-id=';
          var cbName = 'tvp_' + Math.floor(Math.random() * 555);
          src += '&callback='+cbName;
          var script = document.createElement('script');
          script.src = src;
          window[cbName || 'callback'] = function(data){
            console.log(data)
          };
          document.body.appendChild(script);

         //  $.ajax({
         //   type: 'GET',
         //   url: '//api.tvpage.com/v1/videos/' + selectedVideo.id + '/products',
         //   dataType: 'jsonp',
         //   data: {
         //     'X-login-id': settings.loginId
         //   }
         // }).done(function(products){
         //   if (!products && !products.length) return console.log('no products');
         //   renderProducts(products);
         // }); 
        }

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

// (function(document,$, utils){
 
//   var settings = Widget.settings;
//   var $el = $('#' + settings.name);

//   var renderProducts = function(products){
//     var prodCount = products.length,
//         thumbTmpl = $('#productTemplate').html(),
//         popupTmpl = $('#productPopupTemplate').html(),
//         popupHtml = '',
//         thumbHtml = '';

//     while (prodCount > 0) {
//       var prod = products[prodCount-1];
//       thumbHtml += utils.tmpl(thumbTmpl, prod);
//       popupHtml += utils.tmpl(popupTmpl, prod);
//       prodCount--;
//     }
    
//     var $products = $el.find('.tvp-products');
//     $products.html(thumbHtml);
//     var $productsHolder = $products.parent();
//     $productsHolder.append(popupHtml);
    
//     setTimeout(function(){

//       //Notify when products had been rendered (should we wait?)
//       if (window.parent && window.parent.parent) {
//         window.parent.parent.postMessage({
//           event: 'tvp_sidebar:modal_rendered',
//           height: ($el.height() + 20) + 'px'
//         }, '*');
//       }

//       var $indicator = $productsHolder.find('#tvp-arrow-indicator');
      
//       $productsHolder.on('mouseleave', function(){
//         $(this).removeClass('active');
//         $indicator.css('display','none');
//         $productsHolder.find('.tvp-product-popup.active').hide();
//       });
      
//       $products.on('mouseover', '.tvp-product', function(e){
//         $productsHolder.find('.tvp-product-popup.active').hide();

//         var $prodThumbnail = $(this).addClass('active');
//         var $productPopup = $productsHolder.find('#tvp-product-popup-'+$prodThumbnail.attr('id').split('-').pop());
//         var topValue = $prodThumbnail.position().top;
//         var popupBottomEdge = topValue + $productPopup.outerHeight();
        
//         //We must first check if it's overflowing. To do this we first check if it's overflowing in the top, this is an
//         //easy one, if it's a negative value then it's overflowing.
//         if (topValue <= 0) {
//           topValue = -10;
//         }
        
//         //Otherwise if it's failing in the bottom, we rectify by removing the excess from the top value.
//         else if ( popupBottomEdge > $productsHolder.outerHeight() )  {
//           topValue = topValue - (popupBottomEdge - $productsHolder.outerHeight()) + 1;
//           topValue = topValue + 10;
//         }

//         //Arrow indicator shall just be aligned to the middile of thumb.
//         $indicator.css({
//           top: $prodThumbnail.position().top + 20,
//           display: 'block'
//         });
        
//         $productPopup.css({ top: topValue});
//         $productPopup.show().addClass('active');

//       });
//     },5);
//   };

//   window.addEventListener('message', function(e){
//     if (!e || !utils.isset(e, 'data') || !utils.isset(e.data, 'event') || '_tvp_sidebar_modal_data' !== e.data.event) return;
    
//     var data = e.data;
//     var selectedVideo = data.selectedVideo;
//     var videos = data.videos;
//     settings.data = videos;
//     settings.onResize = function(size){
//       $el.find('.tvp-products-holder').height(size[1]);
//       if (window.parent && window.parent.parent) {
//         window.parent.parent.postMessage({
//           event: 'tvp_sidebar:modal_resized',
//           height: ($el.height() + 20) + 'px'
//         }, '*');
//       }
//     };

//     var player = new Player('tvp-player-el',settings,selectedVideo.id);
//     window.addEventListener('resize', utils.debounce(function(){
//       player.resize();
//     },50));

//     if (utils.isset(selectedVideo,'products')) {
//       renderProducts(selectedVideo.products);
//     } else {
//       $.ajax({
//        type: 'GET',
//        url: '//api.tvpage.com/v1/videos/' + selectedVideo.id + '/products',
//        dataType: 'jsonp',
//        data: {
//          'X-login-id': settings.loginId
//        }
//      }).done(function(products){
//        if (!products && !products.length) return console.log('no products');
//        renderProducts(products);
//      }); 
//     }

//   });

// }(document,jQuery, Utils));