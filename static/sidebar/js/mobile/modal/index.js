(function(window,document){

  var analytics;

  var pkTrack = function(){
    analytics.track('pk',{
      vd: this.getAttribute('data-vd'),
      ct: this.id.split('-').pop()
    });
  };

  var isset = function(o,p){
    return 'undefined' !== typeof o[p];
  };

  var getByClass = function(c){
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

  var render = function(data, exchangeVideo){
    var el = getByClass('iframe-content');

    var container = getByClass('tvp-products');
    var frag = document.createDocumentFragment();
    
    for (var i = 0; i < data.length; i++) {
      var product = data[i];
      var productId = product.id;
      var productVideoId = product.entityIdParent;
      var fixedPrice = '';
      var prodTitle = product.title || '';

      analytics.track('pi',{
        vd: product.entityIdParent,
        ct: productId
      });
      
      //we want to remove all special character, so they don't duplicate
      //also we shorten the lenght of long titles and add 3 point at the end
      if (prodTitle || product.price) {
        prodTitle = prodTitle.length > 50 ? prodTitle.substring(0, 50) + "...":prodTitle;
        var price = product.price.toString().replace(/[^0-9.]+/g, '');
        price = parseFloat(price).toFixed(2);
        fixedPrice = price > 0 ? ('$' + price):'';
      }

      var prodNode = document.createElement('div');
      prodNode.innerHTML = '<a id="tvp-product-' + productId + '" class="tvp-product" data-vd="' + productVideoId + '" href="' +
      product.linkUrl + '"><div class="tvp-product-image" style="background-image:url(' + product.imageUrl + ')"></div>'+
      '<div class="tvp-product-data"><p>'+prodTitle+'</p><h2>'+fixedPrice+'</h2><button>View Details</button></div></a>';
      frag.appendChild(prodNode);
    }

    //Remove click listener before cleaning up.
    var toRemove = container.getElementsByClassName('tvp-product');
    for (var j = 0; j < toRemove.length; j++) {
      toRemove[j].removeEventListener('click', pkTrack, false);
    }

    container.innerHTML = '';
    
    var carousel = document.createElement('div');
    carousel.classList.add('tvp-products-carousel');
    carousel.appendChild(frag);

    container.appendChild(carousel);

    var toTrack = container.getElementsByClassName('tvp-product');
    for (var j = 0; j < toTrack.length; j++) {
      toTrack[j].addEventListener('click', pkTrack, false);
    }

    //We start loading our slick dependency here, it was breaking while rendering it dynamicaly.
    var startSlick = function(){
      setTimeout(function(){
        var $el = $(carousel);
        var config = {
          slidesToSlide: 1,
          slidesToShow: 1,
          arrows: false
        };

        if (data.length > 1) {
          config.centerMode = true;
          config.centerPadding = '25px';
        }

        $el.on('init',function(){
          setTimeout(function(){
            if (window.parent && window.parent.parent) {
              window.parent.parent.postMessage({
                event: 'tvp_sidebar:modal_resized',
                height: el.offsetHeight + 'px'
              }, '*');
            }
          },0);
        });

        $el.slick(config);
      },10);
    };

    if ('undefined' === typeof $.fn.slick) {
      $.ajax({
        dataType: 'script',
        cache: true,
        url: document.body.getAttribute('data-domain') + '/sidebar/js/vendor/slick-min.js'
      }).done(startSlick);
    } else {
      startSlick();
    }
  };

  var initialize = function(){
    var el = getByClass('iframe-content');

    var initPlayer = function(data){
      var s = JSON.parse(JSON.stringify(data.runTime));
      
      s.data = data.data;
      
      s.onResize = function(initial,size){
        if (!initial && window.parent && window.parent.parent) {
          window.parent.parent.postMessage({
            event: 'tvp_sidebar:modal_resized',
            height: el.offsetHeight + 'px'
          }, '*');
        }
      }

      s.onNext = function(next){
        if (!next) return;

        if (Utils.isset(next,'products')) {
          render(next.products);
        } else {
          loadProducts(
            next.assetId,
            data.runTime.loginid || data.runTime.loginId,
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

      new Player('tvp-player-el',s,data.selectedVideo.id);
    };

    window.addEventListener('message', function(e){
      if (!e || !isset(e, 'data') || !isset(e.data, 'event')) return;
      var data = e.data;
      
      if ('_tvp_sidebar_modal_data' === data.event) {
        initPlayer(data);

        var loginId = data.runTime.loginid || data.runTime.loginId;

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
  if (not(window.TVPage) || not(window._tvpa) || not(window.jQuery) || not(window.Utils) || not(window.Analytics) || not(window.Player)) {
    var libsCheck = 0;
    (function libsReady() {
      setTimeout(function(){
        if (not(window.TVPage) || not(window._tvpa) || not(window.jQuery) || not(window.Utils) || not(window.Analytics) || not(window.Player)) {
          (++libsCheck < 50) ? libsReady() : console.log('limit reached');
        } else {
          initialize();
        }
      },150);
    })();
  } else {
    initialize();
  }

}(window,document));