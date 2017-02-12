(function(window,document){

  var isset = function(o,p){
    return 'undefined' !== typeof o[p];
  };

  var getbyClass = function(c){
    return document.getElementsByClassName(c || '')[0];
  };

  var render = function(data, exchangeVideo){
    var el = getbyClass('iframe-content');

    var container = getbyClass('tvp-products-carousel');
    var frag = document.createDocumentFragment();
    
    for (var i = 0; i < data.length; i++) {
      var product = data[i];
      var prodNode = document.createElement('div');
      prodNode.innerHTML = '<a class="tvp-product" href="' + product.linkUrl + '"><div class="tvp-product-image" style="background-image:url(' + product.imageUrl + ')"></div>'+
      '<div class="tvp-product-data"><p>'+product.title+'</p><h2>$'+product.price+'</h2><button>View Details</button></div></a>';
      frag.appendChild(prodNode);
    }

    container.innerHTML = '';
    //container.appendChild(frag);

    //We start loading our slick dependency here, it was breaking while rendering it dynamicaly.
    var body = document.getElementsByTagName('body')[0];
    var staticPath = body.getAttribute('data-domain') + '/sidebar' + (window.DEBUG ? '/' : '/dist/');
    $.ajax({
      dataType: 'script',
      cache: true,
      url: staticPath + 'js/vendor/slick-min.js'
    }).done(function() {
      
      var slickInitialized = false;
      var $container = $(container);
      var slickConfig = {
        slidesToSlide: 1,
        slidesToShow: 1,
        arrows: false
      };

      setTimeout(function(){
        if (window.parent && window.parent.parent) {
          window.parent.parent.postMessage({
            event: 'tvp_sidebar:modal_rendered',
            height: el.offsetHeight + 'px'
          }, '*');
        }
      },0);
      
      // $container.on('setPosition',Utils.debounce(function(){
      //   if (!slickInitialized) return;
      //   if (window.parent && window.parent.parent) {
      //     // window.parent.parent.postMessage({
      //     //   event: 'tvp_sidebar:modal_resized',
      //     //   height: el.offsetHeight + 'px'
      //     // }, '*');
      //   }
      // },100));
      
      // $container.on('init',function(){
      //   slickInitialized = true;
        
      //   //Notify when products had been rendered (should we wait?)
      //   setTimeout(function(){
      //     if (window.parent && window.parent.parent) {
      //       window.parent.parent.postMessage({
      //         event: 'tvp_sidebar:modal_rendered',
      //         height: el.offsetHeight + 'px'
      //       }, '*');
      //     }
      //   },0);
      // });
      
      if (data.length > 1) {
        slickConfig.centerMode = true;
        slickConfig.centerPadding = '25px';
      }
      
      //$container.slick(slickConfig);

    });
  
  };

  var initialize = function(){
    var el = getbyClass('iframe-content');

    var initPlayer = function(data){
      var s = JSON.parse(JSON.stringify(data.runTime));
      s.data = data.data;
      
      var player = new Player('tvp-player-el',s,data.selectedVideo.id);

      //Resize player when this window is resized.
      window.addEventListener('resize', Utils.debounce(function(){
        alert(player.isReady);
        if(player.isReady){
          alert('is ready')
          player.resize();
        }
      },50));
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

    //Notify when the widget has been initialized.
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