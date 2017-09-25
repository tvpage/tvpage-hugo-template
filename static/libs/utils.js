(function() {
  
    var userAgent = navigator.userAgent;
  
    function Utils() {}
  
    Utils.prototype.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
    Utils.prototype.isIOS = (/iPad|iPhone|iPod|iPhone Simulator|iPad Simulator/.test(userAgent) && !window.MSStream);
  
    Utils.prototype.getById = function(id) {
      return document.getElementById(id);
    };
  
    Utils.prototype.hasClass = function(o,c) {
      return o.classList.contains(c);
    };
  
    Utils.prototype.sendMessage = function(msg){
      if (window.parent)
        window.parent.postMessage(msg, '*');
    };
  
    Utils.prototype.getByClass = function(c) {
      return document.getElementsByClassName(c || '')[0];
    };
  
    Utils.prototype.isFunction = function(obj) {
      return 'function' === typeof obj;
    };
  
    Utils.prototype.copy = function(obj) {
      return JSON.parse(JSON.stringify(obj));
    };
  
    Utils.prototype.hasKey = function(o, key) {
      return o.hasOwnProperty(key);
    };
  
    Utils.prototype.isEmpty = function(obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key))
          return false;
      }
      return true;
    };
  
    Utils.prototype.formatDuration = function(secs) {
      if ("undefined" === typeof secs)
        return;
      
      var date = new Date(0, 0, 0);
      
      date.setSeconds(Number(secs));
  
      var format = function(v){
        return v < 10 ? '0' + v : v;
      }
  
      return ((date.getHours() || '') + format(date.getMinutes()) + ':' + format(date.getSeconds()));
    };
  
    Utils.prototype.formatDate = function(unixTimestamp) {
      var d = (new Date(Number(unixTimestamp) * 1000)),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
      return [month, day, year].join('/');
    };
  
    Utils.prototype.isset = function(o, p) {
      if (!arguments.length) return;
      var val = o;
      if (p) val = o[p];
      return 'undefined' !== typeof val;
    };
  
    Utils.prototype.debounce = function(func, wait, immediate) {
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
  
    Utils.prototype.trimText = function(text, limit) {
      var t = text || '';
      var l = limit ? Number(limit) : 0;
      if (text.length > l) {
        t = t.substring(0, Number(l)) + '...';
      }
      return t;
    };
  
    Utils.prototype.trimPrice = function(p) {
      var price = p || '';
      price = price.toString().replace(/[^0-9.]+/g, '');
      price = parseFloat(price).toFixed(2);
      price = price > 0 ? ('$' + price) : '';
      return price;
    };
  
    Utils.prototype.tmpl = function(template, data) {
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
  
    window.Utils = new Utils();
  
  }());