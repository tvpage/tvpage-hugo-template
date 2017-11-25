var body = document.body;
var userAgent = navigator.userAgent;
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
'  if(c && \'function\' === typeof c){'+
'   l.onload=c;'+
'  }'+
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

function tmpl(t,d){
  return t.replace(/\{([\w\.]*)\}/g, function(str, key) {
    var keys = key.split("."),
      v = d[keys.shift()];
    for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
    return (typeof v !== "undefined" && v !== null) ? v : "";
  });
}

function isUndefined(o){
  return 'undefined' === typeof o;
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

function getEventType(e){
  var eArr = e.data.event.split(':');
  return eArr[0] === eventPrefix ? eArr[1] : '';
}

var __windowCallbackFunc__ = null,
    onChange = config.onChange;

if(isFunction(onChange)){
  __windowCallbackFunc__ = onChange;
  delete config.onChange;
}

//add preconnect hint
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
var holder;

config.id = id;
config.loginId = config.loginId || config.loginid;
config.channelId = (config.channelId || config.channelid) || config.channel.id;
config.events = {};
config.events.prefix = eventPrefix;
config.paths = {};
config.paths.libs = baseUrl + '/libs';
config.paths.static = static;
config.paths.dist = dist;
config.paths.javascript = static + dist + 'js';
config.paths.css = static + dist + 'css';
config.mobile = {};
config.mobile.path = isMobile ? 'mobile' : '';
config.mobile.prefix = isMobile ? '-mobile' : '';
config.mobile.templates = config.templates.mobile;

templates = isMobile ? config.mobile.templates : config.templates;

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

  html += load(o.js, 'JavaScript') + 
  load(o.css, 'CSS', 'function(){' +
  '   var skel = document.getElementById(\'skeleton\');' +
  '   skel && skel.classList.remove(\'hide\');' +
  '}'
  );

  html += '">';//closing the body tag
  html += '<style>' + (o.style || '') + '</style>';
  html += tmpl((o.html || '').trim(), o.context);

  return html;
};

//we have a generic host css per widget type that we only include once.
function getInitialHtml(){
  var hostStylesId = 'tvp-' + type + '-host';

  if(!getById(hostStylesId)){
    var hostStylesEl = createEl('style');
    hostStylesEl.id = hostStylesId;
    hostStylesEl.innerHTML = isMobile ? css.mobile.host : css.host;
    document.head.appendChild(hostStylesEl);
  }
  
  var hostCustom = 'host-custom';
  var hostCustomStyles = isMobile ? css.mobile[hostCustom] : css[hostCustom];
  var html = '';

  if(!isUndefined(hostCustomStyles))
    html += '<style>' + hostCustomStyles + '</style>';

  html += tmpl(initialHtml, config);

  return html;
}

//gets the player url
function getPlayerUrl(){
  var url = "https://cdnjs.tvpage.com/tvplayer/tvp-" + config.player_version + ".min.js";
  
  if (config.player_url && (config.player_url + "").trim().length) {
      url = config.player_url;
  }

  return url;
}

//Here's the first HTML write we do to the host page, this is the fastest way to do it
//refer to https://jsperf.com/insertadjacenthtml-perf/3
function widgetRender(){
  var targetEl = getById(config.targetEl);
  targetEl.insertAdjacentHTML('beforebegin', getInitialHtml());
  remove(targetEl);

  holder = getById(id + "-holder");
  
  var iframe = holder.querySelector("iframe");
  var iframeDocument = iframe.contentWindow.document;
  var paths = config.paths;

  iframeDocument.open().write(getIframeHtml({
    id: id,
    domain: baseUrl,
    style: config.css.base,
    context: config,
    html: templates.base,
    eventPrefix: eventPrefix,
    js: [
      '//a.tvpage.com/tvpa.min.js',
      '//imasdk.googleapis.com/js/sdkloader/ima3.js',
      getPlayerUrl(),
      debug ? paths.javascript + '/vendor/jquery.js' : '',
      debug ? paths.libs + '/utils.js' : '',
      debug ? paths.libs + '/analytics.js' : '',
      debug ? paths.libs + '/carousel.js' : '',
      debug ? paths.libs + '/player.js' : '',
      debug ? paths.javascript + '/index.js' : '',

      debug ? "" : paths.javascript + "/scripts.min.js"
    ],
    css: [
      debug ? baseUrl + '/bootstrap/dist/css/bootstrap.css' : '',
      debug ? baseUrl + '/slick/slick.css' : '',
      isMobile ? baseUrl + '/slick/mobile/custom.css' : '',
      !isMobile ? baseUrl + '/slick/custom.css' : '',
      debug ? paths.css + '/styles.css' : '',
      debug ? '' : paths.css + '/styles.min.css'
    ]
  }));

  iframeDocument.close();
  
  if(debug){
    console.log('renders initial dom (iframe w/skeleton)', performance.now() - startTime);
  }
}

function onWidgetLoad(data){
  if(debug){
    console.log('videos api call completed', performance.now() - startTime);
  }

  //We then add the data to the tvp global and then we fire the event that will start
  //things in the widget side.
  if(data && data.length){
    config.channel.videos = data;
    widgetRender();
  }else if(debug){
    console.log('videos api call returned 0 videos', performance.now() - startTime);   
  }
};

//api calls/loading, is here were we call the most important api(s) and it's the start of everything.
function widgetLoad(){

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

//handle events
window.addEventListener("message", function(e){
  if(!isEvent(e)){
    return;
  }

  var eventType = getEventType(e);
  
  if('widget_ready' === eventType){
    onWidgetReady(e);
  }

  if('widget_resize' === eventType){
    onWidgetResize(e);
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