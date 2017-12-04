var body = document.body;
var userAgent = navigator.userAgent;
var isFirefox = /Firefox/i.test(userAgent);
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
var iOS = /iPad|iPhone|iPod|iPhone Simulator|iPad Simulator/.test(userAgent) && !window.MSStream;
var initialHtml = '<div id="{id}-holder" class="tvp-{type}-holder">' +
'<iframe src="about:blank" allowfullscreen frameborder="0" scrolling="no" gesture="media"></iframe>' +
'</div>';
var iframeHtmlStart = '<head><base target="_blank"/></head><body class="{className}"' +
'data-domain="{domain}" data-id="{id}" onload="startTime={startTime};' +
'var d=document,h=d.head,' +
'loadJavaScript = function(u){var s=d.createElement(\'script\');s.src=u;h.appendChild(s);},' +
'loadCSS = function(u,c){'+
'  var l=d.createElement(\'link\');'+
'  l.rel=\'stylesheet\';'+
'  l.href=u;'+
'  h.appendChild(l);' +
'};';

//helpers
function isObject(o) {
  return "object" === typeof o;
}

function isFunction(o) {
  return "function" === typeof o;
}

function hasKey(o, key) {
  return o.hasOwnProperty(key);
}

function getById(id){
  return document.getElementById(id);
}

function createEl(t){
  return document.createElement(t);
}

function isUndefined(o){
  return 'undefined' === typeof o;
}

function logSnapshot(msg) {
  if(window.performance && 'undefined' !== typeof startTime){
    console.log(msg, performance.now() - startTime);
  }
}

function tmpl(t,d){
  return t.replace(/\{([\w\.]*)\}/g, function(str, key) {
    var keys = key.split("."),
      v = d[keys.shift()];
    for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
    return (typeof v !== "undefined" && v !== null) ? v : "";
  });
}

function addClass(obj, c) {
  if (!obj || !c) return;
  if ('string' === typeof obj) {
    document.getElementById(obj).classList.add(c);
  } else {
    obj.classList.add(c);
  }
}

function removeClass(obj, c) {
  if (!obj || !c) return;
  if ('string' === typeof obj) {
    document.getElementById(obj).classList.remove(c);
  } else {
    obj.classList.remove(c);
  }
}

function remove(el){
  el.parentNode.removeChild(el);
}

function cleanArray(a){
  return a.filter(Boolean);
}

function loadScript(options, cback){
  var opts = options || {};
  var script = createEl('script');
  var params = opts.params || {};
  var c = 0;
  var src = opts.base || '';

  for (var param in params) {
    src += (c > 0 ? '&' : '?') + param + '=' + params[param];
    ++c;
  }

  var cName = 'tvp_callback_' + Math.random().toString(36).substring(7);

  window[cName] = function(data){
    if(isFunction(cback))
      cback(data);
  };

  script.src = src + '&callback=' + cName;

  body.appendChild(script);
}

function isEvent(e){
  return e && e.data && e.data.event;
}

function getEventName(e){
  var eArr = e.data.event.split(':');
  return eArr[0] === eventPrefix ? eArr[1] : '';
}

//we add the preconnect hints as soon as we can
var preConnectLink = createEl('link');
preConnectLink.rel = 'preconnect';
preConnectLink.href = config.api_base_url;
document.head.appendChild(preConnectLink);

//here we start with the actual logic that will prepare the iframe(s) content and inject it
//to the page.
var debug = config.debug;
var type = config.type;
var css = config.css;
var baseUrl = config.baseUrl;
var static = baseUrl + '/' + type;
var dist = debug ? '/' : '/dist/';
var eventPrefix = ('tvp_' + id).replace(/-/g, '_');
var templates;
var javascriptPath;
var cssPath;
var holder;
var mobilePath;

config.id = id;
config.loginId = config.loginId || config.loginid;
config.channelId = (config.channelId || config.channelid) || config.channel.id;
config.events = {};
config.events.prefix = eventPrefix;
config.paths = {};
config.paths.baseUrl = baseUrl;
config.paths.static = static;
config.paths.dist = dist;
config.paths.javascript = static + dist + 'js';
config.paths.css = static + dist + 'css';
config.mobile = {};
config.mobile.path = isMobile ? 'mobile' : '';
config.mobile.prefix = isMobile ? '-mobile' : '';
config.mobile.templates = config.templates.mobile;

mobilePath = config.mobile.path;
templates = isMobile ? config.mobile.templates : config.templates;
javascriptPath = config.paths.javascript;
cssPath = config.paths.css;

window.__TVPage__.config[id] = config;

//builds the document html for an iframe
function getIframeHtml(o){
  o.startTime = startTime;

  var html = tmpl(iframeHtmlStart, o),
      load = function(arr, type, cback){
        arr = cleanArray(arr);
        
        var arrLength = arr.length,
            l = '';

        for (var i = 0; i < arrLength; i++){
          var last = arrLength == i + 1;
          l += 'load' + type + '(\'' + arr[i] + '\'' + (last && cback ? (',' + cback) : '') + ');';
        }

        return l;
      };

  html += load(o.js, 'JavaScript') + load(o.css, 'CSS');
  html += '">';//closing the body tag
  html += '<div id="bs-checker" class="invisible"></div>';//helper to check bs is loaded
  html += '<style>' + (o.style || '') + '</style>';
  html += tmpl((o.html || '').trim(), o.context);

  return html;
};

//we have a generic host css per widget type that we only include once.
function getInitialHtml(){
  var html = "";
  var styleId = 'tvp-' + type + '-host';
  
  var hostStyles = isMobile ? css.mobile.host : css.host;

  if(!getById(styleId)){
    html += '<style id="' + styleId + '">' + hostStyles + '</style>';
  }

  html += tmpl(initialHtml, config);

  return html;
}

//build the player url
function getPlayerUrl(){
  var url = "https://cdnjs.tvpage.com/tvplayer/tvp-" + config.player_version + ".min.js";
  
  if (config.player_url && (config.player_url + "").trim().length) {
      url = config.player_url;
  }

  return url;
}

function widgetRender(){
  //here's the first HTML write we do to the host page, this is the fastest way to do it
  //refer to https://jsperf.com/insertadjacenthtml-perf/3  
  function render(){
    var targetElement = getById(config.targetEl);
    targetElement.insertAdjacentHTML('beforebegin',getInitialHtml());
    remove(targetElement);
  
    holder = getById(id + "-holder");
  
    var iframe = holder.querySelector("iframe");
    var iframeDocument = iframe.contentWindow.document;
    var libsPath = baseUrl + '/libs';
  
    iframeDocument.open().write(getIframeHtml({
      id: id,
      domain: baseUrl,
      context: config,
      html: templates.base,
      eventPrefix: eventPrefix,
      js: [
        '//a.tvpage.com/tvpa.min.js',
        debug ? javascriptPath + '/vendor/jquery.js' : '',
        debug ? libsPath + '/utils.js' : '',
        debug ? libsPath + '/analytics.js' : '',
        debug ? libsPath + '/carousel.js' : '',
        debug ? javascriptPath + '/index.js' : '',
        debug ? "" : javascriptPath + '/scripts.min.js'
      ],
      css: [
        debug ? baseUrl + '/slick/slick.css' : '',
        isMobile ? baseUrl + '/slick/mobile/custom.css' : '',
        !isMobile ? baseUrl + '/slick/custom.css' : '',
        debug ? baseUrl + '/bootstrap/dist/css/bootstrap.css' : '',
        debug ? cssPath + '/styles.css' : '',
        debug ? '' : cssPath + '/styles.min.css'
      ]
    }));
  
    iframeDocument.close();
  }

  //we will poll if the target element is not in the page immediately, this is required to cover
  //scenarios where customer add this element lazily.
  if(getById(config.targetEl)){
    render();
  }else{
    var targetElCheck = 0;
    var targetElCheckLimit = 1000;
    
    (function checkTargetEl(){
      setTimeout(function() {
        console.log('targetEl poll...');
        
        var ready = true;
        if(!getById(config.targetEl))
          ready = false;
    
        if(ready){
          render();
          
          if(debug){
            logSnapshot('renders initial dom (iframe w/skeleton)');
          }
        }else if(++targetElCheck < targetElCheckLimit){
          checkTargetEl()
        }else{
          throw new Error("targetEl doesn't exist on page");
        }
      },5);
    })();
  }
}

function onWidgetLoad(data){
  var dataLength = !!data.length ? data.length : 0;
  
  if(dataLength){
    config.channel.videos = data;
    widgetRender();
  }

  if(debug){
    logSnapshot('videos api returned: ' + dataLength + ' item(s) in: ')
  }
};

//api calls/loading, is here were we call the most important api(s) and it's the start 
//of everything.
function widgetLoad(){

  //API calls/loading, is here were we call the most important api(s)
  var videosLoadParams = {
    p: 0,
    n: config.items_per_page,
    o: config.videos_order_by,
    od: config.videos_order_direction,
    'X-login-id': config.loginId
  };

  var channelParams = config.channel.parameters;

  if(channelParams){
    for (var channelParam in channelParams)
      videosLoadParams[channelParam] = channelParams[channelParam];
  }

  //the videos call
  loadScript({
    base: config.api_base_url + '/channels/' + config.channelId + '/videos',
    params: videosLoadParams
  },onWidgetLoad);
}

widgetLoad();

//handle the widget events
window.addEventListener("message", function(e){
  if(!isEvent(e)){
    return;
  }

  var eventName = getEventName(e);
  
  if('widget_ready' === eventName){
    onWidgetReady(e);
  }

  if('widget_resize' === eventName){
    console.log('### widget_resize')
    onWidgetResize(e);
  }

  if('widget_videos_carousel_click' === eventName){
    onWidgetVideosCarouselClick(e);
  }

  if('widget_modal_close' === eventName){
    onWidgetModalClose(e);
  }

  //? how to order this?
  if('widget_player_change' === eventName){
    onWidgetPlayerChange(e);
  }

  if (__windowCallbackFunc__)
    __windowCallbackFunc__(e);
});

//event handlers
function onWidgetReady(e) {
  holder.style.height = e.data.height + 'px';
}

function onWidgetResize(e) {
  holder.style.height = e.data.height + 'px';
}

function onWidgetPlayerChange(e){
  config.onPlayerChange(e.data.e, e.data.stateData);
}

var iframeModal;

function onWidgetModalClose(e){
  remove(iframeModal);

  iframeModal = null;
}

function widgetModalRender(){
  if(!document.body){
    throw new Error("document body doesn't exists, try placing embed code after <body>");
  }
  
  if(iframeModal){
    if(config.debug){
      console.log("modal already exists");
    }

   return; 
  }

  var modalTargetEl = createEl('div');
  modalTargetEl.id = config.id + '-modal-target';
  
  document.body.appendChild(modalTargetEl);
  
  modalTargetEl.insertAdjacentHTML('beforebegin', templates.modal.iframe);
  
  remove(modalTargetEl);

  iframeModal = getById('tvp-' + config.id + '-modal-iframe');
  
  var iframeModalDocument = iframeModal.contentWindow.document;
  
  iframeModalDocument.open().write(getIframeHtml({
    id: id,
    domain: baseUrl,
    context: config,
    eventPrefix: eventPrefix,
    style: 'body{background:none transparent;}',
    className: isMobile ? "mobile" : "",
    html: templates.modal.base,
    js: [
      "//a.tvpage.com/tvpa.min.js",
      '//imasdk.googleapis.com/js/sdkloader/ima3.js',
      getPlayerUrl(),
      debug ? baseUrl + "/libs/utils.js" : "",
      debug ? baseUrl + "/libs/analytics.js" : "",
    debug ? baseUrl + "/libs/player.js" : "",
      debug ? baseUrl + "/libs/carousel.js" : "",

      //this has to be an option
      debug ? baseUrl + "/libs/rail.js" : "",

      debug ? javascriptPath + "/vendor/jquery.js" : "",
      debug ? javascriptPath + "/" + mobilePath + "/modal/index.js" : "",
      debug && !isMobile ? javascriptPath + "/vendor/perfect-scrollbar.min.js" : "",
      debug ? "" : javascriptPath + "/" + mobilePath + "/modal/scripts.min.js"
    ],
    css: [
      debug ? baseUrl + '/bootstrap/dist/css/bootstrap.css' : '',
      debug ? cssPath + "/base.css" : '',
      debug ? cssPath + "/" + mobilePath + "/modal/styles.css" : '',
      debug && isMobile ? baseUrl + "/slick/slick.css" : '',
      isMobile ? baseUrl + '/slick/mobile/custom.css' : '',
      !isMobile ? baseUrl + '/slick/custom.css' : '',
      debug && !isMobile ? cssPath + "/vendor/perfect-scrollbar.min.css" : "",
      debug ? "" : cssPath + "/" + mobilePath + "/modal/styles.min.css"
    ]
  }));

  iframeModalDocument.close();
}

function onWidgetModalLoad(data){
  var dataLength = !!data.length ? data.length : 0;
  
  if(dataLength){
    widgetModalRender();
  }
}

function widgetModalLoad(data){
  onWidgetModalLoad(data);
}

function onWidgetVideosCarouselClick(e){
  var videos = config.channel.videos;
  var selected = null;
  var clicked = e.data.clicked;

  for (var i = 0; i < videos.length; i++)
    if (videos[i].id === clicked)
      selected = videos[i];

  if(!selected)
    return;

  config.clicked = clicked;

  widgetModalLoad(videos);
}