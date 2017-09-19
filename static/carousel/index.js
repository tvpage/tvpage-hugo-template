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

  var js = options.js || [];
  if ('function' === typeof js) {
    js = js();
  }

  js = js.filter(Boolean);
  for (var i = 0; i < js.length; i++) {
    html += 'addJS(\'' + js[i] + '\');';
  }

  var css = options.css || [];
  if ('function' === typeof css) {
    css = css();
  }

  css = css.filter(Boolean);
  for (var i = 0; i < css.length; i++) {
    html += 'addCSS(\'' + css[i] + '\');';
  }

  html += '"><style>' + (options.style || '') + '</style>';

  var content = options.html || '';
  if ('function' === typeof content) {
    html += content();
  } else if (content.trim().length) {
    html += content;
  }

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
var tvpage = __TVPage__ = window.__TVPage__ || {};

if(hasKey(tvpage.config,id) && isObject(tvpage.config[id]))
  config = extend(config, tvpage.config[id]);

var __windowCallbackFunc__ = null;
if (hasKey(config,"onChange") && isFunction(config.onChange)){
  __windowCallbackFunc__ = config.onChange;
  delete config.onChange;
}

//We pass the updated merged config object to the tvpage global so the iframe files can retrieve
//it from the parent global.
__TVPage__.config[id] = config;

//Initial render
if (!hasKey(config,"targetEl") || !getById(config.targetEl))
  throw new Error("Must provide a targetEl");

var hostCssTagId = "tvp-carousel-host-css";
var hostCssTag = "";
if (!getById(hostCssTagId)) {
  hostCssTag = '<style id="' + hostCssTagId + '">' + config.css["host" + (isMobile ? "-mobile" : "")] + '</style>';
}

var targetElement = getById(config.targetEl);
targetElement.insertAdjacentHTML('beforebegin', hostCssTag + '<style>' + config.css["host-custom" + (isMobile ? "-mobile" : "")] + '</style><div id="' + id + '-holder" class="tvp-carousel-holder">' +
  '<iframe src="about:blank" allowfullscreen frameborder="0" scrolling="no"></iframe></div>');
targetElement.parentNode.removeChild(targetElement);

config.id = id;
config.staticPath = config.baseUrl + "carousel";
config.mobilePath = isMobile ? 'mobile/' : '';
config.distPath = config.debug ? '/' : '/dist/';
config.cssPath = config.staticPath + config.distPath + 'css/';
config.jsPath = config.staticPath + config.distPath + 'js/';
config.eventPrefix = ("tvp_" + config.id).replace(/-/g, '_');

var modalContainer = document.createElement("div");
modalContainer.innerHTML = config.templates['modal'].modal;

document.body.appendChild(modalContainer);

var modal = getById("tvp-modal-" + config.id);

modal.classList.add(isMobile ? "mobile" : "desktop");

if (config.modal_title_position.trim().length && "bottom" === config.modal_title_position) {
  var modalTitle = modal.querySelector("#tvp-modal-title-" + config.id);
  modalTitle.classList.add("bottom");
  modal.querySelector(".tvp-modal-body").appendChild(modalTitle);
}

var holder = getById(config.id + "-holder");
var iframe = holder.querySelector("iframe");
var iframeDocument = iframe.contentWindow.document;
var iframeContent = getIframeHtml({
  id: config.id,
  className: "dynamic",
  domain: config.baseUrl,
  style: config.css.carousel,
  js: [
    config.debug ? config.jsPath + "vendor/jquery.js" : "",
    config.debug ? config.jsPath + "libs/utils.js" : "",
    config.debug ? config.jsPath + "carousel.js" : "",
    config.debug ? config.jsPath + "index.js" : "",
    config.debug ? "" : config.jsPath + "scripts.min.js"
  ],
  css: [
    config.debug ? config.cssPath + "styles.css" : "",
    config.debug ? config.cssPath + "vendor/slick.css" : "",
    config.debug ? "" : config.cssPath + "styles.min.css"
  ]
});

//Firefox does not add the iframe content using the onload method.
//https://bugzilla.mozilla.org/show_bug.cgi?id=728151
if (isFirefox) {
  iframe.contentWindow.contents = iframeContent;
  iframe.src = 'javascript:window["contents"]';
} else {
  var iframeDocument = iframe.contentWindow.document;
  iframeDocument.open().write(iframeContent);
  iframeDocument.close();
}

var updateModalTitle = function(title) {
  getById('tvp-modal-title-' + config.id).innerHTML = title || "";
};

var clickData = {};
var iframeModalHolder = getById('tvp-modal-iframe-holder-' + config.id);
var iframeModal = null;
var iframeModalDocument = null;

var getEventType = function(e) {
  var evt = null
  if (e && isset(e, "data") && isset(e.data, "event")) {
    evt = e.data.event;
  }

  if (evt && evt.length && evt.substr(0, config.eventPrefix.length) === config.eventPrefix) {
    return evt.substr(config.eventPrefix.length + 1);
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
  //performant way to clone object http://jsben.ch/#/bWfk9
  var configCopy = JSON.parse(JSON.stringify(config));
  delete configCopy.no_products_banner;

  clickData = {
    data: eventData.videos,
    selectedVideo: eventData.selectedVideo,
    runTime: configCopy
  };

  updateModalTitle(eventData.selectedVideo.title);
  removeClass('tvp-modal-' + config.id, 'tvp-hidden');
  removeClass('tvp-modal-overlay-' + config.id, 'tvp-hidden');

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
    id: config.id,
    domain: config.baseUrl,
    style: config.css["modal-content" + (isMobile ? "-mobile" : "")],
    className: isMobile ? "mobile" : "",
    html: config.templates["modal-content" + (isMobile ? "-mobile" : "")].body,
    js: [
      "//a.tvpage.com/tvpa.min.js",
      '//imasdk.googleapis.com/js/sdkloader/ima3.js',
      playerUrl,
      config.debug && isMobile ? config.jsPath + "/vendor/jquery.js" : "",
      config.debug && !isMobile ? config.jsPath + "/vendor/perfect-scrollbar.min.js" : "",
      config.debug ? config.jsPath + "/libs/utils.js" : "",
      config.debug ? config.jsPath + "/libs/analytics.js" : "",
      config.debug ? config.jsPath + "/libs/player.js" : "",
      config.debug ? config.jsPath + "/" + config.mobilePath + "modal/index.js" : "",
      config.debug ? "" : config.jsPath + config.mobilePath + "modal/scripts.min.js"
    ],
    css: [
      config.debug ? config.cssPath + "/" + config.mobilePath + "modal/styles.css" : "",
      config.debug && isMobile ? config.cssPath + "/vendor/slick.css" : "",
      config.debug && !isMobile ? config.cssPath + "/vendor/perfect-scrollbar.min.css" : "",
      config.debug ? "" : config.cssPath + "/" + config.mobilePath + "modal/styles.min.css"
    ]
  }));

  iframeModalDocument.close();
};

function handleModalInitialized(e) {
  if (iframeModal.contentWindow) {
    iframeModal.contentWindow.postMessage({
      event: config.eventPrefix + ':modal_data',
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
          event: config.eventPrefix + ':modal_holder_resize',
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
  updateModalTitle(e.data.next.assetTitle);
  removeBannerEl();
};

function handleModalNoProducts(e) {
  if (!isMobile) {
    var label = getById('tvp-products-headline-' + config.id);
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
  if (!isMobile && !getById('tvp-products-headline-' + config.id) && config.products_headline_display) {
    var label = document.createElement('div');
    label.className = 'tvp-products-headline';
    label.id = 'tvp-products-headline-' + config.id;
    label.innerHTML = config.products_headline_text;

    if (config.products_info_tooltip && config.products_message.trim().length) {
      var tooltipHtml = config.templates['modal'].tooltip;
      var tooltipDiv = document.createElement('div');
      tooltipDiv.classList.add('tvp-tooltip');
      tooltipDiv.innerHTML = tooltipHtml;
      tooltipDiv.getElementsByClassName('tvp-products-message')[0].innerHTML = config.products_message;
      label.appendChild(tooltipDiv);
    }

    label.onclick = function() {
      this.classList.contains('active') ? this.classList.remove('active') : this.classList.add('active');
    };

    var modalHeader = getById('tvp-modal-header-' + config.id);
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
    event: config.eventPrefix + ':modal_close'
  }, '*');

  addClass('tvp-modal-' + config.id, 'tvp-hidden');
  addClass('tvp-modal-overlay-' + config.id, 'tvp-hidden');

  if (config.fix_page_scroll) {
    removeClass(document.body, 'tvp-modal-open');
  }

  var prodHeadline = getById('tvp-products-headline-' + config.id);
  if (prodHeadline) {
    removeClass(prodHeadline, 'active');
  }

  removeBannerEl();
  removeClass(iframeModalHolder, 'products');
  removeClass(iframeModalHolder, 'no-products');
  iframeModal.parentNode.removeChild(iframeModal);
};

getById("tvp-modal-close-" + config.id).addEventListener('click', closeModal, false);

var modalEl = getById("tvp-modal-" + config.id);
modalEl.addEventListener('click', function(e) {
  if (e.target === modalEl || !modalEl.contains(e.target)) {
    closeModal();
  }
}, false);