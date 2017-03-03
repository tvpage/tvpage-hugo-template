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
          s.domain = document.body.getAttribute('data-domain') || '';
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
    if (!target) return console.log('need target');
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
  var isDynamic = body.classList.contains('dynamic');

  var initialize = function(){
    if (isDynamic) {
      (function(settings){

        new CSS(settings);

        var gridSettings = JSON.parse(JSON.stringify(settings));
        var name = settings.name;

        render(body,{
          id: name,
          title: settings.title || 'Recommended Videos',
          loadBtnText: settings.load_button_text || 'View More'
        });

          var el = document.getElementById(name);
          gridSettings.onLoad = function(){el.classList.add('loading');};
          gridSettings.onLoadEnd = function(){el.classList.remove('loading');};

          new Grid(name, gridSettings);

      }(getSettings('dynamic')));
    } else {
      (function(settings){
        var gridSettings = JSON.parse(JSON.stringify(settings));
        var name = settings.name;
        
        var el = document.getElementById(name);
        gridSettings.onLoad = function(){el.classList.add('loading');};
        gridSettings.onLoadEnd = function(){el.classList.remove('loading');};

        new Grid(name, gridSettings);
      }(getSettings('static')));
    }
  };

  var not = function(obj){return 'undefined' === typeof obj};
  if (not(window.Grid) || not(window.Utils) || (!isDynamic && not(window.__TVPage__))) {
      var libsCheck = 0;
      (function libsReady() {
          setTimeout(function(){
              if (not(window.Grid) || not(window.Utils) || (!isDynamic && not(window.__TVPage__))) {
                  (++libsCheck < 50) ? libsReady() : console.log('limit reached');
              } else {
                  initialize();
              }
          },150);
      })();
  } else {
      initialize();
  }

}(window, document));