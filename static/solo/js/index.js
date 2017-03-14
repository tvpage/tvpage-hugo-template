;(function(document) {

  var channelVideosPage = 0,
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
        return console.log('need config');
      }
      return c;
    };
    var s = {};
    if ('dynamic' === type) {
      var config = getConfig(parent);
      var id = document.body.getAttribute('data-id');
      if (!Utils.isset(config, id)) return console.log('need settings');
      s = config[id];
      s.name = id;
    } else if ('inline' === type && type && type.length) {
      var config = getConfig(parent);
      s = config[type];
      s.name = type;
    } else if ('static' === type) {
      var config = getConfig(window);
      var id = document.body.getAttribute('data-id');
      if (!Utils.isset(config, id)) return console.log('need settings');
      s = config[id];
      s.name = id;
    }
    return s;
  },
  loadData = function(s,cbName,callback){
    jsonpCall({
      src: function(){
        var channel = s.channel,
            params = channel.parameters,
            itemsPerPage = Utils.isset(s,'items_per_page') ? '&n=' + s.items_per_page : '&n=8' ,
            url = '//api.tvpage.com/v1/channels/' + channel.id + '/videos?X-login-id=' + s.loginid;

        for (var p in params) { url += '&' + p + '=' + params[p];}
        url += itemsPerPage + '&p=' + channelVideosPage;
        url += '&callback='+cbName;
        return url;
      }(),
      cbName: cbName
    },callback);
    channelVideosPage++;
  },
  render = function(idEl,target){
    if (!idEl || !target) return console.log('need target');
    var frag = document.createDocumentFragment(),
    main = document.createElement('div');
    main.classList.add('tvp-player');
    main.innerHTML =  '<div id="tvp-player-el-'+idEl+'" class="tvp-player-el"></div></div>';
    frag.appendChild(main);
    target.appendChild(frag);
  },
  bindLoadMoreEvent = function(menu,data){
    var scrollMenu = document.querySelectorAll('.ss-content')[0];
    scrollMenu.addEventListener("scroll", Utils.debounce(function() {
      var menuTop = scrollMenu.scrollTop,
          newHeight = document.body.clientHeight - scrollMenu.scrollHeight,
          percentDocument = (menuTop*100)/newHeight;
      percentDocument = Math.round(percentDocument);
      percentDocument = Math.abs(percentDocument);
      if (percentDocument >= 55 && percentDocument <= 100) {
        (function(unique,settings){
          var menuSettings = JSON.parse(JSON.stringify(settings));
          if (!lastPage && !isFetching) {
            loadData(settings,unique,function(data){
              isFetching = true;
              lastPage = (!data.length || data.length < 0) ? true : false;
              menuSettings.data = data || [];
              menu.update(menuSettings,scrollMenu);
            });
          }
          isFetching = false;
        }(Utils.random(),getSettings('dynamic')));
      }
    },30));
  };
  
  //We need to know a few things before we can start a player. We need to know if we will render
  //this here or somehow the will be content (when used with iframe).
  function initialize(){
    if (document.body.classList.contains('dynamic')) {
      //We deal diff with some stuff on iframe.
      (function(unique,settings){
        var playerSettings = JSON.parse(JSON.stringify(settings)),
            menuSettings = JSON.parse(JSON.stringify(settings)),
            playlistOption = Utils.isset(settings,'playlist') ? settings.playlist: 'hide';

        render(unique,document.body);

        loadData(settings,unique,function(data){
          playerSettings.data = data || [];
          var player = new Player('tvp-player-el-'+unique,playerSettings);

          if (playlistOption === 'show') {
            menuSettings.data = data || [];
            var menu = new Menu(player,menuSettings);
            bindLoadMoreEvent(menu);
          }
        });
      }(Utils.random(),getSettings('dynamic')));
    }
  };

  initialize();

}(document));