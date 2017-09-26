//Helpers
var body = document.body;
var userAgent = navigator.userAgent;
var isFirefox = /Firefox/i.test(userAgent);
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
var iOS = /iPad|iPhone|iPod|iPhone Simulator|iPad Simulator/.test(userAgent) && !window.MSStream;
var isFunction = function(o) {
  return "function" === typeof o;
};
var isObject = function(o) {
  return "object" === typeof o;
};
var hasKey = function(o, key) {
  return o.hasOwnProperty(key);
};
var isset = function(o, p) {
  var val = o;
  if (p) val = o[p];
  return "undefined" !== typeof val;
};
var getIframeHtml = function(options) {
  var html = '<head><base target="_blank" /></head><body class="' + (options.className || '') + '" data-domain="' +
    (options.domain || '') + '" data-id="' + (options.id || '') + '" onload="' +
    'var d = document, head = d.getElementsByTagName(\'head\')[0],' +
    'addJS = function(u){ var s = d.createElement(\'script\');s.src=u;d.body.appendChild(s);},' +
    'addCSS = function(h){ var l = d.createElement(\'link\');l.rel=\'stylesheet\';l.href=h;head.appendChild(l);};';

  var js = (options.js || []).filter(Boolean);
  for (var i = 0; i < js.length; i++) {
    html += 'addJS(\'' + js[i] + '\');';
  }

  var css = (options.css || []).filter(Boolean);
  for (var i = 0; i < css.length; i++) {
    html += 'addCSS(\'' + css[i] + '\');';
  }
  
  html += '"><style>' + (options.style || '') + '</style>';
  html += (options.html || '').trim();

  return html;
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


//Configuration
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

config.id = id;

var __windowCallbackFunc__ = null;
if (hasKey(config,"onChange") && isFunction(config.onChange)){
  __windowCallbackFunc__ = config.onChange;
  delete config.onChange;
}

//We pass the updated merged config object to the tvpage global so the iframe files can retrieve
//it from the parent global.
window.__TVPage__.config[id] = config;


//Initial render
if (!hasKey(config,"targetEl") || !getById(config.targetEl))
  throw new Error("Must provide a targetEl");

var type = config.type;
var css = config.css;
var baseUrl = config.baseUrl;
var staticPath = baseUrl + type;
var debug = config.debug;
var distPath = debug ? '/' : '/dist/';
var cssPath = staticPath + distPath + 'css/';
var jsPath = staticPath + distPath + 'js/';
var eventPrefix = ("tvp_" + id).replace(/-/g, '_');
var templates = config.templates;

var getInitialHtml = function(){
  var html = "";
  var hostId = "tvp-"+type+"-host";
  if (!getById(hostId))
    html += '<style id="'+hostId+'">' + css["host"] + '</style>';

  html += '<style>' + css["host-custom"] + '</style>';
  html += '<div id="' + id + '-holder" class="tvp-'+type+'-holder">';
  html += '<iframe src="about:blank" allowfullscreen frameborder="0" scrolling="no" gesture="media"></iframe></div>';

  return html;
};

//Some logic to include the player library.. we support diff things.
var playerUrl = "https://cdnjs.tvpage.com/tvplayer/tvp-" + config.player_version + ".min.js";
if (config.player_url && (config.player_url + "").trim().length) {
  playerUrl = config.player_url;
}

var targetElement = getById(config.targetEl);
targetElement.insertAdjacentHTML('beforebegin',getInitialHtml());
targetElement.parentNode.removeChild(targetElement);

var holder = getById(id + "-holder");
var iframe = holder.querySelector("iframe");
var iframeDocument = iframe.contentWindow.document;
var iframeHtml = getIframeHtml({
  id: id,
  className: "dynamic",
  domain: baseUrl,
  style: css.carousel,
  js: [
    "//a.tvpage.com/tvpa.min.js",
    '//imasdk.googleapis.com/js/sdkloader/ima3.js',
    playerUrl,
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

//First iframe render (//https://bugzilla.mozilla.org/show_bug.cgi?id=728151)
if (isFirefox) {
  iframe.contentWindow.contents = iframeHtml;
  iframe.src = 'javascript:window["contents"]';
} else {
  iframeDocument.open().write(iframeHtml);
  iframeDocument.close();
}

window.addEventListener("message", function(e){
  if(e && e.data && hasKey(e.data,'event') && e.data.event === eventPrefix + ':render') {
    addClass(holder,'initialized')
  }
});

//Listen to orientation/resize changes in the external page whenever the widget
//is being used in an iOS device so we can send the size information to the
//player so it can resize itself.
if (iOS) {
  var onOrientationChange = function () {
    if (iframe && iframe.contentWindow) {
      var width = iframe.parentNode.offsetWidth;
      iframe.contentWindow.window.postMessage({
        event: eventPrefix + ':holder_resize',
        size: [width, Math.floor(width * (9 / 16))]
      },'*');
    }
  };
  var orientationChangeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize';
  window.removeEventListener(orientationChangeEvent,onOrientationChange, false);
  window.addEventListener(orientationChangeEvent,onOrientationChange, false);
}