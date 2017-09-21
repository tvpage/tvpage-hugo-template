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
var hostCssTagId = "tvp-solo-cta-host-css";
var hostCssTag = "";

if (!document.getElementById(hostCssTagId)) {
  hostCssTag = '<style id="' + hostCssTagId + '">' + config.css.host + '</style>';
}

var targetElement;
if ( !config.hasOwnProperty('targetEl') ||  !document.getElementById(config.targetEl) ) {
  throw new Error ( "Must provide a targetEl");
} 

var targetElement = document.getElementById(config.targetEl);
targetElement.insertAdjacentHTML('beforebegin', hostCssTag + "<style>" + config.css["host-custom"] + "</style><div id=\"" + id + "-holder\" class=\"tvp-solo-cta-holder\"></div>");
targetElement.parentNode.removeChild(targetElement);

config.id = id;
config.staticPath = config.baseUrl + "/solo-cta";
config.mobilePath = utils.isMobile ? 'mobile/' : '';
config.distPath = config.debug ? '/' : '/dist/';
config.cssPath = config.staticPath + config.distPath + 'css/';
config.jsPath = config.staticPath + config.distPath + 'js/';
config.eventPrefix = ("tvp_" + config.id).replace(/-/g,'_');

//Append templates that live in the host page.
var modalContainer = document.createElement("div");
modalContainer.innerHTML = config.templates.modal;
document.body.appendChild(modalContainer);

var holder = document.getElementById(config.id + "-holder");
var channel = config.channel || {};
var channelId = channel.id ? channel.id : (config.channelid || 0);
if (!channelId) {
  holder.parentNode.removeChild(holder);
}

var clickData = {};

var handleVideoClick = function(){
  updateModalTitle(clickData.selectedVideo.title);
  utils.removeClass('tvp-modal-' + config.id,'tvp-hidden');
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
    style: config.css.modal,
    className: utils.isMobile ? " mobile" : "",
    html: config.templates["modal-content" + (utils.isMobile ? "-mobile" : "")],
    js: [
        "//a.tvpage.com/tvpa.min.js",
        '//imasdk.googleapis.com/js/sdkloader/ima3.js',
        playerUrl,
        config.debug ? config.jsPath + "libs/utils.js" : "",
        config.debug ? config.jsPath + "libs/analytics.js" : "",
        config.debug ? config.jsPath + "libs/player.js" : "",
        config.debug ? config.jsPath + "modal/index.js" : "",
        config.debug ? "" : config.jsPath + "modal/scripts.min.js"
    ],
    css: [
        config.debug ? config.cssPath + config.mobilePath + "modal/styles.css" : "",
        config.debug ? "" : config.cssPath + config.mobilePath + "modal/styles.min.css"
    ]
  }));

  iframeModalDocument.close();
};

//Loading the videos.
var jsonpScript = document.createElement('script');
var cbName = 'tvp_' + Math.floor(Math.random() * 50005);
var jsonpScriptSrc = config.api_base_url + '/channels/' + channelId + '/videos?X-login-id=' + (config.loginId || config.loginid);

var params = channel.parameters || {};
for (var p in params) { jsonpScriptSrc += '&' + p + '=' + params[p];}

jsonpScriptSrc += "&callback=" + cbName;
jsonpScript.src = jsonpScriptSrc;

window[cbName] = function (data) {
    if (data.length) {
      holder.classList.add("initialized");

      var overlayEl = document.createElement("div");
      overlayEl.className = "tvp-cta-overlay";
      var video = data[0];
      overlayEl.style.backgroundImage = "url(" + video.asset.thumbnailUrl + ")";
      var template = config.templates.cta;
      if (utils.isset(video,'title')) {
          template += "<div class='tvp-cta-text'>" + video.title + "</div>";
      }
      
      overlayEl.innerHTML = template;

      clickData = {
        data: data,
        selectedVideo: data[0],
        runTime: config
      };
      
      overlayEl.removeEventListener("click",handleVideoClick,false);
      overlayEl.addEventListener("click",handleVideoClick,false);
      holder.appendChild(overlayEl);
    }
};

document.body.appendChild(jsonpScript);

var isEvent = function (e, type) {
    return (e && utils.isset(e, "data") && utils.isset(e.data, "event") && config.eventPrefix + type === e.data.event);
};

var updateModalTitle = function(title){
    document.getElementById('tvp-modal-title-' + config.id).innerHTML = title || "";
};

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
    case 'modal_initialized':
      handleModalInitialized(e);
      break;
    case 'player_next':
      handlePlayerNext(e);
      break;
    default: 
      // do nothing
  }

  handleCallback(e);
};

function handleCallback(e){
  if (__windowCallbackFunc__) 
    __windowCallbackFunc__(e);
}

window.addEventListener("message", function(e){
  handlePostMessages(e);
});

function handleModalInitialized(e){
  if (iframeModal.contentWindow) {
    var obj = {
          event: config.eventPrefix + ':modal_data',
          data: clickData.data,
          selectedVideo: clickData.selectedVideo,            
          runTime: clickData.runTime
      };
      obj = JSON.parse(JSON.stringify(obj));
      iframeModal.contentWindow.postMessage(obj, '*');
  }

  if (utils.isIOS) {
    var onOrientationChange = function () {
        if (iframeModal && iframeModal.contentWindow) {
            var width = iframeModal.parentNode.offsetWidth;
            iframeModal.contentWindow.window.postMessage({
                event: config.eventPrefix + ':modal_holder_resize',
                size: [width, Math.floor(width * (9 / 16))]
            },'*');
        }
    };
    var orientationChangeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize';
    window.removeEventListener(orientationChangeEvent,onOrientationChange, false);
    window.addEventListener(orientationChangeEvent,onOrientationChange, false);
  }
};

function handlePlayerNext(e) {
    updateModalTitle(e.data.next.assetTitle);
};

var closeModal = function () {
  utils.addClass('tvp-modal-' + config.id,'tvp-hidden');
  utils.addClass('tvp-modal-overlay-' + config.id,'tvp-hidden');

  if (config.fix_page_scroll) {
      utils.removeClass(document.body,'tvp-modal-open');
  }

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