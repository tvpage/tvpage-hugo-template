(function(window,document){

  var isset = function(o,p){
    return 'undefined' !== typeof o[p];
  };

  var getbyClass = function(c){
    return document.getElementsByClassName(c || '')[0];
  };

  var render = function(products, exchangeVideo){
    var el = getbyClass('iframe-content');
    var prodCount = products.length,
        htmlTmpl = $('#productTemplate').html(),
        html = '';

    while (prodCount > 0) {
      html += '<div>' + Utils.tmpl(htmlTmpl, products[prodCount-1]) + '</div>';
      prodCount--;
    }

    var $products = $(el).find('.tvp-products-carousel');
    
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

  var initialize = function(){
    var body = document.getElementsByTagName('body')[0];
    var staticPath = body.getAttribute('data-domain') + '/sidebar' + (window.DEBUG ? '/' : '/dist/');
    var el = getbyClass('iframe-content');

    //We start loading our slick dependency here, it was breaking while rendering it dynamicaly.
    $.ajax({
      dataType: 'script',
      cache: true,
      url: staticPath + 'js/vendor/slick-min.js'
    }).done(function() {
      //Notify when products had been rendered (should we wait?)
      setTimeout(function(){
        if (window.parent && window.parent.parent) {
          window.parent.parent.postMessage({
            event: 'tvp_sidebar:modal_rendered',
            height: (el.offsetHeight + 20) + 'px'
          }, '*');
        }
      },0);

    });

    var initPlayer = function(data){
      var s = JSON.parse(JSON.stringify(data.runTime));
      s.data = data.data;

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
  if (not(window.TVPage) || not(window.jQuery) || not(window.Utils) || not(window.Analytics) || not(window.Player)) {
    var libsCheck = 0;
    (function libsReady() {
      setTimeout(function(){
        if (not(window.TVPage) || not(window.jQuery) || not(window.Utils) || not(window.Analytics) || not(window.Player)) {
          (++libsCheck < 20) ? libsReady() : console.log('limit reached');
        } else {
          initialize();
        }
      },50);
    })();
  } else {
    initialize();
  }

}(window,document));