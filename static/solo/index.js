//Helpers
var body = document.body;
var userAgent = navigator.userAgent;
var isFirefox = /Firefox/i.test(userAgent);
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
var iOS = /iPad|iPhone|iPod|iPhone Simulator|iPad Simulator/.test(userAgent) && !window.MSStream;
var iframeBaseHtml = '<head><base target="_blank"/></head><body class="{className}"' +
'data-domain="{domain}" data-id="{id}" onload="startTime={startTime};' + 
'var d=document,h=d.head,' +
'loadJS = function(u){var s=d.createElement(\'script\');s.src=u;h.appendChild(s);},' +
'loadCSS = function(u){var l=d.createElement(\'link\');l.rel=\'stylesheet\';l.href=u;h.appendChild(l);};';
var tmpl = function(t,d){
  return t.replace(/\{([\w\.]*)\}/g, function(str, key) {
    var keys = key.split("."),
      v = d[keys.shift()];
    for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
    return (typeof v !== "undefined" && v !== null) ? v : "";
  });
};
var isFunction = function(o) {
  return "function" === typeof o;
};
var isObject = function(o) {
  return "object" === typeof o;
};
var hasKey = function(o, key) {
  return o.hasOwnProperty(key);
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
var removeClass = function(obj, c) {
  if (!obj || !c) return;
  if ('string' === typeof obj) {
    document.getElementById(obj).classList.remove(c);
  } else {
    obj.classList.remove(c);
  }
};
var getById = function(id){
  return document.getElementById(id);
};
var getEventType = function(e) {
  var evt = null
  if (e && isset(e, "data") && isset(e.data, "event")) {
    evt = e.data.event;
  }

  if (evt && evt.length && evt.substr(0, eventPrefix.length) === eventPrefix) {
    return evt.substr(eventPrefix.length + 1);
  }

  return null;
};

//Builds the document for iframes.
function getIframeHtml(o) {
  o.startTime = startTime;

  var html = tmpl(iframeBaseHtml,o);
  var clean = function(s){
    return (s || []).filter(Boolean);
  };

  html += "function onStart(e){";
  html += "  if(!e || !e.data || !e.data.event || '" + o.eventPrefix + ":start' !== e.data.event){";
  html += "    return; ";
  html += "  }";
  
  var js = clean(o.js);
  for (var i = 0; i < js.length; i++)
    html += 'loadJS(\'' + js[i] + '\');';

  var css = clean(o.css);
  for (var i = 0; i < css.length; i++)
    html += 'loadCSS(\'' + css[i] + '\');';

  html += "  if(parent)";
  html += "    parent.removeEventListener('message', onStart, false);";
  html += "};";

  html += "  parent.addEventListener('message', onStart);";

  html += '"><style>' + (o.style || '') + '</style>';
  html += tmpl((o.html || '').trim(),o.context);

  return html;
};


//We merge the defaults, the .md file's params and the runtime input into one config object.
if (!isObject(bootstrap) || !hasKey(bootstrap, "name") || bootstrap.name.length <= 0)
  throw new Error('Widget must have a bootstrap and name (id)');

var config = bootstrap;
var id = bootstrap.name;
var tvpage = window.__TVPage__ = window.__TVPage__ || {};

if(hasKey(tvpage.config,id) && isObject(tvpage.config[id])){
  var runTime = tvpage.config[id];
  for (var key in runTime) {
    if (runTime.hasOwnProperty(key))
      config[key] = runTime[key];
  }
}

var __windowCallbackFunc__ = null;
if (hasKey(config,"onChange") && isFunction(config.onChange)){
  __windowCallbackFunc__ = config.onChange;
  delete config.onChange;
}

config.id = id;
config.eventPrefix = ("tvp_" + id).replace(/-/g, '_');
config.loginId = config.loginId || config.loginid;
config.channel = config.channel || {};
config.channel.videos = config.channel.videos || [];
config.channelId = (config.channelId || config.channelid) || config.channel.id;

window.__TVPage__.config[id] = config;

//Initial rendering
if (!hasKey(config,"targetEl") || !getById(config.targetEl))
  throw new Error("Must provide a targetEl");

var type = config.type;
var mobilePrefix = isMobile ? "-mobile" : "";
var css = config.css;
var cssMobile = config.css.mobile;
var baseUrl = config.baseUrl;
var staticPath = baseUrl + '/' + type;
var debug = config.debug;
var mobilePath = isMobile ? 'mobile/' : '';
var distPath = debug ? '/' : '/dist/';
var cssPath = staticPath + distPath + 'css/';
var jsPath = staticPath + distPath + 'js/';
var eventPrefix = config.eventPrefix;
var templates = config.templates;
var mobileTemplates = templates.mobile;

//We have a generic host css per widget type that we only include once.
var getHostStyles = function(){
  var styles = '';
  var styleId = 'tvp-' + type + '-host';
  var code = cssMobile && hasKey(cssMobile, 'host') ? cssMobile : css;

  if (!getById(styleId))
    styles += '<style id="' + styleId + '">' + code.host + '</style>';

  var custom = code['host-custom'];
  
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
targetElement.parentNode.removeChild(targetElement);

var holder = getById(id + "-holder");
var iframe = holder.querySelector("iframe");
var iframeDocument = iframe.contentWindow.document;
var iframeHtml = getIframeHtml({
  id: id,
  domain: baseUrl,
  context: config,
  style: config.css.base,
  html: config.templates.base,
  eventPrefix: eventPrefix,
  js: [
    "//a.tvpage.com/tvpa.min.js",
    '//imasdk.googleapis.com/js/sdkloader/ima3.js',
    getPlayerUrl(),
    debug ? jsPath + "vendor/simple-scrollbar.min.js" : "",
    debug ? baseUrl + "libs/utils.js" : "",
    debug ? baseUrl + "libs/analytics.js" : "",
    debug ? baseUrl + "libs/player.js" : "",
    debug ? jsPath + "menu.js" : "",
    debug ? jsPath + "index.js" : "",
    debug ? "" : jsPath + "scripts.min.js"
  ],
  css: [
    debug ? cssPath + "styles.css" : "",
    debug ? "" : cssPath + "styles.min.css"
  ]
});

iframeDocument.open().write(iframeHtml);
iframeDocument.close();
console.log('renders initial dom (iframe w/skeleton)', performance.now() - startTime);


//API calls/loading, is here were we call the most important api(s)
if(!hasKey(config,'channel') && !hasKey(config,'channelId') && !hasKey(config,'channelid'))
  throw new Error('Widget config missing channel obj');

var cbackName = 'tvp_callback_' + Math.random().toString(36).substring(7);

window[cbackName] = function(data){
  console.log('call to api completed', performance.now() - startTime);
  
  //Preload data images.. this can be done smarter depending on the template, for example
  //carousel on mobile will need to preload first image only whilst desktop needs
  //same qty as the items_per_page setting.
  config.toPreload = isMobile ? 1 : config.items_per_page;

  for (var i = 0; i < data.length; i++) {
    if(hasKey(data[i],'asset'))
      (new Image()).src = data[i].asset.thumbnailUrl;

    if(i + 1 == config.toPreload)
      break;
  }
  
  console.log('first page of video images preloaded', performance.now() - startTime);

  //We then add the data to the tvp global and then we fire the event that will start
  //things in the widget side.
  config.channel.videos = data;

  //This is the first event that start things out
  setTimeout(function(){
    window.postMessage({
      event: eventPrefix + ':start'
    }, '*');
  },0);
};

var channel = config.channel || {};
var channelId = channel.id || config.channelId;

var src = config.api_base_url + '/channels/' + channelId + '/videos';
var callParams = {
  p: 0,
  n: config.items_per_page + 1,
  o: config.videos_order_by,
  od: config.videos_order_direction,
  'X-login-id': config.loginId,
  callback: cbackName
};

var c = 0;
for (var param in callParams) {
  src += (c > 0 ? '&' : '?') + param + '=' + callParams[param];
  ++c;
}

if(channel.parameters){
  var channelParams = channel.parameters;
  for (var channelParam in channelParams)
    src += '&' + channelParam + '=' + channelParams[channelParam];
}

var jsonpScript = document.createElement('script');
jsonpScript.src = src;
body.appendChild(jsonpScript);