(function(document,$){
 
 var settings = Widget.settings;

  var tmpl = function(template, data) {
    if (template && 'object' == typeof data) {
      return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
        var keys = key.split("."),
          v = data[keys.shift()];
        for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
        return (typeof v !== "undefined" && v !== null) ? v : "";
      });
    }
  };

  var isset = function(o,p){
    var val = o;
    if (p) val = o[p];
    return 'undefined' !== typeof val;
  };

  var renderProducts = function(products){
    var prodCount = products.length,
        thumbTmpl = $('#productTemplate').html(),
        popupTmpl = $('#productPopupTemplate').html(),
        popupHtml = '',
        thumbHtml = '';

    while (prodCount > 0) {
      var prod = products[prodCount-1];
      thumbHtml += tmpl(thumbTmpl, prod);
      popupHtml += tmpl(popupTmpl, prod);
      prodCount--;
    }

    var $el = $('#' + settings.name);
    
    var $products = $el.find('.tvp-products');
    $products.html(thumbHtml);
    var $productsHolder = $products.parent();
    $productsHolder.append(popupHtml);
    
    setTimeout(function(){

      //Notify when products had been rendered (should we wait?)
      if (window.parent && window.parent.parent) {
        window.parent.parent.postMessage({
          event: '_tvp_sidebar_modal_rendered',
          height: ($el.height() + 20) + 'px'
        }, '*');
      }

      var $indicator = $productsHolder.find('#tvp-arrow-indicator');
      
      $productsHolder.on('mouseleave', function(){
        $(this).removeClass('active');
        $indicator.css('display','none');
        $productsHolder.find('.tvp-product-popup.active').hide();
      });
      
      $products.on('mouseover', '.tvp-product', function(e){
        $productsHolder.find('.tvp-product-popup.active').hide();

        var $prodThumbnail = $(this).addClass('active');
        var $productPopup = $productsHolder.find('#tvp-product-popup-'+$prodThumbnail.attr('id').split('-').pop());
        var topValue = $prodThumbnail.position().top;
        var popupBottomEdge = topValue + $productPopup.outerHeight();
        
        //We must first check if it's overflowing. To do this we first check if it's overflowing in the top, this is an
        //easy one, if it's a negative value then it's overflowing.
        if (topValue <= 0) {
          topValue = -10;
        }
        
        //Otherwise if it's failing in the bottom, we rectify by removing the excess from the top value.
        else if ( popupBottomEdge > $productsHolder.outerHeight() )  {
          topValue = topValue - (popupBottomEdge - $productsHolder.outerHeight()) + 1;
          topValue = topValue + 10;
        }

        //Arrow indicator shall just be aligned to the middile of thumb.
        $indicator.css({
          top: $prodThumbnail.position().top + 20,
          display: 'block'
        });
        
        $productPopup.css({ top: topValue});
        $productPopup.show().addClass('active');

      });
    },5);
  };

  window.addEventListener('message', function(e){
    if (!e || !isset(e, 'data') || !isset(e.data, 'event') || '_tvp_sidebar_modal_data' !== e.data.event) return;
    
    var data = e.data;
    var selectedVideo = data.selectedVideo;
    var videos = data.videos;
    settings.data = videos;

    new Player('tvp-player-el',settings,selectedVideo);

    if (isset(selectedVideo,'products')) {
      renderProducts(selectedVideo.products);
    } else {
      $.ajax({
       type: 'GET',
       url: '//api.tvpage.com/v1/videos/' + selectedVideo.id + '/products',
       dataType: 'jsonp',
       data: {
         'X-login-id': settings.loginId
       }
     }).done(function(products){
       if (!products && !products.length) return console.log('no products');
       renderProducts(products);
     }); 
    }

  });

}(document,jQuery));