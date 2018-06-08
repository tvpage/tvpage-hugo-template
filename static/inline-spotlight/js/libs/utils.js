;(function(window,document) {

  function Utils() {

    var _this = this;

    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.isIOS = /iPad|iPhone|iPod|iPhone Simulator|iPad Simulator/.test(navigator.userAgent) && !window.MSStream;
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

    this.isset = function(o,p){
      if (!arguments.length) return;
      var val = o;
      if (p) val = o[p];
      return 'undefined' !== typeof val;
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

    this.formatDuration = function(secs) {
        if ("undefined" === typeof secs) return;
        var date = new Date(0, 0, 0);
        date.setSeconds(Number(secs));
        var hour = (date.getHours() ? date.getHours() : ''),
            minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(),
            seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        return (hour + minutes + ':' + seconds);
    };  this.globalPoll = function (globs, callback) {
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
      }
      else{return "";}
    };
    
    this.hasClass = function(obj,c) {
        if (!obj || !c) return;
        for (var i = 0; i < obj.classList.length; i++) {
            if(obj.classList[i] === c) return true;
        }
        return false;
    };
  }

  window.Utils = new Utils();

}(window, document));