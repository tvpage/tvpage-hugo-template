(function(doc,parentDoc,$){
 
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

  var renderProducts = function(products, exchangeVideo){
    var prodCount = products.length,
        htmlTmpl = $('#productTemplate').html(),
        html = '';

    while (prodCount > 0) {
      html += '<div>' + tmpl(htmlTmpl, products[prodCount-1]) + '</div>';
      prodCount--;
    }

    var $products = $('#' + settings.name).find('.tvp-products');
    
    $products.html(html);

    var analytics = {};
    var config = {
      domain: isset(location,'hostname') ?  location.hostname : '',
      loginId: settings.loginId
    };
    
    setTimeout(function(){
      $products.addClass('first-render').slick({
        slidesToSlide: 1,
        slidesToShow: 1,
        arrows: false,
        centerMode: true,
        centerPadding: '25px'
      });

      if (!settings.analytics) return;

      //Dynamic analytics configuration, we need to switch if this is an ad.
      var analytics =  new Analytics();
      if (exchangeVideo) {
        config.logUrl = exchangeVideo.analytics;
      } else {
        config.logUrl = '\/\/api.tvpage.com\/v1\/__tvpa.gif';
      }
      analytics.initConfig(config);

      var $product = $products.find('.slick-active').find('.tvp-product');
      var id = $product.data('id');
      var trackObj = {
        vd: $product.data('entityIdParent'),
        ct: id,
        li: settings.loginId,
        pg: settings.channelid
      };
      
      if (exchangeVideo) {
        for (var i = 0; i < products.length; i++) {
          var prod = products[i];
          if (id == prod.id && isset(prod,'events') && prod.events.length) {
            trackObj = prod.events[0].data;
          }
        }
      }
      
      analytics.track('pi',trackObj);

    },5);
  };
  
  //Receiving the data from the parent iframe....
  window.addEventListener('message',function(e){
    if (!e || !isset(e,'origin') || 'http://localhost:1313' !== e.origin || !isset(e,'data') || !isset(e.data,'videos')) return;
    
    var data = e.data,
        videos = data.videos,
        selected = data.selected;
    
    settings.data = videos;

    new Player('tvp-player-el',settings,selected);

    var selectedVideo = {};
    for (var i = 0; i < videos.length; i++) {
      if (videos[i].id === selected) {
        selectedVideo = videos[i];
      }
    }

    if (isset(selectedVideo,'products')) {
      renderProducts(selectedVideo.products, selectedVideo);
    } else {
      $.ajax({
       type: 'GET',
       url: '//api.tvpage.com/v1/videos/' + selected + '/products',
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

}(document,parent.document,jQuery));