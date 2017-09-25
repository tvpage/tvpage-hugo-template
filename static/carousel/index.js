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
  html += '<iframe src="about:blank" allowfullscreen frameborder="0" scrolling="no" gesture="media"></iframe></div>';

  return html;
};

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
    debug ? jsPath + "vendor/jquery.js" : "",
    debug ? baseUrl + "libs/utils.js" : "",
    debug ? baseUrl + "libs/analytics.js" : "",
    debug ? jsPath + "carousel.js" : "",
    debug ? jsPath + "index.js" : "",
    debug ? "" : jsPath + "scripts.min.js"
  ],
  css: [
    debug ? cssPath + "styles.css" : "",
    debug ? cssPath + "vendor/slick.css" : "",
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

//Modal
var modalContainer = document.createElement("div");
modalContainer.innerHTML = templates['modal'].modal;
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

//Listen and handle messages coming from the widget
window.addEventListener("message", function(e) {
  switch (getEventType(e)) {
    case 'video_click':
      handleVideoClick(e);
      break;
    case 'modal_initialized':
      handleModalInitialized(e);
      break;
    case 'modal_no_products':
      handleModalNoProducts(e);
      break;
    case 'modal_products':
      handleModalProducts(e);
      break;
    case 'player_next':
      handlePlayerNext(e);
      break;
    case 'modal_resize':
      handleModalResize(e);
      break;
    case 'render':
      handleRender(e);
      break;
    case 'resize':
      handleResize(e);
      break;
    case 'on_player_change':
      handleOnPlayerChange(e);
      break;
    default:
  }

  if (__windowCallbackFunc__)
    __windowCallbackFunc__(e);
});

function handleOnPlayerChange(e){
  config.onPlayerChange(e.data.e, e.data.stateData);
}

function handleRender(e) {
  addClass(holder, "initialized");
  isset(config, 'background') ? holder.style.cssText += 'background-color:' + config.background + ';' : null;
  isset(config, 'title_color') ? iframeDocument.getElementsByClassName('tvp-carousel-title')[0].style.cssText += 'color:' + config.title_color + ';' : null;
  var videosTitle = iframeDocument.querySelectorAll('.tvp-video-title');
  for (var i = videosTitle.length - 1; i >= 0; i--) {
    isset(config, 'item_title_font_color') ? videosTitle[i].style.cssText += 'color:' + config.item_title_font_color + ';' : null;
  }
}

function handleResize(e) {
  if (!modal.classList.contains("tvp-hidden") || !e.data.height)
    return;

  holder.style.height = e.data.height;
}

function handleVideoClick(e) {
  if (!e || !e.data)
    return;

  var configCopy = JSON.parse(JSON.stringify(config));
  delete configCopy.no_products_banner;
  
  configCopy.onPlayerChange = !!config.onPlayerChange;

  var eventData = e.data;
  var clickedVideo = eventData.selectedVideo;

  clickData = {
    data: eventData.videos,
    selectedVideo: clickedVideo,
    runTime: configCopy
  };

  modal.querySelector('.tvp-modal-title').innerHTML = clickedVideo.title || "";
  removeClass(modal, 'tvp-hidden');
  removeClass('tvp-modal-overlay-' + id, 'tvp-hidden');

  if (config.fix_page_scroll) {
    addClass(body, 'tvp-modal-open');
  }

  //Some logic to include the player library.. we support diff things.
  var playerUrl = "https://cdnjs.tvpage.com/tvplayer/tvp-" + config.player_version + ".min.js";
  if (config.player_url && (config.player_url + "").trim().length) {
    playerUrl = config.player_url;
  }

  iframeModalHolder.innerHTML = templates["modal-iframe"];
  iframeModal = iframeModalHolder.querySelector('.tvp-iframe-modal');
  iframeModalDocument = iframeModal.contentWindow.document;
  iframeModalDocument.open().write(getIframeHtml({
    id: id,
    domain: baseUrl,
    style: config.css["modal-content" + (isMobile ? "-mobile" : "")],
    className: isMobile ? "mobile" : "",
    html: templates["modal-content" + (isMobile ? "-mobile" : "")].body,
    js: [
      "//a.tvpage.com/tvpa.min.js",
      '//imasdk.googleapis.com/js/sdkloader/ima3.js',
      playerUrl,
      debug && isMobile ? jsPath + "/vendor/jquery.js" : "",
      debug && !isMobile ? jsPath + "/vendor/perfect-scrollbar.min.js" : "",
      debug ? baseUrl + "libs/utils.js" : "",
      debug ? baseUrl + "libs/analytics.js" : "",
      debug ? baseUrl + "libs/player.js" : "",
      debug ? jsPath + "/" + mobilePath + "modal/index.js" : "",
      debug ? "" : jsPath + mobilePath + "modal/scripts.min.js"
    ],
    css: [
      debug ? cssPath + "/" + mobilePath + "modal/styles.css" : "",
      debug && isMobile ? cssPath + "/vendor/slick.css" : "",
      debug && !isMobile ? cssPath + "/vendor/perfect-scrollbar.min.css" : "",
      debug ? "" : cssPath + "/" + mobilePath + "modal/styles.min.css"
    ]
  }));

  iframeModalDocument.close();
};

function handleModalInitialized(e) {
  if (iframeModal.contentWindow) {
    iframeModal.contentWindow.postMessage({
      event: eventPrefix + ':modal_data',
      data: clickData.data,
      selectedVideo: clickData.selectedVideo,
      runTime: clickData.runTime
    }, '*');
  }

  var onOrientationChange = function() {
    if (iOS && iframeModal && iframeModal.contentWindow) {
      var tries = 0;
      setInterval(function() {
        if (tries === 3) return;
        tries = tries + 1;
        var width = iframeModal.parentNode.offsetWidth;
        iframeModal.contentWindow.window.postMessage({
          event: eventPrefix + ':modal_holder_resize',
          size: [width, Math.floor(width * (9 / 16))]
        }, '*');
      }, 500);
    }
  };
  var orientationChangeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize';
  window.removeEventListener(orientationChangeEvent, onOrientationChange, false);
  window.addEventListener(orientationChangeEvent, onOrientationChange, false);
};

function handlePlayerNext(e) {
  getById('tvp-modal-title-' + id).innerHTML = e.data.next.assetTitle || "";
  removeBanner();
};

function handleModalNoProducts(e) {
  if (!config.merchandise)
    return;

  removeClass(iframeModalHolder, 'products');
  addClass(iframeModalHolder, 'no-products');

  if(isMobile || !config.products_headline_display)
    return;
  
  var headlineEl = modal.querySelector('.tvp-products-headline');
  if (headlineEl) {
    headlineEl.parentNode.removeChild(headlineEl);
  }

  var banner = config.no_products_banner;
  if (banner) {
    var bannerEl = document.createElement('div');
    bannerEl.className = 'tvp-no-products-banner';
    bannerEl.innerHTML = isFunction(banner) ? banner() : banner.trim();
    modal.querySelector('.tvp-modal-content').appendChild(bannerEl);
  }
};

function handleModalResize(e) {
  iframeModal.style.height = e.data.height;
};

function handleModalProducts(e) {
  removeClass(iframeModalHolder, 'no-products');
  addClass(iframeModalHolder, 'products');

  if (isMobile || modal.querySelector('.tvp-products-headline') || !config.products_headline_display)
    return;

  var headlineEl = document.createElement('div');
  headlineEl.className = 'tvp-products-headline';
  headlineEl.innerHTML = config.products_headline_text;
  headlineEl.addEventListener('click',function() {
    if (this.classList.contains('active')) {
      removeClass(this,'active')
    } else {
      addClass(this,'active')
    }
  });

  if (config.products_info_tooltip && !!config.products_message) {
    var tooltipEl = document.createElement('div');
    tooltipEl.className = 'tvp-tooltip';
    tooltipEl.innerHTML = templates['modal'].tooltip;
    tooltipEl.querySelector('.tvp-products-message').innerHTML = config.products_message;
    headlineEl.appendChild(tooltipEl);
  }

  modal.querySelector('.tvp-modal-header').appendChild(headlineEl);
};
