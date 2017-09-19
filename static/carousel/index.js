//Helpers
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
var configCss = config.css;
var getInitialHtml = function(){
  var html = "";
  
  var hostId = "tvp-"+type+"-host";
  if (!getById(hostId))
    html += '<style id="'+hostId+'">' + configCss["host"+mobilePrefix] + '</style>';

  html += '<style>' + configCss["host-custom"+mobilePrefix] + '</style>';
  html += '<div id="' + id + '-holder" class="tvp-'+type+'-holder">';
  html += '<iframe src="about:blank" allowfullscreen frameborder="0" scrolling="no"></iframe></div>';

  return html;
};

var targetElement = getById(config.targetEl);
targetElement.insertAdjacentHTML('beforebegin',getInitialHtml());
targetElement.parentNode.removeChild(targetElement);

var baseUrl = config.baseUrl;
var staticPath = baseUrl + type;
var debug = config.debug;
var mobilePath = isMobile ? 'mobile/' : '';
var distPath = debug ? '/' : '/dist/';
var cssPath = staticPath + distPath + 'css/';
var jsPath = staticPath + distPath + 'js/';
var eventPrefix = ("tvp_" + id).replace(/-/g, '_');
var templates = config.templates;

var holder = getById(id + "-holder");
var iframe = holder.querySelector("iframe");
var iframeDocument = iframe.contentWindow.document;
var iframeContent = getIframeHtml({
  id: id,
  className: "dynamic",
  domain: baseUrl,
  style: configCss.carousel,
  js: [
    debug ? jsPath + "vendor/jquery.js" : "",
    debug ? jsPath + "libs/utils.js" : "",
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

if (isFirefox) {//https://bugzilla.mozilla.org/show_bug.cgi?id=728151
  iframe.contentWindow.contents = iframeContent;
  iframe.src = 'javascript:window["contents"]';
} else {
  var iframeDocument = iframe.contentWindow.document;
  iframeDocument.open().write(iframeContent);
  iframeDocument.close();
}

//Modal
var modalContainer = document.createElement("div");
modalContainer.innerHTML = templates['modal'].modal;
document.body.appendChild(modalContainer);

var modal = getById("tvp-modal-" + id);

addClass(modal,isMobile ? "mobile" : "desktop");

if (config.modal_title_position.trim().length && "bottom" === config.modal_title_position) {
  var modalTitle = modal.querySelector("#tvp-modal-title-" + id);
  modalTitle.classList.add("bottom");
  modal.querySelector(".tvp-modal-body").appendChild(modalTitle);
}

var clickData = {};
var iframeModalHolder = getById('tvp-modal-iframe-holder-' + id);
var iframeModal = null;
var iframeModalDocument = null;

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

var changeStylesRunTime = function() {
  isset(config, 'background') ? holder.style.cssText += 'background-color:' + config.background + ';' : null;
  isset(config, 'title_color') ? iframeDocument.getElementsByClassName('tvp-carousel-title')[0].style.cssText += 'color:' + config.title_color + ';' : null;
  var videosTitle = iframeDocument.querySelectorAll('.tvp-video-title');
  for (var i = videosTitle.length - 1; i >= 0; i--) {
    isset(config, 'item_title_font_color') ? videosTitle[i].style.cssText += 'color:' + config.item_title_font_color + ';' : null;
  }
};

function handlePostMessages(e) {
  var eventType = getEventType(e);
  switch (eventType) {
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
    default:
      // do nothing
  }

  handleCallback(e);
};

function handleCallback(e) {
  if (__windowCallbackFunc__)
    __windowCallbackFunc__(e);
}

window.addEventListener("message", function(e) {
  handlePostMessages(e);
});

function handleRender(e) {
  holder.classList.add("initialized");
  changeStylesRunTime();
}

function handleResize(e) {
  if (window.modalOpened) {
    return;
  }
  if (!e.data.height) return;
  holder.style.height = e.data.height;
}

function handleVideoClick(e) {
  var eventData = e.data;
  
  window.modalOpened = true;

  var configCopy = JSON.parse(JSON.stringify(config));
  delete configCopy.no_products_banner;

  clickData = {
    data: eventData.videos,
    selectedVideo: eventData.selectedVideo,
    runTime: configCopy
  };

  getById('tvp-modal-title-' + id).innerHTML = eventData.selectedVideo.title || "";
  removeClass('tvp-modal-' + id, 'tvp-hidden');
  removeClass('tvp-modal-overlay-' + id, 'tvp-hidden');

  if (config.fix_page_scroll) {
    addClass(document.body, 'tvp-modal-open');
  }

  iframeModalHolder.innerHTML = '<iframe class="tvp-iframe-modal" src="about:blank" allowfullscreen frameborder="0" scrolling="no"></iframe>';
  iframeModal = iframeModalHolder.querySelector('.tvp-iframe-modal');
  iframeModalDocument = iframeModal.contentWindow.document;

  //Some logic to include the player library.. we support diff things.
  var playerUrl = "https://cdnjs.tvpage.com/tvplayer/tvp-" + config.player_version + ".min.js";
  if (config.player_url && (config.player_url + "").trim().length) {
    playerUrl = config.player_url;
  }

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
      debug ? jsPath + "/libs/utils.js" : "",
      debug ? jsPath + "/libs/analytics.js" : "",
      debug ? jsPath + "/libs/player.js" : "",
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
  removeBannerEl();
};

function handleModalNoProducts(e) {
  if (!isMobile) {
    var label = getById('tvp-products-headline-' + id);
    if (label) {
      label.parentNode.removeChild(label);
    }
  }

  if (config.no_products_banner && config.merchandise) {
    var bannerHtml = "";
    if ("function" === typeof config.no_products_banner) {
      bannerHtml = config.no_products_banner();
    } else if (String(config.no_products_banner).trim().length) {
      bannerHtml = config.no_products_banner.trim();
    }

    var bannerDiv = document.createElement('div');
    addClass(bannerDiv, 'tvp-no-products-banner');
    bannerDiv.innerHTML = bannerHtml;
    modal.querySelector('.tvp-modal-content').appendChild(bannerDiv);
  }

  removeClass(iframeModalHolder, 'products');
  addClass(iframeModalHolder, 'no-products');
};

function handleModalResize(e) {
  iframeModal.style.height = e.data.height;
};

function handleModalProducts(e) {
  if (!isMobile && !getById('tvp-products-headline-' + id) && config.products_headline_display) {
    var label = document.createElement('div');
    label.className = 'tvp-products-headline';
    label.id = 'tvp-products-headline-' + id;
    label.innerHTML = config.products_headline_text;

    if (config.products_info_tooltip && config.products_message.trim().length) {
      var tooltipHtml = templates['modal'].tooltip;
      var tooltipDiv = document.createElement('div');
      tooltipDiv.classList.add('tvp-tooltip');
      tooltipDiv.innerHTML = tooltipHtml;
      tooltipDiv.getElementsByClassName('tvp-products-message')[0].innerHTML = config.products_message;
      label.appendChild(tooltipDiv);
    }

    label.onclick = function() {
      this.classList.contains('active') ? this.classList.remove('active') : this.classList.add('active');
    };

    var modalHeader = getById('tvp-modal-header-' + id);
    modalHeader.appendChild(label);
  }

  removeClass(iframeModalHolder, 'no-products');
  addClass(iframeModalHolder, 'products');
};

var removeBannerEl = function() {
  var noProductsBanner = modal.querySelector('.tvp-no-products-banner');
  if (noProductsBanner) {
    modal.querySelector('.tvp-modal-content').removeChild(noProductsBanner);
  }
};

var closeModal = function() {
  window.modalOpened = false;
  window.postMessage({
    event: eventPrefix + ':modal_close'
  }, '*');

  addClass('tvp-modal-' + id, 'tvp-hidden');
  addClass('tvp-modal-overlay-' + id, 'tvp-hidden');

  if (config.fix_page_scroll) {
    removeClass(document.body, 'tvp-modal-open');
  }

  var prodHeadline = getById('tvp-products-headline-' + id);
  if (prodHeadline) {
    removeClass(prodHeadline, 'active');
  }

  removeBannerEl();
  removeClass(iframeModalHolder, 'products');
  removeClass(iframeModalHolder, 'no-products');
  iframeModal.parentNode.removeChild(iframeModal);
};

getById("tvp-modal-close-" + id).addEventListener('click', closeModal, false);

var modalEl = getById("tvp-modal-" + id);
modalEl.addEventListener('click', function(e) {
  if (e.target === modalEl || !modalEl.contains(e.target)) {
    closeModal();
  }
}, false);