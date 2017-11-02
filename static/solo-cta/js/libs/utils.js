;(function(window,document) {

  function Utils() {

    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    this.getByClass = function(c){
      return document.getElementsByClassName(c || '')[0];
    };

    this.isFunction = function(obj) {
      return 'function' === typeof obj;
    };

    this.isEmpty = function(obj) {
      for(var key in obj) { if (obj.hasOwnProperty(key)) return false;}
      return true;
    };

    this.formatDuration = function(secs) {
        if ("undefined" === typeof secs) return;
        var date = new Date(0, 0, 0);
        date.setSeconds(Number(secs));
        var hour = (date.getHours() ? date.getHours() : ''),
            minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(),
            seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        return (hour + minutes + ':' + seconds);
    };

    this.formatDate = function(unixTimestamp) {
        var d = (new Date(Number(unixTimestamp) * 1000)),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [month, day, year].join('/');
    };

    this.isset = function(o,p){
      if (!arguments.length) return;
      var val = o;
      if (p) val = o[p];
      return 'undefined' !== typeof val;
    };

    this.loadScript = function(o){
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

    this.debounce = function(func,wait,immediate){
      var timeout = null;
      return function() {
        var context = this, args = arguments;
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

    this.trimText = function(text,limit){
      var t = text || '';
      var l = limit ? Number(limit) : 0;
      if (text.length > l) {
        t = t.substring(0,Number(l)) + '...';
      }
      return t;
    };

    this.trimPrice = function(p){
      var price = p || '';
      price = price.toString().replace(/[^0-9.]+/g, '');
      price = parseFloat(price).toFixed(2);
      price = price > 0 ? ('$' + price):'';
      return price;
    };

    this.tmpl = function(template, data) {
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
    
  }

  window.Utils = new Utils();

}(window, document));