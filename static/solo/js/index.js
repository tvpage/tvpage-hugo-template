(function() {
  var body = document.body;
  var id = body.getAttribute('data-id');
  var config = window.parent.__TVPage__.config[id];

  function initPlayer(){
    var playerConfig = Utils.copy(config);
    var menu;
    var player;
    
    playerConfig.ciTrack = true;
    playerConfig.data = config.channel.videos;
    playerConfig.onPlayerChange = !!playerConfig.onPlayerChange;

    playerConfig.onPlayerReady = function(){
      if (config.debug) {
        console.log("a player is ready");
      }
      
      if(config.playlist){
        menu = new Menu(player, config);
        menu.initialize();
      }
    };

    playerConfig.onNext = function(next){
      if(next && config.playlist){
        menu.setActiveItem(next.assetId);
        menu.hideMenu();
      }
    };

    playerConfig.onFullscreenChange = function(){
      if(config.playlist){
        menu.hideMenu();
      }
    };
    
    player = new Player('player', playerConfig);
    player.initialize();

    var skeleton = document.getElementById('skeleton');
    if(skeleton)
      skeleton.parentNode.removeChild(skeleton);

    setTimeout(function(){
      Utils.removeClass(player.el.parentNode,'hide');
    },1);
  }
 
  var depsCheck = 0;
  var depsLimitCheck = 1000;
  var deps = ['Utils','Player'];

  if(config.playlist){
    deps.push('Ps', 'Menu');
  }

  (function initSolo() {
    setTimeout(function() {
      console.log('deps poll...');
      
      var ready = true;
      for (var i = 0; i < deps.length; i++)
        
        if ('undefined' === typeof window[deps[i]]){
          var dep = deps[i];
          if(config.debug){
            console.log(dep + ' is undefined');
          }
          ready = false;
        }

      if(ready){

        initPlayer();
        
      }else if(++depsCheck < depsLimitCheck){
        initSolo()
      }
    },5);
  })();
}());