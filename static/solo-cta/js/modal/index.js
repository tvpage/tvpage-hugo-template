;(function(window,document){
  var util = {
      playerEl: null,
      player: null,
      menu: null,
      itemsPerPage: 6,
      lastPage: false,
      isFetching: false
  };

  function initialize(){
    (function(win,doc,unique,settings){
      Utils.render(unique,doc.body);
      Utils.loadData(settings,unique,function(data){
        if (!data || !data.length) return;
        if (win.parent) {
          win.parent.postMessage({
            event: ("tvp_" + settings.id).replace(/-/g,'_') + ':handle_init',
            data: data
          }, '*');
        }

        var playerSettings = JSON.parse(JSON.stringify(settings));
        playerSettings.data = data || [];
        var playlistOpt = Utils.isset(settings,'playlist') ? settings.playlist : false;

        if (playlistOpt) {
          playerSettings.onFullscreenChange = function(){
              util.menu.hideMenu();
          };
          util.player = new Player('tvp-player-el-'+unique,playerSettings);
          util.playerEl = util.player.el;

          var menuSettings = JSON.parse(JSON.stringify(settings));
              menuSettings.data = data || [],
              menuSettings.channelVideosPage = 0;
          util.menu = new Menu(util.player,menuSettings);

          Menu.prototype.loadMore = function(){
              if (!util.lastPage && !util.isFetching) {
                  menuSettings.channelVideosPage++;
                  util.isFetching = true;
                  Utils.loadData(menuSettings,unique,function(newData){
                      if(newData.length > util.itemsPerPage){
                        util.menu.deleteDivs();
                        return;
                      }
                      util.isFetching = false;
                      util.lastPage = (!newData.length || newData.length < util.itemsPerPage) ? true : false;
                      util.player.addData(newData);
                      util.menu.render(newData);
                  });
              }
          };
          var menuInterval = setInterval(function(){
            initMenu(util.player, settings);
          },500);

          var initMenu = function(pl, settings){
            if(!pl.isReady || !settings) return;
            clearInterval(menuInterval);
            util.menu.init();
          };
        }else{
          util.player = new Player('tvp-player-el-'+unique,playerSettings);
        }
      });
    }(window,document,Utils.random(),Utils.getSettings()));
  }

  var not = function(obj){return 'undefined' === typeof obj};
  if (not(window.Utils) || not(window.Player)) {
      var libsCheck = 0;
      (function libsReady() {
          setTimeout(function(){
              if ((not(window.Utils) || not(window.Player)) && (++libsCheck < 50)) {
                  libsReady();
              } else {
                  initialize();
              }
          },150);
      })();
  } else {
      initialize();
  }

}(window,document));