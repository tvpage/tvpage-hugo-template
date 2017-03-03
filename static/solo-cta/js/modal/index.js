(function(window,document){

  var analytics,
      channelId;

  var initialize = function(){
    var el = Utils.getByClass('iframe-content');

    var initPlayer = function(data){
      var s = JSON.parse(JSON.stringify(data.runTime));
      s.data = data.data;

      s.onResize = function(initial, size){
        if (window.parent) {
          window.parent.postMessage({
            event: 'tvp_solo_cta:modal_resized',
            height: el.offsetHeight + 'px'
          }, '*');
        }
      };

      s.onNext = function(next){
        if (window.parent && next) {
          window.parent.postMessage({
            event: 'tvp_solo_cta:player_next',
            next: next
          }, '*');
        }
      };

      var player = new Player('tvp-player-el',s,data.selectedVideo.id);
      window.addEventListener('resize', Utils.debounce(function(){
        player.resize();
      },85));
    };

    window.addEventListener('message', function(e){
      if (!e || !Utils.isset(e, 'data') || !Utils.isset(e.data, 'event')) return;
      var data = e.data;
      
      if ('tvp_solo_cta:modal_data' === data.event) {
        initPlayer(data);
        
        var loginId = data.runTime.loginid || data.runTime.loginId;
        channelId = data.runTime.channel.id || data.runTime.channelid;
        
        analytics =  new Analytics();
        analytics.initConfig({
          logUrl: '\/\/api.tvpage.com\/v1\/__tvpa.gif',
          domain: Utils.isset(location,'hostname') ?  location.hostname : '',
          loginId: loginId
        });
      }
    });

    setTimeout(function(){
      if (window.parent) {
        window.parent.postMessage({
          event: 'tvp_solo_cta:modal_initialized',
          height: el.offsetHeight + 'px'
        }, '*');
      }
    },0);
  };

  var not = function(obj){return 'undefined' === typeof obj};
  if (not(window.TVPage) || not(window._tvpa) || not(window.Utils) || not(window.Analytics) || not(window.Player)) {
    var libsCheck = 0;
    (function libsReady() {
      setTimeout(function(){
        if (not(window.TVPage) || not(window._tvpa) || not(window.Utils) || not(window.Analytics) || not(window.Player)) {
          (++libsCheck < 50) ? libsReady() : console.log('limit reached');
        } else {
          initialize();
        }
      },150);
    })();
  } else {
    initialize();
  }

}(window, document));