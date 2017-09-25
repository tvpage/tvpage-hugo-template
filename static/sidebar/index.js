var utils = {
    isFirefox: /Firefox/i.test(navigator.userAgent),
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod|iPhone Simulator|iPad Simulator/.test(navigator.userAgent) && !window.MSStream,
    isset: function(o,p){
        var val = o;
        if (p) val = o[p];
        return "undefined" !== typeof val;
    },
    getIframeHtml: function(options) {
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
    },
    addClass: function(obj,c){
        if (!obj || !c) return;
        if ('string' === typeof obj) {
            document.getElementById(obj).classList.add(c);
        } else {
            obj.classList.add(c);
        }
    },
    removeClass: function(obj,c){
        if (!obj || !c) return;
        if ('string' === typeof obj) {
            document.getElementById(obj).classList.remove(c);
        } else {
            obj.classList.remove(c);
        }
    },
    extend: function(out) {
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
    }
};

if (typeof bootstrap !== "object" || !bootstrap.hasOwnProperty('name') || bootstrap.name.length<=0 ) {
  throw new Error('Must pass bootstrap and boostrap.name');
}

var id = bootstrap.name;

//If there's config object for this specific widget, then we merged in... extend?
window.__TVPage__ = window.__TVPage__ || {};
__TVPage__.config = __TVPage__.config || {};

if ("object" === typeof __TVPage__.config[id]) {
    __TVPage__.config[id] = utils.extend(bootstrap, __TVPage__.config[id]);
} else {
    __TVPage__.config[id] = bootstrap;
}

var __windowCallbackFunc__ = null;
if (   __TVPage__.config[id].hasOwnProperty('onChange') && typeof   __TVPage__.config[id].onChange == "function" ) {
  __windowCallbackFunc__ = __TVPage__.config[id].onChange;
  delete __TVPage__.config[id].onChange;
}

var config = utils.isset(window.__TVPage__) && utils.isset(__TVPage__,"config") && utils.isset(__TVPage__.config,id) ? __TVPage__.config[id] : {};
var baseUrl = config.baseUrl;
var hostCssTagId = "tvp-sidebar-host-css";
var hostCssTag = "";
if (!document.getElementById(hostCssTagId)) {
  hostCssTag = '<style id="' + hostCssTagId + '">' + config.css["host" + (utils.isMobile ? "-mobile" : "")] + '</style>';
}

var targetElement;
if ( !config.hasOwnProperty('targetEl') ||  !document.getElementById(config.targetEl) ) {
  throw new Error ( "Must provide a targetEl");
} 

var targetElement = document.getElementById(config.targetEl);
targetElement.insertAdjacentHTML('beforebegin', hostCssTag + '<style>' + config.css["host-custom" + (utils.isMobile ? "-mobile" : "")] + '</style><div id="' + id + '-holder" class="tvp-sidebar-holder">'+
'<iframe src="about:blank" allowfullscreen frameborder="0" scrolling="no" gesture="media"></iframe></div>');
targetElement.parentNode.removeChild(targetElement);

config.id = id;
config.staticPath = config.baseUrl + "/sidebar";
config.mobilePath = utils.isMobile ? 'mobile/' : '';
config.distPath = config.debug ? '/' : '/dist/';
config.cssPath = config.staticPath + config.distPath + 'css/';
config.jsPath = config.staticPath + config.distPath + 'js/';
config.eventPrefix = ("tvp_" + config.id).replace(/-/g,'_');

var modalContainer = document.createElement("div");
modalContainer.innerHTML = config.templates['modal'].modal;
document.body.appendChild(modalContainer);

var modal = document.getElementById("tvp-modal-" + config.id);

modal.classList.add(utils.isMobile ? "mobile" : "desktop");

if (config.modal_title_position.trim().length && "bottom" === config.modal_title_position) {
  var modalTitle = modal.querySelector("#tvp-modal-title-" + config.id);
  modalTitle.classList.add("bottom");
  modal.querySelector(".tvp-modal-body").appendChild(modalTitle);
}

var holder = document.getElementById(config.id + "-holder");
var iframe = holder.querySelector("iframe");
var iframeDocument = iframe.contentWindow.document;
var iframeContent = utils.getIframeHtml({
    id: config.id,
    className: "dynamic",
    domain: config.baseUrl,
    style: config.css.sidebar,
    js: [
        "//a.tvpage.com/tvpa.min.js",
        config.debug ? baseUrl + "libs/analytics.js" : "",
        config.debug ? baseUrl + "libs/utils.js" : "",
        config.debug ? config.jsPath + "grid.js" : "",
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
if (utils.isFirefox) {
    iframe.contentWindow.contents = iframeContent;
    iframe.src = 'javascript:window["contents"]';
} else {
    var iframeDocument = iframe.contentWindow.document;
    iframeDocument.open().write(iframeContent);
    iframeDocument.close();
}

var isEvent = function (e, type) {
    return (e && utils.isset(e, "data") && utils.isset(e.data, "event") && config.eventPrefix + type === e.data.event);
};

var updateModalTitle = function(title){
    document.getElementById('tvp-modal-title-' + config.id).innerHTML = title || "";
};

window.addEventListener("message", function(e){
    if (isEvent(e, ":resize") || isEvent(e, ":render")) {
      holder.style.height = e.data.height;
    }
});

var clickData = {};
var iframeModalHolder = document.getElementById('tvp-modal-iframe-holder-' + config.id);
var iframeModal = null;
var iframeModalDocument = null;

var getEventType = function (e) {
  var evt = null
    if (e && utils.isset(e, "data") && utils.isset(e.data, "event") ) {
      evt= e.data.event;
    }
    
    if (evt && evt.length && evt.substr(0, config.eventPrefix.length) === config.eventPrefix) {
      return evt.substr(config.eventPrefix.length + 1);
    }
    
    return null;
};

function handlePostMessages(e){
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
    case 'onPlayerChange':
      handleOnPlayerChange(e);
      break;
    default: 
      // do nothing
  }

  handleCallback(e);
};

function handleOnPlayerChange(e){
  config.onPlayerChange(e.data.e, e.data.stateData);
}

function handleCallback(e){
  if (__windowCallbackFunc__) 
    __windowCallbackFunc__(e);
}

window.addEventListener("message", function(e){
  handlePostMessages(e);
});

function handleRender(e){
  holder.classList.add("initialized");
}

function handleVideoClick(e){
    var eventData = e.data;

    //performant way to clone object http://jsben.ch/#/bWfk9
    var configCopy = JSON.parse(JSON.stringify(config));
    configCopy.onPlayerChange = !!config.onPlayerChange;
    
    delete configCopy.no_products_banner;

    clickData = {
      data: eventData.videos,
      selectedVideo: eventData.selectedVideo,
      runTime: configCopy
    };

    updateModalTitle(eventData.selectedVideo.title);
    utils.removeClass(modal,'tvp-hidden');
    utils.removeClass('tvp-modal-overlay-' + config.id,'tvp-hidden');
    
    if (config.fix_page_scroll) {
        utils.addClass(document.body, 'tvp-modal-open');
    }

    iframeModalHolder.innerHTML =  '<iframe class="tvp-iframe-modal" src="about:blank" allowfullscreen frameborder="0" scrolling="no" gesture="media"></iframe>';
    iframeModal = iframeModalHolder.querySelector('.tvp-iframe-modal');
    iframeModalDocument = iframeModal.contentWindow.document;
    
    //Some logic to include the player library.. we support diff things.
    var playerUrl = "https://cdnjs.tvpage.com/tvplayer/tvp-" + config.player_version + ".min.js";
    if (config.player_url && (config.player_url + "").trim().length) {
        playerUrl = config.player_url;
    }

    iframeModalDocument.open().write(utils.getIframeHtml({
      id: config.id,
      domain: config.baseUrl,
      style: config.css["modal-content" + (utils.isMobile ? "-mobile" : "")],
      className: utils.isMobile ? "mobile" : "",
      html: config.templates["modal-content" + (utils.isMobile ? "-mobile" : "")].body,
      js: [
          "//a.tvpage.com/tvpa.min.js",
          '//imasdk.googleapis.com/js/sdkloader/ima3.js',
          playerUrl,
          config.debug && utils.isMobile ? config.jsPath + "/vendor/jquery.js" : "",
          config.debug && !utils.isMobile ? config.jsPath + "/vendor/perfect-scrollbar.min.js" : "",
          config.debug ? baseUrl + "libs/utils.js" : "",
          config.debug ? baseUrl + "libs/analytics.js" : "",
          config.debug ? baseUrl + "libs/player.js" : "",
          config.debug ? config.jsPath + "/" + config.mobilePath + "modal/index.js" : "",
          config.debug ? "" : config.jsPath + config.mobilePath + "modal/scripts.min.js"
      ],
      css: [
          config.debug ? config.cssPath + "/" + config.mobilePath + "modal/styles.css" : "",
          config.debug && utils.isMobile ? config.cssPath + "/vendor/slick.css" : "",
          config.debug && !utils.isMobile ? config.cssPath + "/vendor/perfect-scrollbar.min.css" : "",
          config.debug ? "" : config.cssPath + "/" + config.mobilePath + "modal/styles.min.css"
      ]
    }));

    iframeModalDocument.close();
};

function handleModalInitialized(e){
  if (iframeModal.contentWindow) {
      iframeModal.contentWindow.postMessage({
          event: config.eventPrefix + ':modal_data',
          data: clickData.data,
          selectedVideo: clickData.selectedVideo,            
          runTime: clickData.runTime
      }, '*');
  }

  var onOrientationChange = function () {
    if (utils.isIOS && iframeModal && iframeModal.contentWindow) {
      setTimeout(function(){
        var width = iframeModal.parentNode.offsetWidth;
        iframeModal.contentWindow.window.postMessage({
          event: config.eventPrefix + ':modal_holder_resize',
          size: [width, Math.floor(width * (9 / 16))]
        },'*');
      },300);
    }
  };
  var orientationChangeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize';
  window.removeEventListener(orientationChangeEvent,onOrientationChange, false);
  window.addEventListener(orientationChangeEvent,onOrientationChange, false);
};

function handlePlayerNext(e) {
    updateModalTitle(e.data.next.assetTitle);
    removeBannerEl();
};

function handleModalNoProducts(e) {
  if (!utils.isMobile) {
      var label = document.getElementById('tvp-products-headline-' + config.id);
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
    utils.addClass(bannerDiv,'tvp-no-products-banner');
    bannerDiv.innerHTML = bannerHtml;
    modal.querySelector('.tvp-modal-content').appendChild(bannerDiv);
  }

  utils.removeClass(iframeModalHolder,'products');
  utils.addClass(iframeModalHolder,'no-products');
};

function handleModalResize(e){
  iframeModal.style.height = e.data.height;
};

function handleModalProducts(e) {
  if (!utils.isMobile && !document.getElementById('tvp-products-headline-' + config.id) && config.products_headline_display) {
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
    
    label.onclick = function(){
      this.classList.contains('active') ? this.classList.remove('active') : this.classList.add('active');
    };

    var modalHeader = document.getElementById('tvp-modal-header-' + config.id);
    modalHeader.appendChild(label);
  }

  utils.removeClass(iframeModalHolder,'no-products');
  utils.addClass(iframeModalHolder,'products');
};

var removeBannerEl = function() {
  var noProductsBanner = modal.querySelector('.tvp-no-products-banner');
  if (noProductsBanner) {
    modal.querySelector('.tvp-modal-content').removeChild(noProductsBanner);
  } 
};

var closeModal = function () {
  utils.addClass('tvp-modal-' + config.id,'tvp-hidden');
  utils.addClass('tvp-modal-overlay-' + config.id,'tvp-hidden');

  if (config.fix_page_scroll) {
      utils.removeClass(document.body,'tvp-modal-open');
  }

  var prodHeadline = document.getElementById('tvp-products-headline-' + config.id);
  if (prodHeadline) {
    utils.removeClass(prodHeadline,'active');
  }

  removeBannerEl();
  utils.removeClass(iframeModalHolder,'products');
  utils.removeClass(iframeModalHolder,'no-products');
  iframeModal.parentNode.removeChild(iframeModal);
};

document.getElementById("tvp-modal-close-" + config.id).addEventListener('click', closeModal, false);

var modalEl = document.getElementById("tvp-modal-" + config.id);
modalEl.addEventListener('click', function(e){
  if (e.target === modalEl || !modalEl.contains(e.target)) {
      closeModal();
  }
}, false);
