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
      }
      return c;
    };
    var s = {};
    if ('dynamic' === type) {
      var config = getConfig(parent);
      var id = document.body.getAttribute('data-id');
      if (!isset(config, id)) return;
      s = config[id];
      s.name = id;
    } else if ('inline' === type && type && type.length) {
      var config = getConfig(parent);
      s = config[type];
      s.name = type;
    } else if ('static' === type) {
      var config = getConfig(window);
      var id = document.body.getAttribute('data-id');
      if (!isset(config, id)) return;
      s = config[id];
      s.name = id;
    }
    return s;
  };

  var render = function(target,data){
    if (!target) return;
    var frag = document.createDocumentFragment(),
    main = document.createElement('div');
    var d = data || {};
    main.id = d.id || '';
    main.classList.add('iframe-content');
    main.innerHTML =  '<div class="tvp-sidebar-title">' + (d.title || '') + '</div>'+
    '<div class="tvp-sidebar-container"></div><div class="tvp-sidebar-footer">'+
    '<button class="tvp-sidebar-load">' + (d.loadBtnText || '') + '</button>'+
    '<a class="tvp-logo" target="_blank" href="https://www.tvpage.com/"><div class="tvp-logo-img"></div></a>'+
    '</div><div class="tvp-cover"></div>';
    frag.appendChild(main);
    target.appendChild(frag);
  };

  var body = document.body;

  var initialize = function(){
    if (body.classList.contains('dynamic')) {
      (function(settings){
        var gridSettings = JSON.parse(JSON.stringify(settings));
        var name = settings.name;

        render(body,{
          id: name,
          title: settings.title || 'Recommended Videos',
          loadBtnText: settings.loadBtnText || 'View More'
        });

        var el = document.getElementById(name);
        gridSettings.onLoad = function(){el.classList.add('loading');};
        gridSettings.onLoadEnd = function(){el.classList.remove('loading');};
        
        Grid(name, gridSettings);

      }(getSettings('dynamic')));
    } else {
      (function(settings){
        var gridSettings = JSON.parse(JSON.stringify(settings));
        var name = settings.name;
        
        var el = document.getElementById(name);
        gridSettings.onLoad = function(){el.classList.add('loading');};
        gridSettings.onLoadEnd = function(){el.classList.remove('loading');};

        Grid(name, gridSettings);

      }(getSettings('static')));
    }
  };

  if ('undefined' === typeof window.Grid) {
    var gridCheck = 0;
    (function gridReady() {
      setTimeout(function() {
        if ('undefined' === typeof window.Grid) {
          (++gridCheck < 50) ? gridReady() : console.debug('limit reached');
        } else  {
          initialize();
        }
      },150);
    })();
  } else {
    initialize();
  }

  if (window.DEBUG) {
    console.debug("endTime = " + performance.now());
  }

}(window, document));