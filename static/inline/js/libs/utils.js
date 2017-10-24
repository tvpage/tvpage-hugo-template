;(function(window,document) {

  function Utils() {

    this.addEvent = function(element, event, arr, func) {
      element.removeEventListener(event, clickHandler, false);
      element.addEventListener(event, clickHandler, false);
      function clickHandler(e){
        var that = this;
        var type;
        var checkEl = function (el) {
          if (el && el !== that) {
            for (var i = 0; i < arr.length; i++) {
              if (el.classList.contains(arr[i])) {
                type = arr[i]
                return el;
              }
            }
            return checkEl(el.parentNode);
          }
          return false;
        }
        var el = checkEl(e.target);
        if (el !== false) {
          func.call(this, type, el, e);
        }
      }
    };

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

    this.loadProducts = function(videoId, loginId, fn) {
        if (!videoId) return;
        var src = '//api.tvpage.com/v1/videos/' + videoId + '/products?X-login-id=' + loginId;
        var cbName = 'tvp_' + Math.floor(Math.random() * 555);
        src += '&callback=' + cbName;
        var script = document.createElement('script');
        script.src = src;
        window[cbName || 'callback'] = function(data) {
            if (data && data.length && 'function' === typeof fn) {
                fn(data);
            } else {
                fn([]);
            }
        };
        document.body.appendChild(script);
    };
  }

  window.Utils = new Utils();

}(window, document));