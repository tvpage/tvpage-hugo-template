;(function(window,document) {
  
  var isset = function(o,p){
    var val = o;
    if (p) val = o[p];
    return 'undefined' !== typeof val;
  };

  var getSettings = function(type){
    var getConfig = function(g){
      var c = {};
      if (isset(g) && isset(g,'__TVPage__') && isset(g.__TVPage__, 'config')) {
        c = g.__TVPage__.config;
      } else {
        return console.warn('Needs Config');
      }
      return c;
    };
    var s = {};
    if ('dynamic' === type) {
      var config = getConfig(parent);
      var id = document.body.getAttribute('data-id');
      if (!isset(config, id)) return console.warn('Needs Settings');
      s = config[id];
      s.name = id;
    } else if ('inline' === type && type && type.length) {
      var config = getConfig(parent);
      s = config[type];
      s.name = type;
    } else if ('static' === type) {
      var config = getConfig(window);
      var id = document.body.getAttribute('data-id');
      if (!isset(config, id)) return console.warn('Needs Settings');
      s = config[id];
      s.name = id;
    }
    return s;
  };

  var render = function(target,data){
    if (!isset(target) || !isset(data)) return console.warn('Needs Target|Data');
    var frag = document.createDocumentFragment(),
    main = document.createElement('div');
    var d = data || {};
    main.id = d.id || '';
    main.classList.add('iframe-content');
    main.innerHTML +=  d.templates['sidebar'];
    frag.appendChild(main);
    target.appendChild(frag);
  };

  var body = document.body;

  var initialize = function(){
    (function(settings){
      var gridSettings = JSON.parse(JSON.stringify(settings));
      var name = settings.name;

      render(body,settings);

      var el = document.getElementById(name);
      gridSettings.onLoad = function(){el.classList.add('loading');};
      gridSettings.onLoadEnd = function(){el.classList.remove('loading');};
      
      new Grid(name, gridSettings);

    }(getSettings('dynamic')));
  };

  var not = function(obj){return 'undefined' === typeof obj};
  if (not(window.Grid) || not(window.Utils)) {
      var libsCheck = 0;
      (function libsReady() {
          setTimeout(function(){
              if (not(window.Grid) || not(window.Utils)) {
                  (++libsCheck < 50) ? libsReady() : console.warn('limit reached');
              } else {
                  initialize();
              }
          },150);
      })();
  } else {
      initialize();
  }

}(window, document));