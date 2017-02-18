;(function(document) {

  var random = function(){
    return 'tvp_' + Math.floor(Math.random() * 50005);
  },
  isset = function(o,p){
    var val = o;
    if (p) val = o[p];
    return 'undefined' !== typeof val;
  },
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
            url = '//api.tvpage.com/v1/channels/' + channel.id + '/videos?X-login-id=' + s.loginid;

        for (var p in params) { url += '&' + p + '=' + params[p];}
        url += '&callback='+cbName;
        return url;
      }(),
      cbName: cbName
    },callback);
  };

  var render = function(idEl,target){
    if (!idEl || !target) return console.log('need target');
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
        render(unique,document.body);
        loadData(settings,unique,function(data){
          settings.data = data || [];
          new Player('tvp-player-el-'+unique,settings);
        });
      }(random(),getSettings('dynamic')));
    }
  };

  initialize();

}(document));