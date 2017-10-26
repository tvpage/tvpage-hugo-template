(function() {
  
  var body = document.body;
  var id = body.getAttribute('data-id');
  var config = null;

  var renderPlayer = function(){
    var el = document.createElement('div');
    el.className ='tvp-player';
    el.innerHTML =  '<div id="tvp-player-el-'+id+'" class="tvp-player-el"></div></div>';
    body.appendChild(el);
  };

  var getPlayerConfig = function(data){
    var obj = Utils.copy(config);
    
    obj.ciTrack = true;
    obj.onPlayerChange = !!config.onPlayerChange;
    obj.data = data || [];

    if(!!config.playlist && 'show' === config.playlist){
      obj.onPlayerReady = function(playerInstance){
        var menuConfig = Utils.copy(config);
        menuConfig.data = data;
        (new Menu(playerInstance,menuConfig)).initialize();
      };

      obj.onNext = function(next){
        menu.setActiveItem(next.assetId);
        menu.hideMenu();
      };

      obj.onFullscreenChange = function(){
        menu.hideMenu();
      };
    }

    return obj;
  };
  
  function initialize(){
    renderPlayer();

    config = Utils.getParentConfig(id);
    
    var channel = config.channel || {};
    
    config.channelId = channel.id || config.channelId || config.channelid;
    config.loginId = config.loginId || config.loginid;
    
    var params = channel.parameters || {};
    var src = config.api_base_url + '/channels/' + config.channelId + '/videos?X-login-id=' + config.loginId;
    
    for (var p in params) {
      src += '&' + p + '=' + params[p];
    }

    src += '&p=0&n=6&callback=tvpcallback';

    var script = document.createElement('script');
    script.src = src;
    
    window['tvpcallback'] = function(data) {
      if (data.length) {
        Utils.sendMessage({
          event: ("tvp_" + id).replace(/-/g,'_') + ':render'
        });
  
        (new Player('tvp-player-el-' + id, getPlayerConfig(data))).initialize();
      }
    };

    body.appendChild(script);
  };

  var isLoadingLibs = function(){
    var not = function(obj) {
      return 'undefined' === typeof obj
    };

    return not(window.Utils) || not(window.Player) || not(window.Menu) || not(window.SimpleScrollbar);
  };

  if (isLoadingLibs()) {
    var libsLoadingCheck = 0;
    (function libsLoadingPoll() {
      setTimeout(function() {
        if (isLoadingLibs()) {
          (++libsLoadingCheck < 200) ? libsLoadingPoll(): console.warn('limit reached');
        } else {
          initialize();
        }
      },150);
    })();
  } else {
    initialize();
  }

}());