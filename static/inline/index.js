var utils = {
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

var hostCssTagId = "tvp-inline-host-css";
var hostCssTag = "";
if (!document.getElementById(hostCssTagId)) {
  hostCssTag = '<style id="' + hostCssTagId + '">' + config.css.host + '</style>';
}

var targetElement;
if ( !config.hasOwnProperty('targetEl') ||  !document.getElementById(config.targetEl) ) {
  throw new Error ( "Must provide a targetEl");
} 

var targetElement = document.getElementById(config.targetEl);
targetElement.insertAdjacentHTML('beforebegin', "<style>" + config.css["host-custom"] + "</style>" + hostCssTag + '<div id="' + id + '-holder" class="tvp-inline-holder">'+
'<iframe class="tvp-iframe" src="about:blank" allowfullscreen frameborder="0" scrolling="no"></iframe></div>');
targetElement.parentNode.removeChild(targetElement);

config.id = id;
config.staticPath = config.baseUrl + "/inline";
config.mobilePath = utils.isMobile ? 'mobile/' : '';
config.distPath = config.debug ? '/' : '/dist/';
config.cssPath = config.staticPath + config.distPath + 'css/';
config.jsPath = config.staticPath  + '/dist/js/';
config.eventPrefix = ("tvp_" + config.id).replace(/-/g,'_');

var playerUrl = "https://cdnjs.tvpage.com/tvplayer/tvp-" + config.player_version + ".min.js";
var holder = document.getElementById(config.id + "-holder");
utils.isset(config, 'iframe_holder_background_color') ? holder.style.cssText += 'background-color:'+ config.iframe_holder_background_color +';' : null;
var iframe = holder.querySelector("iframe");
var iframeDocument = iframe.contentWindow.document;

iframeDocument.open().write(utils.getIframeHtml({
    id: config.id,
    className: "dynamic",
    domain: config.baseUrl,
    style: config.css.inline,
    js: [
        '//test.tvpage.com/tvpa.min.js',
        '//imasdk.googleapis.com/js/sdkloader/ima3.js',
        playerUrl,
        config.debug ? config.jsPath + "scripts.js" : "",
        config.debug ? "" : config.jsPath + "scripts.min.js"
    ],
    css: [
        config.debug ? config.cssPath + "styles.css" : "",
        config.debug ? "" : config.cssPath + "styles.min.css"
    ]
}));
iframeDocument.close();

var isEvent = function (e, type) {    
    return (e && utils.isset(e, "data") && utils.isset(e.data, "event") && config.eventPrefix + type === e.data.event);
};

window.addEventListener("message", function(e){
    if (!isEvent(e, ":resize")) return;
    holder.style.height = e.data.height;
});

var clickData = {};

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