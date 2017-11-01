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

  html += "  parent.removeEventListener('message', onStart, false);";
  html += "};";

  html += "parent.addEventListener('message', onStart);";

  html += '"><style>' + (o.style || '') + '</style>';
  html += tmpl((o.html || '').trim(),o.context);

  return html;
};


//We pass the updated merged config object to the tvpage global so the iframe files can retrieve
//it from the parent global.
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
config.eventPrefix = ("tvp_" + id).replace(/-/g, '_');

var __windowCallbackFunc__ = null;
if (hasKey(config,"onChange") && isFunction(config.onChange)){
  __windowCallbackFunc__ = config.onChange;
  delete config.onChange;
}

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

var getInitialHtml = function(){
  var html = "";
  var hostId = "tvp-" + type + "-host";

  if (!getById(hostId))
    html += '<style id="'+hostId+'">' + (isMobile ? cssMobile.host : css.host) + '</style>';

  html += '<style>' + (isMobile ? cssMobile['host-custom'] : css['host-custom']) + '</style>';
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
  domain: baseUrl,
  style: css.carousel,
  html: isMobile ? mobileTemplates.skeleton : templates.skeleton,
  context: config,
  eventPrefix: eventPrefix,
  js: [
    "//a.tvpage.com/tvpa.min.js",
    debug ? jsPath + "vendor/jquery.js" : "",
    debug ? baseUrl + "/libs/utils.js" : "",
    debug ? baseUrl + "/libs/analytics.js" : "",
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

iframeDocument.open().write(iframeHtml);
iframeDocument.close();
console.log('renders initial dom', performance.now() - startTime);


//API calls/loading, is here were we call the most important api(s)
if(!hasKey(config,'channel'))
  throw new Error('Widget config missing channel obj');

window.tvpcallback = function(data){
  
  //Preload data images.. this can be done smarter depending on the template, for example
  //carousel on mobile will need to preload first image only whilst desktop needs
  //same qty as the items_per_page setting.
  config.toPreload = isMobile ? 1 : config.items_per_page;

  for (var i = 0; i < data.length; i++) {
    if(hasKey(data[i],'asset'))
      (new Image()).src = data[i].asset.thumbnailUrl;
    
    if(i + 1 === config.toPreload)
      break;
  }

  //We then add the data to the tvp global and then we fire the event that will start
  //things in the widget side.
  config.channel.videos = data;

  //This is the first event that start things out
  window.postMessage({
    event: eventPrefix + ':start'
  }, '*');
};

var channel = config.channel;
var channelId = channel.id || config.channelid;
var src = config.api_base_url + '/channels/' + channelId + '/videos';
var callParams = {
  p: 0,
  n: config.items_per_page,
  o: config.videos_order_by,
  od:config.videos_order_direction,
  'X-login-id': config.loginId || config.loginid,
  callback: 'tvpcallback'
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


//Modal
var modalContainer = document.createElement("div");
modalContainer.innerHTML = templates.modal.modal;
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
  
  if(config.background){
    holder.style.cssText += 'background-color:' + config.background + ';';
  }

  if(config.item_title_font_color){
    var titles = iframeDocument.querySelectorAll('.tvp-video-title');
    for (var i = 0; i < titles.length; i++) {
      titles[i].style.cssText += 'color:' + config.item_title_font_color + ';';
    }
  }
}

function handleResize(e) {
  // if (!modal.classList.contains("tvp-hidden") || !e.data.height)
  //   return;

  // holder.style.height = e.data.height;
}

var getPlayerUrl = function(){
  var url = "https://cdnjs.tvpage.com/tvplayer/tvp-" + config.player_version + ".min.js";
  if (config.player_url && (config.player_url + "").trim().length) {
    url = config.player_url;
  }
  return url;
};

var setClickData = function(e){
  if (!e || !e.data)
    return;

  var configCopy = JSON.parse(JSON.stringify(config));
  delete configCopy.no_products_banner;
  configCopy.onPlayerChange = !!config.onPlayerChange;

  var data = e.data;

  clickData = {
    data: data.videos,
    video: data.video,
    runTime: configCopy
  };
};

var iframeModalJs = [
  "//a.tvpage.com/tvpa.min.js",
  '//imasdk.googleapis.com/js/sdkloader/ima3.js',
  getPlayerUrl(),
  debug && isMobile ? jsPath + "/vendor/jquery.js" : "",
  debug && !isMobile ? jsPath + "/vendor/perfect-scrollbar.min.js" : "",
  debug ? baseUrl + "libs/utils.js" : "",
  debug ? baseUrl + "libs/analytics.js" : "",
  debug ? baseUrl + "libs/player.js" : "",
  debug ? jsPath + "/" + mobilePath + "modal/index.js" : "",
  debug ? "" : jsPath + mobilePath + "modal/scripts.min.js"
];

var iframeModalCss = [
  debug ? cssPath + "/" + mobilePath + "modal/styles.css" : "",
  debug && isMobile ? cssPath + "/vendor/slick.css" : "",
  debug && !isMobile ? cssPath + "/vendor/perfect-scrollbar.min.css" : "",
  debug ? "" : cssPath + "/" + mobilePath + "modal/styles.min.css"
];

var iframeModalHtml = getIframeHtml({
  id: id,
  domain: baseUrl,
  context: config,
  eventPrefix: eventPrefix,
  style: config.css["modal-content" + mobilePrefix],
  className: isMobile ? "mobile" : "",
  html: templates["modal-content" + mobilePrefix].body,
  js: iframeModalJs,
  css: iframeModalCss
});

var renderIframeModal = function(){
  iframeModalHolder.innerHTML = templates["modal-iframe"];
  iframeModal = iframeModalHolder.querySelector('.tvp-iframe-modal');
  iframeModalDocument = iframeModal.contentWindow.document;
  iframeModalDocument.open().write(iframeModalHtml);
  iframeModalDocument.close();
};

function handleVideoClick(e) {
  setClickData(e);

  modal.querySelector('.tvp-modal-title').innerHTML = clickData.video.title || "";

  removeClass(modal, 'tvp-hidden');
  removeClass('tvp-modal-overlay-' + id, 'tvp-hidden');

  if (config.fix_page_scroll) {
    addClass(body, 'tvp-modal-open');
  }

  renderIframeModal();

  window.postMessage({
    event: eventPrefix + ':start'
  }, '*');
};

function handleModalInitialized(e) {
  if (iframeModal.contentWindow) {
    iframeModal.contentWindow.postMessage({
      event: eventPrefix + ':modal_data',
      data: clickData.data,
      video: clickData.video,
      runTime: clickData.runTime
    }, '*');
  }

  var onOrientationChange = function() {
    if (iOS && iframeModal && iframeModal.contentWindow) {
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
