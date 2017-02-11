(function(window,document){

  var initialize = function(){
    var body = document.getElementsByTagName('body')[0];
    var staticPath = body.getAttribute('data-domain') + '/sidebar' + (window.DEBUG ? '/' : '/dist/');

    //We start loading our slick dependency here, it was breaking while rendering it dynamicaly.
    $.ajax({
      dataType: 'script',
      cache: true,
      url: staticPath + 'js/vendor/slick-min.js'
    }).done(function() {
      
      //Notify when products had been rendered (should we wait?)
      // setTimeout(function(){
      //   if (window.parent && window.parent.parent) {
      //     window.parent.parent.postMessage({
      //       event: 'tvp_sidebar:modal_rendered',
      //       height: (el.offsetHeight + 20) + 'px'
      //     }, '*');
      //   }
      // },0);

    });

    // var initPlayer = function(data){
    //   var s = JSON.parse(JSON.stringify(data.runTime));
    //   s.data = data.data;

    //   s.onResize = function(size){
    //     resizeProducts(size[1]);
    //     if (window.parent && window.parent.parent) {
    //       window.parent.parent.postMessage({
    //         event: 'tvp_sidebar:modal_resized',
    //         height: (el.offsetHeight + 20) + 'px'
    //       }, '*');
    //     }
    //   };

    //   var player = new Player('tvp-player-el',s,data.selectedVideo.id);

    //   //Resize player when this window is resized.
    //   window.addEventListener('resize', Utils.debounce(function(){
    //     player.resize();
    //   },100));
    // };

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