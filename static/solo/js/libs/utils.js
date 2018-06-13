;(function(window, document) {

  function Utils() {


    var _this = this;

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

    this.globalPoll = function (globs, callback) {
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
            if (_this.isFunction(callback))
              callback();
          } else if (++globsCheck < 10000) {
            poll();
          } else {
            throw new Error("missing global: " + missing);
          }
        }, 10);
      }())
    };

    this.compact = function (o) {
      for (var k in o)
        if (o.hasOwnProperty(k) && !o[k])
          delete o[k];

      return o;
    }

    this.isFunction = function(obj) {
      return 'function' === typeof obj;
    };

    this.getById = function(id) {
      return document.getElementById(id);
    };

    this.isUndefined = function (o) {
      return 'undefined' === typeof o;
    };

    this.getSettings = function(){
      var getConfig = function(g){
        if (_this.isset(g) && _this.isset(g,'__TVPage__') && _this.isset(g.__TVPage__, 'config')) {
          return g.__TVPage__.config;
        }
        return null;
      };
      var config = getConfig(parent);
      var id = document.body.getAttribute('data-id');
      if (!_this.isset(config, id)) return;
      var settings = config[id];
      settings.name = id;
      return settings;
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
