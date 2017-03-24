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

if ("undefined" !== typeof __TVPage__.config[id]) {
    __TVPage__.config[id] = utils.extend({},__TVPage__.config[id], bootstrap);
} else {
    __TVPage__.config[id] = bootstrap;
}

var config = utils.isset(window.__TVPage__) && utils.isset(__TVPage__,"config") && utils.isset(__TVPage__.config,id) ? __TVPage__.config[id] : {};

var hostCssTagId = "tvp-carousel-host-css";
var hostCssTag = "";

if (!document.getElementById(hostCssTagId)) {
  hostCssTag = '<style id="' + hostCssTagId + '">' + config.css.host + '</style>';
}

var targetElement;
if ( !config.hasOwnProperty('targetEl') ||  !document.getElementById(config.targetEl) ) {
  throw new Error ( "Must provide a targetEl");
} 

var targetElement = document.getElementById(config.targetEl);
targetElement.insertAdjacentHTML('beforebegin', "<style>" + config.css["host-custom"] + "</style>" + hostCssTag + '<div id="' + id + '-holder" class="tvp-carousel-holder">'+
'<iframe src="about:blank" allowfullscreen frameborder="0" scrolling="no"></iframe></div>');
targetElement.parentNode.removeChild(targetElement);

config.id = id;
config.staticPath = config.baseUrl + "/carousel";
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
var iframe = holder.querySelector("iframe");
var iframeDocument = iframe.contentWindow.document;
var iframeContent = utils.getIframeHtml({
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
    if (!isEvent(e, ":resize")) return;
    holder.style.height = e.data.height;
});

var clickData = {};
var iframeModalHolder = document.getElementById('tvp-modal-iframe-holder-' + config.id);
var iframeModal = null;
var iframeModalDocument = null;

window.addEventListener("message", function(e){
    if (!isEvent(e, ":video_click")) return;

    var eventData = e.data;

    clickData = {
        data: eventData.videos,
        selectedVideo: eventData.selectedVideo,
        runTime: (eventData.runTime || (utils.isset(window, '__TVPage__') ? __TVPage__ : {}) ).config[config.id]
    };

    updateModalTitle(eventData.selectedVideo.title);
    utils.removeClass('tvp-modal-' + config.id,'tvp-hidden');
    utils.removeClass('tvp-modal-overlay-' + config.id,'tvp-hidden');
    
    if (config.fix_page_scroll) {
        utils.addClass(document.body, 'tvp-modal-open');
    }

    iframeModalHolder.innerHTML =  '<iframe class="tvp-iframe-modal" src="about:blank" allowfullscreen frameborder="0" scrolling="no"></iframe>';
    iframeModal = iframeModalHolder.querySelector('.tvp-iframe-modal');
    iframeModalDocument = iframeModal.contentWindow.document;
    iframeModalDocument.open().write(utils.getIframeHtml({
        id: config.id,
        domain: config.baseUrl,
        style: config.css.modal,
        className: utils.isMobile ? " mobile" : "",
        html: config.templates["modal-content" + (utils.isMobile ? "-mobile" : "")],
        js: [
            "//a.tvpage.com/tvpa.min.js",
            "https://cdnjs.tvpage.com/tvplayer/tvp-1.8.6.min.js",
            config.debug && utils.isMobile ? config.jsPath + "/vendor/jquery.js" : "",
            config.debug && !utils.isMobile ? config.jsPath + "/vendor/simple-scrollbar.min.js" : "",
            config.debug ? config.jsPath + "/libs/utils.js" : "",
            config.debug ? config.jsPath + "/libs/analytics.js" : "",
            config.debug ? config.jsPath + "/libs/player.js" : "",
            config.debug ? config.jsPath + "/" + config.mobilePath + "modal/index.js" : "",
            config.debug ? "" : config.jsPath + config.mobilePath + "modal/scripts.min.js"
        ],
        css: [
            config.debug ? config.cssPath + "/" + config.mobilePath + "modal/styles.css" : "",
            config.debug && utils.isMobile ? config.cssPath + "/vendor/slick.css" : "",
            config.debug && !utils.isMobile ? config.cssPath + "/vendor/simple-scrollbar.css" : "",
            config.debug ? "" : config.cssPath + "/" + config.mobilePath + "modal/styles.min.css"
        ]
    }));

    iframeModalDocument.close();
});

window.addEventListener("message", function(e){
    if (!isEvent(e, ":modal_initialized")) return;

    if (iframeModal.contentWindow) {
        iframeModal.contentWindow.postMessage({
            event: config.eventPrefix + ':modal_data',
            data: clickData.data,
            selectedVideo: clickData.selectedVideo,
            runTime: clickData.runTime
        }, '*');
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
});

window.addEventListener("message", function(e) {
    if (!isEvent(e, ":player_next")) return;
    updateModalTitle(e.data.next.assetTitle);
});

window.addEventListener("message", function(e) {
    if (!isEvent(e, ":modal_no_products")) return;

    if (!utils.isMobile) {
        var label = document.getElementById('tvp-products-headline-' + config.id);
        if (label) {
            label.parentNode.removeChild(label);
        }
    }

    utils.removeClass(iframeModalHolder,'products');
    utils.addClass(iframeModalHolder,'no-products');
});

window.addEventListener("message", function(e){
    if (!isEvent(e, ":modal_resize")) return;
    iframeModal.style.height = e.data.height;
});

window.addEventListener("message", function(e) {
    if (!isEvent(e, ":modal_products")) return;
    if (!utils.isMobile && !document.getElementById('tvp-products-headline-' + config.id)) {
        var label = document.createElement('p');
        utils.addClass(label,'tvp-products-headline');
        label.id = 'tvp-products-headline-' + config.id;
        label.innerHTML = 'Related Products';
        document.getElementById('tvp-modal-header-' + config.id).appendChild(label);
    }

    utils.removeClass(iframeModalHolder,'no-products');
    utils.addClass(iframeModalHolder,'products');
});

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
