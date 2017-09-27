;(function(document) {

  var channelVideosPage = 0,
      itemsPerPage = 6,
      lastPage = false,
      isFetching = false,

  jsonpCall = function(opts,callback){
      var s = document.createElement('script');
      s.src = opts.src;
      if (!callback || 'function' !== typeof callback) return;
      window[opts.cbName || 'callback'] = callback;
      var b = opts.body || document.body;
      b.appendChild(s);
  },
  getSettings = function(type){
    var getConfig = function(g){
      var c = {};
      if (Utils.isset(g) && Utils.isset(g,'__TVPage__') && Utils.isset(g.__TVPage__, 'config')) {
        c = g.__TVPage__.config;
      } else {
        return;
      }
      return c;
    };
    var s = {};
    if ('dynamic' === type) {
      var config = getConfig(parent);
      var id = document.body.getAttribute('data-id');
      if (!Utils.isset(config, id)) return;
      s = config[id];
      s.name = id;
    } else if ('inline' === type && type && type.length) {
      var config = getConfig(parent);
      s = config[type];
      s.name = type;
    } else if ('static' === type) {
      var config = getConfig(window);
      var id = document.body.getAttribute('data-id');
      if (!Utils.isset(config, id)) return;
      s = config[id];
      s.name = id;
    }
    return s;
  },
  loadData = function(s,cbName,callback){
   return jsonpCall({
      src: function(){
        var channel = s.channel || {},
            params = channel.parameters || {},
            url = s.api_base_url + '/channels/' + (channel.id || (s.channelid || s.channelId)) + '/videos?X-login-id=' + (s.loginid || s.loginId);

        for (var p in params) {
          if(params.hasOwnProperty(p)){
            url += '&' + p + '=' + params[p];
          }
        }
        url += '&n=' + itemsPerPage + '&p=' + channelVideosPage;
        url += '&callback='+cbName;
        return url;
      }(),
      cbName: cbName
    },callback);
  },
  render = function(idEl,target){
    if (!idEl || !target) return;
    var frag = document.createDocumentFragment(),
    main = document.createElement('div');
    main.classList.add('tvp-player');
    main.innerHTML =  '<div id="tvp-player-el-'+idEl+'" class="tvp-player-el"></div></div>';
    frag.appendChild(main);
    target.appendChild(frag);
  };
  
  //We need to know a few things before we can start a player. We need to know if we will render
  //this here or somehow the will be content (when used with iframe).
  function initialize(){
    if (document.body.classList.contains('dynamic')) {
      //We deal diff with some stuff on iframe.
      (function(unique,settings){
        var player = null,
            menu = null,
            playerSettings = JSON.parse(JSON.stringify(settings)),
            menuSettings = JSON.parse(JSON.stringify(settings)),
            playlistOption = Utils.isset(settings,'playlist') ? settings.playlist: null;

        render(unique,document.body);

        loadData(settings,unique,function(data){
          if (data.length) {
            if (window.parent) {
              window.parent.postMessage({
                event: ("tvp_" + settings.id).replace(/-/g,'_') + ':render'
              }, '*');
            }

            playerSettings.data = data || [];
            player = new Player('tvp-player-el-'+unique,playerSettings);

            if (playlistOption === 'show' && playlistOption) {
              menuSettings.data = data || [];
              menu = new Menu(player,menuSettings);        
            }
          }
        });

        if (playlistOption === 'show' && playlistOption) {

          playerSettings.onPlayerReady = function(){
            menu.init();
          };

          playerSettings.onNext = function(){
            var playerAsset = player.assets[player.current];
            menu.setActiveItem(playerAsset.assetId);
            menu.hideMenu();
          };

          playerSettings.onFullscreenChange = function(){
            menu.hideMenu();
          };

          Menu.prototype.loadMore = function(){
            if (!lastPage && !isFetching) {
              channelVideosPage++;
              isFetching = true;
              loadData(settings,unique,function(newData){
                isFetching = false;
                lastPage = (!newData.length || newData.length < itemsPerPage) ? true : false;
                player.addData(newData);
                menu.update(newData);
              });
            }
          };
        }
      }(Utils.random(),getSettings('dynamic')));
    }
  };

  var not = function(obj){return 'undefined' === typeof obj};
  if (not(window.Utils) || not(window.Player) || not(window.Menu) || not(window.SimpleScrollbar)) {
      var libsCheck = 0;
      (function libsReady() {
          setTimeout(function(){
              if ( (not(window.Utils) || not(window.Player) || not(window.Menu) || not(window.SimpleScrollbar)) && (++libsCheck < 50) ) {
                  libsReady();
              } else {
                  initialize();
              }
          },150);
      })();
  } else {
      initialize();
  }

}(document));