(function(){
  var userAgent = navigator.userAgent;
  
  var hasKey = function(o,k){
    return o.hasOwnProperty(k);
  };

  var getGlobalFromParent = function(){
    return window.parent && hasKey(parent, '__TVPage__') ? parent.__TVPage__ : null;
  };
  
  var Utils = {};
  
  Utils.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  Utils.isIOS = (/iPad|iPhone|iPod|iPhone Simulator|iPad Simulator/.test(userAgent) && !window.MSStream);
  
  Utils.getById = function(id) {
    return document.getElementById(id);
  };
  
  Utils.hasClass = function(o,c) {
    return o.classList.contains(c);
  };
  
  Utils.loadScript = function(o){
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
  
    script.src = src;
    document.body.appendChild(script);
  };
  
  Utils.sendMessage = function(msg){
    if (window.parent)
      window.parent.postMessage(msg, '*');
  };
  
  Utils.getByClass = function(c) {
    return document.getElementsByClassName(c || '')[0];
  };
  
  Utils.isUndefined = function(o) {
    return 'undefined' === typeof o;
  };
  
  Utils.isFunction = function(o) {
    return 'function' === typeof o;
  };
  
  Utils.copy = function(o) {
    return JSON.parse(JSON.stringify(o));
  };
  
  Utils.hasKey = hasKey;
  
  Utils.isEmpty = function(o) {
    for (var key in o) {
      if (o.hasOwnProperty(key))
        return false;
    }
    return true;
  };
  
  Utils.formatDuration = function(secs) {
    if ("undefined" === typeof secs)
      return;
    
    var date = new Date(0, 0, 0);
    
    date.setSeconds(Number(secs));
  
    var format = function(v){
      return v < 10 ? '0' + v : v;
    }
  
    return ((date.getHours() || '') + format(date.getMinutes()) + ':' + format(date.getSeconds()));
  };
  
  Utils.formatDate = function(unixTimestamp) {
    var d = (new Date(Number(unixTimestamp) * 1000)),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [month, day, year].join('/');
  };
  
  Utils.isset = function(o, p) {
    if (!arguments.length) return;
    var val = o;
    if (p) val = o[p];
    return 'undefined' !== typeof val;
  };
  
  Utils.extend = function(out) {
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
  
  Utils.debounce = function(func, wait, immediate) {
    var timeout = null;
    return function() {
      var context = this,
        args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };
  
  Utils.trimText = function(text, limit) {
    var t = text || '';
    var l = limit ? Number(limit) : 0;
    if (text.length > l) {
      t = t.substring(0, Number(l)) + '...';
    }
    return t;
  };
  
  Utils.trimPrice = function(p) {
    var price = p || '';
    price = price.toString().replace(/[^0-9.]+/g, '');
    price = parseFloat(price).toFixed(2);
    price = price > 0 ? ('$' + price) : '';
    return price;
  };

  Utils.getParentConfig = function(id) {
    var parentGlobal = getGlobalFromParent();

    if (!parentGlobal || !parentGlobal.config || !hasKey(parentGlobal.config, id))
      throw new Error("no config");
  
    return parentGlobal.config[id];
  };
  
  Utils.tmpl = function(template, data) {
    if (template && 'object' == typeof data) {
      return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
        var keys = key.split("."),
          v = data[keys.shift()];
        for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
        return (typeof v !== "undefined" && v !== null) ? v : "";
      });
    } else {
      return false;
    }
  };
    
  window.Utils = Utils;
}())