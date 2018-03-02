(function () {
  var logStyle = '' +
  'color: blue;' +
  'font-size: 14px;' +
  'font-weight: bold;' +
  'display: block;';

  function getById(id) {
    return document.getElementById(id);
  }

  function hasKey(o, k) {
    return o.hasOwnProperty(k);
  }

  function isNull(o) {
    return null === o;
  }

  function isNaN(o) {
    return NaN === o;
  }

  function hasClass(o, c) {
    return o.classList && o.classList.contains(c);
  }

  function isObject(o) {
    return "object" === typeof o;
  }

  function isFunction(o) {
    return 'function' === typeof o;
  }

  function closest(el, cback) {
    return el && (cback(el) ? el : closest(el.parentNode, cback));
  }

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

  function isEmptyObject(o) {
    for (var k in o) {
      if (o.hasOwnProperty(k))
        return false;
    }

    return true;
  }

  function getStyle(el, prop, altProp) {
    var s;

    if (el.currentStyle){
      s = el.currentStyle[altProp];
    } else if (window.getComputedStyle) {
      s = document.defaultView.getComputedStyle(el, null).getPropertyValue(prop);
    }

    return s;
  }

  function loadScript(o, cback) {
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

    if (isFunction(cback)) {
      var cBackName = 'tvp_callback_' + Math.random().toString(36).substring(7);

      window[cBackName] = function (data) {
        if (isFunction(cback))
          cback(data);
      };

      src += '&callback=' + cBackName;
    }

    script.src = src;

    document.body.appendChild(script);
  }

  //the utils module
  var Utils = {};

  Utils.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  Utils.isIOS = (/iPad|iPhone|iPod|iPhone Simulator|iPad Simulator/.test(navigator.userAgent) && !window.MSStream);

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

  Utils.isNull = isNull;
  Utils.isNaN = isNaN;
  Utils.isObject = isObject;

  Utils.compact = function (o) {
    for (var k in o)
      if (o.hasOwnProperty(k) && !o[k])
        delete o[k];

    return o;
  }

  Utils.attr = function (el, a) {
    return el.getAttribute(a);
  };

  Utils.createEl = function (tag) {
    return document.createElement(tag);
  };

  Utils.isEmptyObject = isEmptyObject;

  Utils.stopEvent = function (e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  Utils.closest = closest;

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

  Utils.removeObjNulls = function (obj) {
    for (var k in obj) {
      if (obj.hasOwnProperty(k)) {
        if (obj[k] === null) {
          delete obj[k];
        }
      }
    }

    return obj;
  };

  Utils.getById = getById;

  Utils.hasClass = hasClass;

  Utils.loadScript = loadScript;

  Utils.sendMessage = function (msg) {
    if (window.parent)
      window.parent.postMessage(msg, '*');
  };

  Utils.getByClass = function (c) {
    return document.getElementsByClassName(c || '')[0];
  };

  Utils.isUndefined = function (o) {
    return 'undefined' === typeof o;
  };

  Utils.isFunction = isFunction;

  Utils.copy = function (o) {
    return JSON.parse(JSON.stringify(o));
  };

  Utils.hasKey = hasKey;

  Utils.isEmpty = function (o) {
    for (var key in o) {
      if (o.hasOwnProperty(key))
        return false;
    }
    return true;
  };

  Utils.formatDuration = function (secs) {
    if ("undefined" === typeof secs)
      return;

    var date = new Date(0, 0, 0);

    date.setSeconds(Number(secs));

    var format = function (v) {
      return v < 10 ? '0' + v : v;
    }

    return ((date.getHours() || '') + format(date.getMinutes()) + ':' + format(date.getSeconds()));
  };

  Utils.formatDate = function (unixTimestamp) {
    var d = (new Date(Number(unixTimestamp) * 1000)),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [month, day, year].join('/');
  };

  Utils.isset = function (o, p) {
    if (!arguments.length) return;
    var val = o;
    if (p) val = o[p];
    return 'undefined' !== typeof val;
  };

  Utils.extend = extend;

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
    console.log('%c ' + (msg || ''), logStyle);
  }

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

  Utils.trimPrice = function (p) {
    var price = p || '';
    price = price.toString().replace(/[^0-9.]+/g, '');
    price = parseFloat(price).toFixed(2);
    price = price > 0 ? ('$' + price) : '';
    return price;
  };

  Utils.rowerize = function (a, size) {
    var rows = [];
    var aLength = a.length;

    for (var i = 0; i < aLength; i += size) {
      rows.push(a.slice(i, i + size));
    }

    return rows;
  };

  Utils.isEvent = function (e) {
    return e && e.data && e.data.event;
  };

  Utils.getWindowWidth = function (e) {
    return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  };

  Utils.getWindowHeight = function (e) {
    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  };

  Utils.addProps = function (a, b) {
    if (isEmptyObject(b) || isEmptyObject(b))
      return a;

    for (var p in b)
      a[p] = b[p];

    return a;
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
    if (!isFunction(check)) {
      throw new Error("first argument shall be a function");
    }

    var count = 0;

    (function poller() {
      setTimeout(function () {
        if (check() && isFunction(callback)) {
          callback();
        } else if (++count < 1000) {
          poller();
        } else {
          throw new Error("poll condition not met after checking 1000 times");
        }
      }, 10);
    }())
  };

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
          throw new Error("missing global: " + missing);
        }
      }, 10);
    }())
  };

  Utils.getStyle = getStyle;

  window.Utils = Utils;
}())
