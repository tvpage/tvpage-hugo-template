;(function(window,document){
  var testInterval,
      timeInterval,
      playerEl,
      plIframe,
      qaTagEl,
      endEl,
      player,
      menu,
      eventPrefix = "tvp_" + (document.body.getAttribute("data-id") || "").replace(/-/g,'_');

  var channelVideosPage = 0,
    itemsPerPage = 6,
    lastPage = false,
    isFetching = false;

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
            playerSettings.data = data || [],
            playlistOpt = Utils.isset(settings,'playlist') ? settings.playlist : false;

        if (playlistOpt) {
          playerSettings.onFullscreenChange = function(){
              menu.hideMenu();
          };
          player = new Player('tvp-player-el-'+unique,playerSettings);

          var menuSettings = JSON.parse(JSON.stringify(settings));
              menuSettings.data = data || [],
              menuSettings.channelVideosPage = 0;
          menu = new Menu(player,menuSettings);

          Menu.prototype.loadMore = function(){
              if (!lastPage && !isFetching) {
                  menuSettings.channelVideosPage++;
                  isFetching = true;
                  Utils.loadData(menuSettings,unique,function(newData){
                      if(newData.length > itemsPerPage){
                        menu.deleteDivs();
                        return;
                      }
                      isFetching = false;
                      lastPage = (!newData.length || newData.length < itemsPerPage) ? true : false;
                      player.addData(newData);
                      menu.render(newData);
                  });
              }
          };
          var menuInterval = setInterval(function(){
            initMenu(player, settings);
          },500);

          var initMenu = function(pl, settings){
            if(!pl.isReady || !settings) return;
            clearInterval(menuInterval);
            menu.init();
          };
        }else{
          player = new Player('tvp-player-el-'+unique,playerSettings);
        }
      });
    }(window,document,Utils.random(),Utils.getSettings()));
  }

    window.addEventListener('message', function(e) {
        console.log(e.data)
        if (!e || !Utils.isset(e, 'data') || !Utils.isset(e.data, 'event')) return;

        var data = e.data;

        if (eventPrefix + ':modal_data' === data.event) {
            console.log(data)
            // initPlayer(data);
        }
    });

        Utils.sendPost(eventPrefix,':modal_initialized',{
            height: (playerEl.offsetHeight + 20) + 'px'
        });

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