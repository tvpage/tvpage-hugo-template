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
  var html = "";
  var styleId = 'tvp-' + type + '-host';
  
  var hostStyles = isMobile ? css.mobile.host : css.host;

  if (!getById(styleId))
    html += '<style id="' + styleId + '">' + hostStyles + '</style>';
  
  var hostCustomStyles = isMobile ? css.mobile['host-custom'] : css['host-custom'];
  
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

var targetElement = getById(config.targetEl);
targetElement.insertAdjacentHTML('beforebegin',getInitialHtml());
targetElement.parentNode.removeChild(targetElement);

var holder = getById(id + "-holder");
var channel = config.channel || {};
var channelId = channel.id || config.channelid || config.channelId;
if (!channelId) {
  holder.parentNode.removeChild(holder);
}

//Modal
var modalContainer = document.createElement("div");
modalContainer.innerHTML = templates['modal'];
body.appendChild(modalContainer);

var clickData = {};
var iframeModalHolder = getById('tvp-modal-iframe-holder-' + id);
var iframeModal = null;
var iframeModalDocument = null;
var modal = getById("tvp-modal-" + id);

addClass(modal,isMobile ? "mobile" : "desktop");

if (config.modal_title_position.trim().length && "bottom" === config.modal_title_position) {
  var modalTitleEl = modal.querySelector("#tvp-modal-title-" + id);
  addClass(modalTitleEl,"bottom")
  modal.querySelector(".tvp-modal-body").appendChild(modalTitleEl);
}

var removeBanner = function() {
  var banner = modal.querySelector('.tvp-no-products-banner');
  if (banner){
    banner.parentNode.removeChild(banner);
  }
};

var closeModal = function() {
  addClass(modal, 'tvp-hidden');
  addClass('tvp-modal-overlay-' + id, 'tvp-hidden');

  removeBanner();
  removeClass(iframeModalHolder, 'products');
  removeClass(iframeModalHolder, 'no-products');
  removeClass(modal.querySelector('.tvp-products-headline'), 'active');

  iframeModal.parentNode.removeChild(iframeModal);

  if (config.fix_page_scroll)
    removeClass(body, 'tvp-modal-open');

  window.postMessage({
    event: eventPrefix + ':modal_close'
  }, '*');
};

getById("tvp-modal-close-" + id).addEventListener('click', closeModal, false);

modal.addEventListener('click', function(e) {
  if (e.target === modal || !modal.contains(e.target)) {
    closeModal();
  }
}, false);

function loadVideos(fn){
  var script = document.createElement('script');
  var cbName = 'tvpcallback' + Math.floor(Math.random() * 50005);
  var src = config.api_base_url + '/channels/' + channelId + '/videos?X-login-id=' + (config.loginId || config.loginid);

  var params = channel.parameters || {};
  for (var p in params) {
    if (params.hasOwnProperty(p))
      src += '&' + p + '=' + params[p];
  }
  
  src += "&callback=" + cbName;
  script.src = src;

  window[cbName] = function(data) {
    if (data.length && isFunction(fn))
      fn(data)
  };

  body.appendChild(script);
};

loadVideos(function(data){
  holder.classList.add("initialized");
  
  var overlayEl = document.createElement("div");
  overlayEl.className = "tvp-cta-overlay";
  var video = data[0];
  overlayEl.style.backgroundImage = "url(" + video.asset.thumbnailUrl + ")";
  var template = config.templates.cta;
  template += "<div class='tvp-cta-text'>" + video.title + "</div>";

  overlayEl.innerHTML = template;

  var configCopy = JSON.parse(JSON.stringify(config));
  delete configCopy.no_products_banner;
  configCopy.onPlayerChange = !!config.onPlayerChange;

  clickData = {
    data: data,
    selectedVideo: data[0],
    runTime: configCopy
  };

  overlayEl.removeEventListener("click", handleVideoClick, false);
  overlayEl.addEventListener("click", handleVideoClick, false);
  holder.appendChild(overlayEl);
});

var getEventType = function(e) {
  var evt = null
  if (e && 'undefined' !== typeof e.data && 'undefined' !== typeof e.data.event) {
    evt = e.data.event;
  }

  if (evt && evt.length && evt.substr(0, eventPrefix.length) === eventPrefix) {
    return evt.substr(eventPrefix.length + 1);
  }

  return null;
};

window.addEventListener("message", function(e) {
  var eventType = getEventType(e);
  switch (eventType) {
    case 'modal_initialized':
      handleModalInitialized(e);
      break;
    case 'player_next':
      handlePlayerNext(e);
      break;
    default:
  }

  if (__windowCallbackFunc__)
    __windowCallbackFunc__(e);
});

function handleModalInitialized(e) {
  if (iframeModal.contentWindow) {
    iframeModal.contentWindow.postMessage({
      event: eventPrefix + ':modal_data',
      data: clickData.data,
      selectedVideo: clickData.selectedVideo,
      runTime: clickData.runTime
    }, '*');
  }

  if (iOS) {
    var onOrientationChange = function() {
      if (iframeModal && iframeModal.contentWindow) {
        var width = iframeModal.parentNode.offsetWidth;
        iframeModal.contentWindow.window.postMessage({
          event: eventPrefix + ':external_resize',
          size: [width, Math.floor(width * (9 / 16))]
        }, '*');
      }
    };
    var orientationChangeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize';
    window.removeEventListener(orientationChangeEvent, onOrientationChange, false);
    window.addEventListener(orientationChangeEvent, onOrientationChange, false);
  }
};

function handlePlayerNext(e) {
  updateModalTitle(e.data.next.assetTitle);
};

var getPlayerUrl = function(){
  var url = "https://cdnjs.tvpage.com/tvplayer/tvp-" + config.player_version + ".min.js";
  if (config.player_url && (config.player_url + "").trim().length) {
    url = config.player_url;
  }
  return url;
};

function handleVideoClick() {
  modal.querySelector('.tvp-modal-title').innerHTML = clickData.selectedVideo.title || "";
  removeClass(modal, 'tvp-hidden');
  removeClass('tvp-modal-overlay-' + id, 'tvp-hidden');

  if (config.fix_page_scroll) {
    addClass(document.body, 'tvp-modal-open');
  }

  iframeModalHolder.innerHTML = '<iframe class="tvp-iframe-modal" src="about:blank" allowfullscreen frameborder="0" scrolling="no" gesture="media"></iframe>';
  iframeModal = iframeModalHolder.querySelector('.tvp-iframe-modal');
  iframeModalDocument = iframeModal.contentWindow.document;
  iframeModalDocument.open().write(getIframeHtml({
    id: id,
    domain: baseUrl,
    style: css.modal,
    className: isMobile ? " mobile" : "",
    html: templates["modal-content" + (isMobile ? "-mobile" : "")],
    js: [
      "//a.tvpage.com/tvpa.min.js",
      '//imasdk.googleapis.com/js/sdkloader/ima3.js',
      getPlayerUrl(),
      debug ? baseUrl + "/libs/utils.js" : "",
      debug ? baseUrl + "/libs/analytics.js" : "",
      debug ? baseUrl + "/libs/player.js" : "",
      debug ? javascriptPath + "/modal/index.js" : "",
      debug ? "" : javascriptPath + "/modal/scripts.min.js"
    ],
    css: [
      debug ? cssPath + mobilePath + "/modal/styles.css" : "",
      debug ? "" : cssPath + mobilePath + "/modal/styles.min.css"
    ]
  }));

  iframeModalDocument.close();
};