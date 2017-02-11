(function(window,document,$,utils){
 
  var settings = Widget.settings;

  var renderProducts = function(products, exchangeVideo){
    var prodCount = products.length,
        htmlTmpl = $('#productTemplate').html(),
        html = '';

    while (prodCount > 0) {
      html += '<div>' + utils.tmpl(htmlTmpl, products[prodCount-1]) + '</div>';
      prodCount--;
    }

    var $products = $('#' + settings.name).find('.tvp-products-carousel');
    
    $products.html(html).promise().done(function(){
      var slickInitialized = false;
      
      $products.on('setPosition',utils.debounce(function(){
        if (!slickInitialized) return;
        if (window.parent && window.parent.parent) {
          window.parent.parent.postMessage({
            event: 'tvp_sidebar:modal_resized',
            height: Math.ceil($('#' + settings.name).height()) + 'px'
          }, '*');
        }
      },100));
      
      $products.on('init',function(){
        slickInitialized = true;
        $products.addClass('first-render');
        
        if (window.parent && window.parent.parent) {
          window.parent.parent.postMessage({
            event: 'tvp_sidebar:modal_rendered',
            height: Math.ceil($('#' + settings.name).height()) + 'px'
          }, '*');
        }
      });

      var slickConfig = {
        slidesToSlide: 1,
        slidesToShow: 1,
        arrows: false
      };
      
      if (products.length > 1) {
        slickConfig.centerMode = true;
        slickConfig.centerPadding = '25px';
      }
      
      $products.slick(slickConfig);

      if (!settings.analytics) return;

      //Dynamic analytics configuration, we need to switch if this is an ad.
      var analytics =  new Analytics();
      var config = {
        domain: utils.isset(location,'hostname') ?  location.hostname : '',
        loginId: settings.loginId
      };
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
          if (id == prod.id && utils.isset(prod,'events') && prod.events.length) {
            trackObj = prod.events[0].data;
          }
        }
      }
      
      analytics.track('pi',trackObj);

    });
  };

  window.addEventListener('message', function(e){
    if (!e || !utils.isset(e, 'data') || !utils.isset(e.data, 'event') || '_tvp_sidebar_modal_data' !== e.data.event) return;
    
    var data = e.data;
    var selectedVideo = data.selectedVideo;
    var videos = data.videos;
    settings.data = videos;

    var player = new Player('tvp-player-el',settings,selectedVideo.id);
    window.addEventListener('resize', utils.debounce(function(){
      player.resize();
    },50));

    if (utils.isset(selectedVideo,'products')) {
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

}(window,document,jQuery,Utils));