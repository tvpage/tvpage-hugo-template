var body = document.body;

//helpers
var isObject = function(o) {
  return "object" === typeof o;
};
var isFunction = function(o) {
  return "function" === typeof o;
};
var hasKey = function(o, key) {
  return o.hasOwnProperty(key);
};
var getById = function(id){
  return document.getElementById(id);
};
var createEl = function(t){
  return document.createElement(t);
};
var randomStr = function(){
  return Math.random().toString(36).substring(7);
};

//add preconnect hint
var preConnectLink = createEl('link');
preConnectLink.rel = 'preconnect';
preConnectLink.href = 'http://api.tvpage.com/v1';
document.head.appendChild(preConnectLink);

//loads scripts more for jsonp
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

  var cbackName = 'tvp_callback_' + randomStr();

  window[cbackName] = function(data){
    if(isFunction(cback))
      cback(data);
  };

  script.src = src + '&callback=' + cbackName;

  body.appendChild(script);
};

//We merge the defaults, the .md file's params and the runtime input into one config object.
if (!isObject(config) || !hasKey(config, "name") || config.name.length <= 0)
  throw new Error('Widget must have a config and name (id)');

var tvpage = window.__TVPage__ = window.__TVPage__ || {};
var id = config.name;

if(hasKey(tvpage.config, id) && isObject(tvpage.config[id])){
  var runTime = tvpage.config[id];
  for (var key in runTime)
    config[key] = runTime[key];
}

if (!hasKey(config,"targetEl") || !getById(config.targetEl))
  throw new Error("Must provide a targetEl");

if(!hasKey(config,'channel') && !hasKey(config,'channelId') && !hasKey(config,'channelid'))
  throw new Error('Widget config missing channel obj');

var __windowCallbackFunc__ = null,
    onChange = config.onChange;

if(isFunction(onChange)){
  __windowCallbackFunc__ = onChange;
  delete config.onChange;
}

//globals
var debug = config.debug;
var type = config.type;
var css = config.css;
var baseUrl = config.baseUrl;
var static = baseUrl + '/' + type;
var dist = debug ? '/' : '/dist/';

config.id = id;
config.loginId = config.loginId || config.loginid;
config.channelId = (config.channelId || config.channelid) || config.channel.id;

config.events = {};
config.events.prefix = ('tvp_' + id).replace(/-/g, '_');

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

window.__TVPage__.config[id] = config;

//API calls/loading, is here were we call the most important api(s)
var loadVideosParams = {
  p: 0,
  n: config.items_per_page,
  o: config.videos_order_by,
  od: config.videos_order_direction,
  'X-login-id': config.loginId
};

var channelParams = config.channel.parameters;

if(channelParams){
  for (var channelParam in channelParams)
    loadVideosParams[channelParam] = channelParams[channelParam];
}

//load whatever you think is useful, then just call start
function sendStart(){
  window.postMessage({
    event: eventPrefix + ':start'
  }, '*');
};

//the videos call
loadScript({
  base: config.api_base_url + '/channels/' + config.channelId + '/videos',
  params: loadVideosParams
},function(data) {
  if(debug){
    console.log('videos api call completed', performance.now() - startTime);
  }

  //We then add the data to the tvp global and then we fire the event that will start
  //things in the widget side.
  config.channel.videos = data;

  sendStart();
});

//helpers
var userAgent = navigator.userAgent;
var isFirefox = /Firefox/i.test(userAgent);
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
var iOS = /iPad|iPhone|iPod|iPhone Simulator|iPad Simulator/.test(userAgent) && !window.MSStream;
var iframeBaseHtml = '<head><base target="_blank"/></head><body class="{className}"' +
'data-domain="{domain}" data-id="{id}" onload="startTime={startTime};' +
'var d=document,h=d.head,' +
'loadJavaScript = function(u){var s=d.createElement(\'script\');s.src=u;h.appendChild(s);},' +
'loadCSS = function(u){var l=d.createElement(\'link\');l.rel=\'stylesheet\';l.href=u;h.appendChild(l);};';
var tmpl = function(t,d){
  return t.replace(/\{([\w\.]*)\}/g, function(str, key) {
    var keys = key.split("."),
      v = d[keys.shift()];
    for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
    return (typeof v !== "undefined" && v !== null) ? v : "";
  });
};
var isUndefined = function(o){
  return 'undefined' === typeof o;
};
var isset = function(o, p) {
  var val = o;
  if (p) val = o[p];
  return "undefined" !== typeof val;
};
var addClass = function(obj, c) {
  if (!obj || !c) return;
  if ('string' === typeof obj) {
    document.getElementById(obj).classList.add(c);
  } else {
    obj.classList.add(c);
  }
};
var remove = function(el){
  el.parentNode.removeChild(el);
};
var removeClass = function(obj, c) {
  if (!obj || !c) return;
  if ('string' === typeof obj) {
    document.getElementById(obj).classList.remove(c);
  } else {
    obj.classList.remove(c);
  }
};

//Builds the document for iframes.
function getIframeHtml(o) {
  o.startTime = startTime;

  var html = tmpl(iframeBaseHtml,o),
  clean = function(s){
    return (s || []).filter(Boolean);
  },
  load = function(arr, type){
    arr = clean(arr);
    
    var arrLength = arr.length,
        l = '';

    for (var i = 0; i < arrLength; i++)
      l += 'load' + type + '(\'' + arr[i] + '\');';

    return l;
  };

  html +=
  '  function onStart(e){' +
  '    if(!e || !e.data || !e.data.event || \'' + o.eventPrefix + ':start\' !== e.data.event){' +
  '      return;' +
  '    }' +

       load(o.js, 'JavaScript') + load(o.css, 'CSS') +
       
       'var skeleton = document.getElementById(\'skeleton\');' + 
       'setTimeout(function(){skeleton && skeleton.classList.remove(\'hide\')},15);' +

  '    parent.removeEventListener(\'message\', onStart, false);' +
  '};';

  html +=
  '  if(parent){' +
  '    parent.addEventListener(\'message\', onStart, false);' +
  '  }else{' +
  '    console.log(\'# parent error! #\', parent);' +
  '  }' +
  '">' +

  '<style>' + (o.style || '') + '</style>';
  
  html += tmpl((o.html || '').trim(),o.context);

  return html;
};


//Initial rendering
//We have a generic host css per widget type that we only include once.
var getHostStyles = function(){
  var styles = '';
  var styleId = 'tvp-' + type + '-host';

  var host = isMobile ? css.mobile.host : css.host;

  if (!getById(styleId))
    styles += '<style id="' + styleId + '">' + host + '</style>';

  var custom = isMobile ? css.mobile['host-custom'] : css['host-custom'];
  
  if(!isUndefined(custom))
    styles += '<style>' + custom + '</style>'

  return styles;
};

var getInitialHtml = function(){
  var html = "";
  var hostId = "tvp-" + type + "-host";

  html += getHostStyles();
  html += '<div id="' + id + '-holder" class="tvp-'+type+'-holder">';
  html += '<iframe src="about:blank" allowfullscreen frameborder="0" scrolling="no" gesture="media"></iframe></div>';

  return html;
};

var getPlayerUrl = function(){
  var url = "https://cdnjs.tvpage.com/tvplayer/" + (debug ? "local/" : "/") + "tvp-" + config.player_version + ".min.js";
  if (config.player_url && (config.player_url + "").trim().length) {
      url = config.player_url;
  }
  return url;
};

//Here's the first HTML write we do to the host page, this is the fastest way to do it
//refer to https://jsperf.com/insertadjacenthtml-perf/3
var targetElement = getById(config.targetEl);
targetElement.insertAdjacentHTML('beforebegin',getInitialHtml());
remove(targetElement);

var eventPrefix = config.events.prefix;
var templates = isMobile ? config.mobile.templates : config.templates;
var javascriptPath = config.paths.javascript;
var cssPath = config.paths.css;
var holder = getById(id + "-holder");
var iframe = holder.querySelector("iframe");
var iframeDocument = iframe.contentWindow.document;
var iframeHtml = getIframeHtml({
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
    debug ? javascriptPath + "/vendor/jquery.js" : "",
    debug ? baseUrl + "/libs/utils.js" : "",
    debug ? baseUrl + "/libs/carousel.js" : "",
    debug ? baseUrl + "/libs/player.js" : "",
    debug ? javascriptPath + "/index.js" : "",

    debug ? "" : javascriptPath + "/scripts.min.js"
  ],
  css: [
    debug ? baseUrl + "/bootstrap-4.0.0/css/bootstrap.css" : "",
    debug ? cssPath + "/vendor/slick.css" : "",
    debug ? cssPath + '/styles.css' : '',

  debug ? '' : cssPath + '/styles.min.css'
  ]
});

iframeDocument.open().write(iframeHtml);
iframeDocument.close();
console.log('renders initial dom (iframe w/skeleton)', performance.now() - startTime);