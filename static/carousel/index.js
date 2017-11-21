var body = document.body;
var userAgent = navigator.userAgent;
var isFirefox = /Firefox/i.test(userAgent);
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

//we add the preconnect hints as soon as we can
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

//Here's the first HTML write we do to the host page, this is the fastest way to do it
//refer to https://jsperf.com/insertadjacenthtml-perf/3
function widgetRender(){
  var targetElement = getById(config.targetEl);
  targetElement.insertAdjacentHTML('beforebegin',getInitialHtml());
  remove(targetElement);

  holder = getById(id + "-holder");

  var iframe = holder.querySelector("iframe");
  var iframeDocument = iframe.contentWindow.document;
  var libsPath = baseUrl + '/libs';

  iframeDocument.open().write(getIframeHtml({
    id: id,
    domain: baseUrl,
    style: isMobile ? css.mobile.base : css.base,
    context: config,
    html: templates.base,
    eventPrefix: eventPrefix,
    js: [
      '//a.tvpage.com/tvpa.min.js',
      debug ? javascriptPath + '/vendor/jquery.js' : '',
      debug ? libsPath + '/utils.js' : '',
      debug ? libsPath + '/analytics.js' : '',
      debug ? libsPath + '/carousel.js' : '',
      debug ? javascriptPath + '/index.js' : '',
      debug ? "" : javascriptPath + '/scripts.min.js'
    ],
    css: [
      debug ? baseUrl + '/slick/slick.css' : '',
      debug ? baseUrl + '/bootstrap/dist/css/bootstrap.css' : '',
      debug ? cssPath + '/styles.css' : '',
      debug ? '' : cssPath + '/styles.min.css'
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

//api calls/loading, is here were we call the most important api(s) and it's the start 
//of everything.
function widgetLoad(){

  //API calls/loading, is here were we call the most important api(s)
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

//handle the widget events
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

  if('widget_videos_carousel_click' === eventType){
    onWidgetVideosCarouselClick(e);
  }

  //check if you need this
  if('render' === eventType){
    onRender(e); 
  }

  //normalize this to form part of the std
  if('widget_modal_initialized' === eventType){
    onWidgetModalInitialized(e);
  }

  if('widget_modal_no_products' === eventType){
    onWidgetModalNoProducts(e);
  }

  if('widget_modal_products' === eventType){
    onWidgetModalProducts(e); 
  }

  if('widget_modal_resize' === eventType){
    onWidgetModalResize(e);
  }

  //? how to order this?
  if('widget_player_change' === eventType){
    onWidgetPlayerChange(e);
  }

  //listen to the onstatechange instead and check for video ended (this shall pass the video)
  if('player_next' === eventType){
    handlePlayerNext(e);
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

function onWidgetPlayerChange(e){
  config.onPlayerChange(e.data.e, e.data.stateData);
}

function onRender(e) {
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

var modalInitialized = false;
var iframeModalHolder;
var iframeModal;
var iframeModalDocument;
var modal;

function onWidgetVideosCarouselClick(e) {

  if(!modalInitialized){
    modalInitialized = true;

    //external render
    var modalContainer = createEl('div');
    modalContainer.innerHTML = templates.modal.base;
    body.appendChild(modalContainer);

    iframeModalHolder = getById('tvp-modal-iframe-holder-' + id);
    iframeModal = null;
    iframeModalDocument = null;
    modal = getById("tvp-modal-" + id);

    addClass(modal, isMobile ? "mobile" : "desktop");

    if (config.modal_title_position.trim().length && "bottom" === config.modal_title_position) {
      var modalTitleEl = modal.querySelector("#tvp-modal-title-" + id);
      addClass(modalTitleEl,"bottom")
      modal.querySelector(".tvp-modal-body").appendChild(modalTitleEl);
    }

    function closeModal() {
      addClass(modal, 'tvp-hidden');
      addClass('tvp-modal-overlay-' + id, 'tvp-hidden');

      removeClass(iframeModalHolder, 'products');
      removeClass(iframeModalHolder, 'no-products');
      removeClass(modal.querySelector('.tvp-products-headline'), 'active');

      remove(iframeModal);

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
  }

  //modal initialization
  var videos = config.channel.videos;
  var selected = null;
  var clicked = e.data.clicked;

  for (var i = 0; i < videos.length; i++)
    if (videos[i].id === clicked)
      selected = videos[i];

  if(!selected)
    return;

  config.clicked = clicked;

  modal.querySelector('.tvp-modal-title').innerHTML = selected.title || "";

  removeClass(modal, 'tvp-hidden');
  removeClass('tvp-modal-overlay-' + id, 'tvp-hidden');
  
  //render the iframe contents
  iframeModalHolder.innerHTML = templates.modal.iframe;
  iframeModal = iframeModalHolder.querySelector('.tvp-iframe-modal');
  iframeModalDocument = iframeModal.contentWindow.document;
  iframeModalDocument.open().write(getIframeHtml({
    id: id,
    domain: baseUrl,
    context: config,
    eventPrefix: eventPrefix,
    style: isMobile ? css.mobile.modal.content : css.modal.content,
    className: isMobile ? "mobile" : "",
    html: (isMobile ? templates.modal.body : templates.modal.body),
    js: [
      "//a.tvpage.com/tvpa.min.js",
      '//imasdk.googleapis.com/js/sdkloader/ima3.js',
      getPlayerUrl(),
      debug ? baseUrl + "/libs/utils.js" : "",
      debug ? baseUrl + "/libs/analytics.js" : "",
      debug ? baseUrl + "/libs/player.js" : "",
      debug && isMobile ? javascriptPath + "/vendor/jquery.js" : "",
      debug ? javascriptPath + "/" + mobilePath + "/modal/index.js" : "",
      debug && !isMobile ? javascriptPath + "/vendor/perfect-scrollbar.min.js" : "",
      debug ? "" : javascriptPath + mobilePath + "/modal/scripts.min.js"
    ],
    css: [
      debug ? cssPath + "/" + mobilePath + "/modal/styles.css" : "",
      debug && isMobile ? cssPath + "/vendor/slick.css" : "",
      debug && !isMobile ? cssPath + "/vendor/perfect-scrollbar.min.css" : "",
      debug ? "" : cssPath + "/" + mobilePath + "/modal/styles.min.css"
    ]
  }));
  iframeModalDocument.close();
  
  if (config.fix_page_scroll)
    addClass(body, 'tvp-modal-open');
}

function onWidgetModalInitialized(e) {
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
}

function handlePlayerNext(e) {
  getById('tvp-modal-title-' + id).innerHTML = e.data.next.assetTitle || "";
}

function onWidgetModalNoProducts(e) {
  if (!config.merchandise)
    return;

  removeClass(iframeModalHolder, 'products');
  addClass(iframeModalHolder, 'no-products');

  if(isMobile || !config.products_headline_display)
    return;
  
  var headlineEl = modal.querySelector('.tvp-products-headline');
  if (headlineEl) {
    remove(headlineEl);
  }
}

function onWidgetModalProducts(e){
  removeClass(iframeModalHolder, 'no-products');
  addClass(iframeModalHolder, 'products');

  if (isMobile || modal.querySelector('.tvp-products-headline') || !config.products_headline_display)
    return;

  var headlineEl = createEl('div');
  headlineEl.className = 'tvp-products-headline';
  headlineEl.innerHTML = config.products_headline_text;
  headlineEl.addEventListener('click',function(){
    if (this.classList.contains('active')) {
      removeClass(this,'active')
    } else {
      addClass(this,'active')
    }
  });

  modal.querySelector('.tvp-modal-header').appendChild(headlineEl);
}

function onWidgetModalResize(e){
  iframeModal.style.height = e.data.height;
}