(function() {
  var body = document.body;
  var id = body.getAttribute('data-id');
  var config = window.parent.__TVPage__.config[id];
  var eventPrefix = config.events.prefix;


  //The global deps of the carousel have to be present before executing its logic.
  var depsCheck = 0;
  var deps = ['TVPage','Utils','Analytics','Player'];

  (function initSoloCTA() {
    setTimeout(function() {
      console.log('deps poll...');
      
      var ready = true;
      for (var i = 0; i < deps.length; i++)
        if ('undefined' === typeof window[deps[i]])
          ready = false;

      if(ready){
     
        var mainEl = Utils.getById(id);
        var playerConfig = Utils.copy(config);
        
        playerConfig.data = config.channel.videos;

        playerConfig.onResize = function() {
          Utils.sendMessage({
            event: eventPrefix + ':modal_resize',
            height: mainEl.offsetHeight + 'px'
          });
        }

        playerConfig.onNext = function(next) {
          Utils.sendMessage({
            event: eventPrefix + ':player_next',
            next: next || {}
          });
        };

        var player = new Player('tvp-player-el', playerConfig, config.channel.firstVideo.id);
        
        player.initialize();

        Utils.sendMessage({
          event: eventPrefix + ':widget_modal_initialized',
          height: (mainEl.offsetHeight + 20) + 'px'
        });

      }else if(++depsCheck < 200){
        initSoloCTA()
      }
    },5);
  })();

}());