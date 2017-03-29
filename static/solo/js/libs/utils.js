;(function(window, document) {

  function Utils() {

    this.random = function(){
      return 'tvp_' + Math.floor(Math.random() * 50005);
    };

    this.isset = function(o, p) {
      var val = o;
      if (p) val = o[p];
      return 'undefined' !== typeof val;
    };

    this.isEmpty = function(obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) return false;
      }
      return true;
    };

    this.tmpl = function(template, data) {
      if (!template && 'object' !== typeof data) return;
      return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
        var keys = key.split("."),
          v = data[keys.shift()];
        for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
        return (typeof v !== "undefined" && v !== null) ? v : "";
      });
    };

    this.trimText = function(text, limit) {
      var t = text || '';
      var l = limit ? Number(limit) : 0;
      if (text.length > l) {
        t = t.substring(0, Number(l)) + '...';
      }
      return t;
    };

<<<<<<< HEAD
=======
    this.formatDuration = function(secs) {
      if ("undefined" === typeof secs) return;
      var date = new Date(0, 0, 0);
      date.setSeconds(Number(secs));
      var hour = (date.getHours() ? date.getHours() : ''),
          minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(),
          seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
      return (hour + minutes + ':' + seconds);
    };

>>>>>>> 373ce5bd9943458921ce1044df1dc78636a30d41
    this.debounce = function(func,wait,immediate){
      var timeout;  
      return function() {
        var context = this,
        args = arguments,
        later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        },
        callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };      
    };
  }
  window.Utils = new Utils();
}(window, document));
