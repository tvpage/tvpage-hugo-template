;(function(document) {

  var channelVideosPage = 0,
      lastPage,

  random = function(){
    return 'tvp_' + Math.floor(Math.random() * 50005);
  },
  debounce = function(func,wait,immediate){
    var timeout;  
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };      
  },
  isset = function(o,p){
    var val = o;
    if (p) val = o[p];
    return 'undefined' !== typeof val;
  },
  jsonpCall = function(opts,callback){
    var isFetching = false;
    if (!isFetching) {
      isFetching = true;
      var s = document.createElement('script');
      s.src = opts.src;
      if (!callback || 'function' !== typeof callback) return;
      window[opts.cbName || 'callback'] = callback;
      var b = opts.body || document.body;
      b.appendChild(s);
    }
  },
  getSettings = function(type){
    var getConfig = function(g){
      var c = {};
      if (isset(g) && isset(g,'__TVPage__') && isset(g.__TVPage__, 'config')) {
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
      if (!isset(config, id)) return console.log('need settings');
      s = config[id];
      s.name = id;
    } else if ('inline' === type && type && type.length) {
      var config = getConfig(parent);
      s = config[type];
      s.name = type;
    } else if ('static' === type) {
      var config = getConfig(window);
      var id = document.body.getAttribute('data-id');
      if (!isset(config, id)) return console.log('need settings');
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
            itemsPerPage = isset(s,'items_per_page') ? s.items_per_page : 8,
            url = '//api.tvpage.com/v1/channels/' + channel.id + '/videos?X-login-id=' + s.loginid;

        for (var p in params) { url += '&' + p + '=' + params[p];}
        url += '&n=' + itemsPerPage + '&p=' + channelVideosPage;
        url += '&callback='+cbName;
        return url;
      }(),
      cbName: cbName
    },callback);
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
      scrollMenu.addEventListener("scroll", debounce(function() {
      var st = scrollMenu.scrollTop;
      var nwh = document.body.clientHeight - scrollMenu.scrollHeight;
      var percentDocument = (st*100)/nwh;
      percentDocument = Math.round(percentDocument);
      percentDocument = Math.abs(percentDocument);
      if (percentDocument >= 55 && percentDocument <= 100) {
        channelVideosPage++;
        (function(unique,settings){
          var menuSettings = JSON.parse(JSON.stringify(settings));
          if (!lastPage) {
            loadData(settings,unique,function(data){
              if (!data.length) {
                lastPage = true;
              }else{
                lastPage = false;
              }
              menuSettings.data = data || [];
              menu.update(menuSettings);
            });
          }

        }(random(),getSettings('dynamic')));
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
            playlistOption = isset(settings,'playlist') ? settings.playlist: 'hide';

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
      }(random(),getSettings('dynamic')));
    }
  };

  initialize();

}(document));