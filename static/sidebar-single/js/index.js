;(function(window,document) {

  var render = function(target,data){
    if (!Utils.isset(target) || !Utils.isset(data)) return;
    var frag = document.createDocumentFragment(),
    main = document.createElement('div');
    var d = data || {};
    main.id = d.id || '';
    main.classList.add('iframe-content');
    main.innerHTML +=  d.templates['sidebar'];
    frag.appendChild(main);
    target.appendChild(frag);
  };

  var initialize = function(){
    var body = document.body;
    var settings = {};
    
    if (Utils.isset(parent) && Utils.isset(parent,'__TVPage__') && Utils.isset(parent.__TVPage__, 'config')) {
      settings = parent.__TVPage__.config[body.getAttribute('data-id')];
    }

    var gridSettings = JSON.parse(JSON.stringify(settings));
    var name = settings.name;

    render(body,settings);

    var el = document.getElementById(name);
    gridSettings.onLoad = function(){el.classList.add('loading');};
    gridSettings.onLoadEnd = function(){el.classList.remove('loading');};
    
    Grid(name, gridSettings);
  };

  var not = function(obj){return 'undefined' === typeof obj};
  if (not(window.Grid) || not(window.Utils)) {
    var libsCheck = 0;
    (function libsReady() {
      setTimeout(function(){
        if ((not(window.Grid) || not(window.Utils)) && ++libsCheck < 50) {
          libsReady();
        } else {
          initialize();
        }
      },150);
    })();
  } else {
    initialize();
  }

}(window, document));