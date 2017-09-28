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
var extend = function(out) {
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


//Configuration
if (!isObject(bootstrap) || !hasKey(bootstrap, "name") || bootstrap.name.length <= 0)
  throw new Error('Widget must have a bootstrap and name (id)');

var config = bootstrap;
var id = bootstrap.name;
var tvpage = window.__TVPage__ = window.__TVPage__ || {};

if(hasKey(tvpage.config,id) && isObject(tvpage.config[id]))
  config = extend(config, tvpage.config[id]);

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
var mobilePrefix = isMobile ? "-mobile" : "";
var css = config.css;
var baseUrl = config.baseUrl;
var staticPath = baseUrl + type;
var debug = config.debug;
var mobilePath = isMobile ? 'mobile/' : '';
var distPath = debug ? '/' : '/dist/';
var cssPath = staticPath + distPath + 'css/';
var jsPath = staticPath + distPath + 'js/';
var eventPrefix = ("tvp_" + id).replace(/-/g, '_');
var templates = config.templates;

var getInitialHtml = function(){
  var html = "";
  
  var hostId = "tvp-"+type+"-host";
  if (!getById(hostId))
    html += '<style id="'+hostId+'">' + css["host"+mobilePrefix] + '</style>';

  html += '<style>' + css["host-custom"+mobilePrefix] + '</style>';
  html += '<div id="' + id + '-holder" class="tvp-'+type+'-holder">';

  return html;
};

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

var loadVideos = function(fn){
  var script = document.createElement('script');
  var cbName = 'tvpcallback' + Math.floor(Math.random() * 50005);
  var src = config.api_base_url + '/channels/' + channelId + '/videos?X-login-id=' + (config.loginId || config.loginid);

  var params = channel.parameters || {};
  for (var p in params) {
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
  if (e && isset(e, "data") && isset(e.data, "event")) {
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
          event: eventPrefix + ':modal_holder_resize',
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

  iframeModalHolder.innerHTML = '<iframe class="tvp-iframe-modal" src="about:blank" allowfullscreen frameborder="0" scrolling="no"></iframe>';
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
      debug ? baseUrl + "libs/utils.js" : "",
      debug ? baseUrl + "libs/analytics.js" : "",
      debug ? baseUrl + "libs/player.js" : "",
      debug ? jsPath + "modal/index.js" : "",
      debug ? "" : jsPath + "modal/scripts.min.js"
    ],
    css: [
      debug ? cssPath + mobilePath + "modal/styles.css" : "",
      debug ? "" : cssPath + mobilePath + "modal/styles.min.css"
    ]
  }));

  iframeModalDocument.close();
};