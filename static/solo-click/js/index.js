;(function(document) {

  var isset = function(o,p){
    var val = o;
    if (p) val = o[p];
    return 'undefined' !== typeof val;
  },
  extend = function(out) {
    out = out || {};
    for (var i = 1; i < arguments.length; i++) {
      if (!arguments[i])
        continue;

      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key))
          out[key] = arguments[i][key];
      }
    }
    return out;
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
    parent = window.parent || {};
    parent.__TVPage__ = parent.__TVPage__ || {};

    var s = {};
    var config = parent.__TVPage__.config ? parent.__TVPage__.config : {};
    var id = document.body.getAttribute('data-id');
    
    if (!isset(config, id))
      return console.log('need settings');
    
    s = config[id];
    s.name = id;
    s.domain = document.body.getAttribute('data-domain') || '';
    s = extend(s, {"player_version":"1.8.6","progressColor":"#243193","transcript":true,"removeControls":["tvplogo","hd"],"autoplay":false,"autonext":true,"analytics":true,"playButtonHeight":"65px","playButtonWidth":"65px","playButtonBackgroundColor":"eeeeee","playButtonBorderRadius":"50","playButtonBorderWidth":"1px","playButtonBorderColor":"000","playButtonIconColor":"273691","overlay":true,"overlayColor":"fff","overlayOpacity":"0.7","clickText":"Watch Video","playText":"Watch Video","playTextSize":"19px","playTextColor":"333","playTextFontFamily":"Helvetica"});

    render('bbb',document.body);

    parent.addEventListener('message', function(e){
      if (!e || !isset(e, 'data') || !isset(e.data, 'event') || 'tvp_solo_click:data' !== e.data.event)
        return;

      s.data = e.data.response;      

      new Player('tvp-player-el-bbb',s);
    });

    parent.postMessage({
      event: 'tvp_solo_click:initialized'
    }, '*');
  };

  var not = function(obj){return 'undefined' === typeof obj};
  if ('undefined' === typeof window.Player) {
    var libsCheck = 0;
    (function libsReady() {
      setTimeout(function() {
        if (not(window.Player)) {
          (++libsCheck < 100) ? libsReady(): console.warn('limit reached');
        } else {
          initialize();
        }
      },50);
    })();
  } else {
    initialize();
  }

}(document));