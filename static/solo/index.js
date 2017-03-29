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

var hostCssTagId = "tvp-solo-host-css";
var hostCssTag = "";
if (!document.getElementById(hostCssTagId)) {
  hostCssTag = '<style id="' + hostCssTagId + '">' + config.css.host + '</style>';
}

var targetElement;
if ( !config.hasOwnProperty('targetEl') ||  !document.getElementById(config.targetEl) ) {
  throw new Error ( "Must provide a targetEl");
} 

var targetElement = document.getElementById(config.targetEl);
targetElement.insertAdjacentHTML('beforebegin', "<style>" + config.css["host-custom"] + "</style>" + hostCssTag + '<div id="' + id + '-holder" class="tvp-solo-holder">'+
'<iframe src="about:blank" allowfullscreen frameborder="0" scrolling="no"></iframe></div>');
targetElement.parentNode.removeChild(targetElement);

config.id = id;
config.staticPath = config.baseUrl + "/solo";
config.mobilePath = utils.isMobile ? 'mobile/' : '';
config.distPath = config.debug ? '/' : '/dist/';
config.cssPath = config.staticPath + config.distPath + 'css/';
config.jsPath = config.staticPath + config.distPath + 'js/';
config.eventPrefix = ("tvp_" + config.id).replace(/-/g,'_');

var holder = document.getElementById(config.id + "-holder");
var iframe = holder.querySelector("iframe");
var iframeDocument = iframe.contentWindow.document;
var iframeContent = utils.getIframeHtml({
    id: config.id,
    className: "dynamic",
    domain: config.baseUrl,
    style: config.css["styles-custom"],
    js: [
        '//a.tvpage.com/tvpa.min.js',
        'https://cdnjs.tvpage.com/tvplayer/tvp-'+config.player_version+'.min.js',
        config.debug ? config.jsPath + "vendor/simple-scrollbar.min.js" : "",
        config.debug ? config.jsPath + "libs/utils.js" : "",
        config.debug ? config.jsPath + "libs/analytics.js" : "",
        config.debug ? config.jsPath + "libs/player.js" : "",
        config.debug ? config.jsPath + "menu.js" : "",
        config.debug ? config.jsPath + "index.js" : "",
        config.debug ? "" : config.jsPath + "scripts.min.js"
    ],
    css: [
        config.debug ? config.cssPath + "styles.css" : "",
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

//Listen to orientation/resize changes in the external page whenever the widget
//is being used in an iOS device so we can send the size information to the
//player so it can resize itself.
if (utils.isIOS) {
  var onOrientationChange = function () {
    if (iframe && iframe.contentWindow) {
      var width = iframe.parentNode.offsetWidth;
      iframe.contentWindow.window.postMessage({
        event: config.eventPrefix + ':holder_resize',
        size: [width, Math.floor(width * (9 / 16))]
      },'*');
    }
  };
  var orientationChangeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize';
  window.removeEventListener(orientationChangeEvent,onOrientationChange, false);
  window.addEventListener(orientationChangeEvent,onOrientationChange, false);
}