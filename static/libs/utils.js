(function(){

  var userAgent = navigator.userAgent;
  var body = document.body;

  //helpers
  var getById = function(id){
    return document.getElementById(id);
  }

  var hasKey = function(o,k){
    return o.hasOwnProperty(k);
  };

  var hasClass = function(o,c) {
    return o.classList && o.classList.contains(c);
  };

  var getGlobalFromParent = function(){
    return window.parent && hasKey(window.parent, '__TVPage__') ? window.parent.__TVPage__ : null;
  };

  var isFunction = function(o) {
    return 'function' === typeof o;
  };
  
  //the utils module
  var Utils = {};
  
  Utils.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  Utils.isIOS = (/iPad|iPhone|iPod|iPhone Simulator|iPad Simulator/.test(userAgent) && !window.MSStream);
  
  Utils.getWidgetHeight = function() {
    return Math.floor(getById('skeleton').getBoundingClientRect().height);
  };

  Utils.attr = function(el,a) {
    return el.getAttribute(a);
  };

  Utils.stopEvent = function(e) {
    if(e){
      e.preventDefault();
      e.stopPropagation();
    }
  };

  var closest = function(el, cback) {
    return el && (cback(el) ? el : closest(el.parentNode, cback));
  };

  Utils.closest = closest;

  Utils.getRealTargetByClass = function(targetEl, targetClass){
    return hasClass(targetEl, targetClass) ? targetEl : closest(targetEl, function(el){
      return hasClass(el, targetClass)
    });
  };

  Utils.remove = function(el) {
    el.parentNode.removeChild(el);
  };

  Utils.addClass = function(el,c) {
    el.classList.add(c);
  };

  Utils.removeClass = function(el,c) {
    el.classList.remove(c);
  };

  Utils.getById = getById;

  Utils.hasClass = hasClass;
  
  Utils.loadScript = function(o, cback){
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
  
    var cBackName = 'tvp_callback_' + Math.random().toString(36).substring(7);

    window[cBackName] = function(data){
      if(isFunction(cback))
        cback(data);
    };

    src += '&callback=' + cBackName;
    script.src = src;

    body.appendChild(script);
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
  
  Utils.isFunction = isFunction;
  
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

  Utils.rowerize = function(a, size){
    var rows = [];
    var aLength = a.length;

    for (var i = 0; i < aLength; i += size) {
      rows.push(a.slice(i, i + size));
    }
    
    return rows;
  };

  Utils.isEvent = function(e) {
    return e && e.data && e.data.event;
  };

  Utils.addProps = function(a,b) {
    for (var p in b)
      a[p] = b[p];
    
    return a;
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

  Utils.getStyle = function(el,styleProp){
    var s;
    if (el.currentStyle)
      s = el.currentStyle[styleProp];
    else if (window.getComputedStyle)
      s = document.defaultView.getComputedStyle(el,null).getPropertyValue(styleProp);
    return s;
  };
    
  window.Utils = Utils;
}())