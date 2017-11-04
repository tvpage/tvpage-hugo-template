(function() {

  //We did all the possible checks in the widget's index.js file, no need to check more here.
  var body = document.body;
  var id = body.getAttribute('data-id');
  var config = window.parent.__TVPage__.config[id];

  //The global deps of the carousel have to be present before executing its logic.
  var depsCheck = 0;
  var deps = ['Utils','Player','SimpleScrollbar','Menu'];

  (function initSolo() {
    setTimeout(function() {
      console.log('deps poll...');
      
      var ready = true;
      for (var i = 0; i < deps.length; i++)
        if ('undefined' === typeof window[deps[i]])
          ready = false;

      if(ready){

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

          menu = new Menu(player, config);
          menu.initialize();
        };

        playerConfig.onNext = function(next){
          if(next){
            menu.setActiveItem(next.assetId);
          }

          menu.hideMenu();
        };

        playerConfig.onFullscreenChange = function(){
          menu.hideMenu();
        };
        
        player = new Player('player', playerConfig);
        player.initialize();

        var skeleton = document.getElementById('skeleton');
        if(skeleton)
          skeleton.parentNode.removeChild(skeleton);

        setTimeout(function(){
          Utils.removeClass(player.el.parentNode,'hide');
        },1);
      }else if(++depsCheck < 200){
        initSolo()
      }
    },5);
  })();

}());