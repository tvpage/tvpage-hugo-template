(function () {
  //the utils module
  var Utils = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: (/iPad|iPhone|iPod|iPhone Simulator|iPad Simulator/.test(navigator.userAgent) && !window.MSStream)
  };
  var logStyle = '' +
  'color: blue;' +
  'font-size: 14px;' +
  'font-weight: bold;' +
  'display: block;';

  //consider renaming this function to something with more meaning
  function getById(id) {
    return document.getElementById(id);
  }

  Utils.getById = getById;

  function hasKey(o, k) {
    return o.hasOwnProperty(k);
  }

  function isUndefined(o) {
    return 'undefined' === typeof o;
  };

  Utils.hasKey = hasKey;

  function hasClass(o, c) {
    return o.classList && o.classList.contains(c);
  }

  Utils.hasClass = hasClass;

  function isObject(o) {
    return "object" === typeof o;
  }

  Utils.isObject = isObject;

  function isFunction(o) {
    return 'function' === typeof o;
  }

  Utils.isFunction = isFunction;

  function extend(out) {
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

  Utils.extend = extend;

  function getStyle(el, prop, altProp) {
    var s;

    if (el.currentStyle){
      s = el.currentStyle[altProp];
    } else if (window.getComputedStyle) {
      s = document.defaultView.getComputedStyle(el, null).getPropertyValue(prop);
    }

    return s;
  }

  Utils.getStyle = getStyle;

  function loadScript(o, callback) {
    var script = document.createElement('script');
    var src = o.base || '';
    var prms = o.params || {};
    var counter = 0;

    for (var p in prms) {
      if (prms.hasOwnProperty(p)) {
        src += (counter > 0 ? '&' : '?') + p + '=' + prms[p];
        ++counter;
      }
    }

    if (isFunction(callback)) {
      var callBackName = 'tvp_callback_' + Math.random().toString(36).substring(7);

      window[callBackName] = function (data) {
        if (isFunction(callback))
          callback(data);
      };

      src += '&callback=' + callBackName;
    }

    script.src = src;

    document.body.appendChild(script);
  }

  Utils.loadScript = loadScript;

  //lets remove this from here, this is not a utils function, is more specialized
  Utils.getWidgetHeight = function () {
    return Math.floor(getById('skeleton').getBoundingClientRect().height);
  };

  Utils.now = function (from) {
    var glob = window;

    if ('parent' === from && glob.parent) {
      glob = glob.parent;
    }

    if (glob.performance) {
      return glob.performance.now();
    }
  };

  Utils.isString = function isString(o) {
    return 'string' === typeof o;
  };

  Utils.isNumber = function isNumber(o) {
    return 'number' === typeof o;
  };

  Utils.isNull = function isNull(o) {
    return null === o;
  };

  Utils.isUndefined = isUndefined;
  
  Utils.hasDot = function hasDot(s) {
    return s.search(/\./);
  };

  Utils.compact = function (o) {
    for (var k in o)
      if (o.hasOwnProperty(k) && !o[k])
        delete o[k];

    return o;
  }

  Utils.inDom = function (el) {
    return document.body.contains(el);
  }

  Utils.attr = function (el, a) {
    return el.getAttribute(a);
  };

  Utils.createEl = function (tag) {
    return document.createElement(tag);
  };

  Utils.stopEvent = function (e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  function closest(el, cback) {
    return el && (cback(el) ? el : closest(el.parentNode, cback));
  }

  Utils.closest = closest;
  
  //consider renaming this function
  Utils.getRealTargetByClass = function (targetEl, targetClass) {
    return hasClass(targetEl, targetClass) ? targetEl : closest(targetEl, function (el) {
      return hasClass(el, targetClass)
    });
  };

  Utils.remove = function (el) {
    if (el) {
      el.parentNode.removeChild(el);
    }
  };

  Utils.addClass = function (el, c) {
    if (el) {
      el.classList.add(c);
    }
  };

  Utils.removeClass = function (el, c) {
    if (el) {
      el.classList.remove(c);
    }
  };

  Utils.removeNulls = function (obj) {
    for (var k in obj) {
      if (obj.hasOwnProperty(k)) {
        if (obj[k] === null) {
          delete obj[k];
        }
      }
    }

    return obj;
  };

  //this specifically post a message to the parent window, i think we need
  //to do this more generic or pass an argument to do that.
  Utils.sendMessage = function (msg) {
    if (window.parent)
      window.parent.postMessage(msg, '*');
  };

  Utils.getByClass = function (c) {
    return document.getElementsByClassName(c || '')[0];
  };  

  Utils.copy = function (o) {
    return JSON.parse(JSON.stringify(o));
  };

  function isEmpty(o) {
    for (var key in o) {
      if (o.hasOwnProperty(key))
        return false;
    }
    return true;
  }

  Utils.isEmpty = isEmpty;

  Utils.formatDuration = function (secs) {
    if (isUndefined(secs))
      return;

    var date = new Date(0, 0, 0);

    date.setSeconds(Number(secs));

    var format = function (v) {
      return v < 10 ? '0' + v : v;
    }

    return ((date.getHours() || '') + format(date.getMinutes()) + ':' + format(date.getSeconds()));
  };

  Utils.debounce = function (func, wait, immediate) {
    var timeout = null;
    return function () {
      var context = this,
        args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  Utils.trimText = function (text, limit) {
    var t = text || '';
    var l = limit ? Number(limit) : 0;
    if (text.length > l) {
      t = t.substring(0, Number(l)) + '...';
    }
    return t;
  };

  function log(msg) {
    if(console && console.log){
      console.log('%c ' + (msg || ''), logStyle);
    }
  }
  
  /* istanbul ignore next */
  function profile(config, params) {
    if (!hasKey(config, 'profile') || !config.profile) {
      return;
    }

    log(params.metric_type + ': ' + params.metric_value + 'ms');

    // loadScript({
    //   base: config.profile_base_url,
    //   params: extend({
    //     loc_id: config.id,
    //     loginId: config.loginId,
    //     channelId: config.channelId,
    //     type_id: config.type,
    //     run_id: config.runId,
    //     url: location.hostname
    //   }, params)
    // });
  }

  Utils.log = log;
  
  Utils.profile = profile;

  /* istanbul ignore next */
  Utils.sendProfileData = function (config) {
    setTimeout(function(){
      if(!config || !isObject(config))
        return;
      
      var data = config.profiling || {};

      for (var key in data) {
        if(isObject(data[key]))
          continue;
  
        profile(config, {
          metric_type: key,
          metric_value: data[key]
        });
      }
    },1000);
  }

  //not a good name, probably better format price?
  Utils.trimPrice = function (p) {
    var price = p || '';
    price = price.toString().replace(/[^0-9.]+/g, '');
    price = parseFloat(price).toFixed(2);
    price = price > 0 ? ('$' + price) : '';
    return price;
  };

  //need to rename to something less specific to rows, something like
  //chop, break, not sure, neet to check how _ names this
  Utils.rowerize = function (a, size) {
    var rows = [];
    var aLength = a.length;

    for (var i = 0; i < aLength; i += size) {
      rows.push(a.slice(i, i + size));
    }

    return rows;
  };

  //to especial, need to pull it out from utils
  Utils.isEvent = function (e) {
    return e && e.data && e.data.event;
  };

  Utils.getWindowWidth = function (e) {
    return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  };

  Utils.getWindowHeight = function (e) {
    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  };

  Utils.tmpl = function (template, data) {
    if (template && 'object' == typeof data) {
      return template.replace(/\{([\w\.]*)\}/g, function (str, key) {
        var keys = key.split("."),
          v = data[keys.shift()];
        for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
        return (typeof v !== "undefined" && v !== null) ? v : "";
      });
    } else {
      return false;
    }
  };

  Utils.poll = function (check, callback) {
    if (!isFunction(check))
      throw "need function for check argument";

    var count = 0;

    (function poller() {
      setTimeout(function () {
        if (check() && isFunction(callback)) {
          callback();
        } else if (++count < 1000) {
          poller();
        } else {
          /* istanbul ignore next */
          throw new Error("poll condition not met after checking 1000 times");
        }
      }, 10);
    }())
  };

  //you should change this to be more testable, for example, the 
  //function shall recevie a full url and it shoul return the params
  Utils.getUrlParams = function () {
    if (!window.location)
      return;

    var o = {};
    var kv = location.search.substr(1).split('&');
    var kvLength = kv.length;
    var params = [];

    for (var i = 0; i < kvLength; i++)
      params.push(kv[i]);

    var paramsLength = params.length;

    for (var i = 0; i < paramsLength; i++) {
      var param = params[i].split('=');

      if (param[1])
        o[param[0]] = param[1];
    }

    return o;
  };

  Utils.globalPoll = function (globs, callback) {
    globs = (globs || []).filter(Boolean);

    var globsLength = globs.length;
    var globsCheck = 0;

    (function poll() {
      setTimeout(function () {
        var ready = true;
        var missing;

        for (var i = 0; i < globsLength; i++) {
          var glob = globs[i];

          if (undefined === window[glob]) {
            ready = false;

            missing = glob;
          }
        }

        if (ready) {
          if (isFunction(callback))
            callback();
        } else if (++globsCheck < 10000) {
          poll();
        } else {
          /* istanbul ignore next */
          throw new Error("missing global: " + missing);
        }
      }, 10);
    }())
  };

  window.Utils = Utils;
}())
