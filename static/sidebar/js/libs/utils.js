;(function(window,document) {

  function Utils() {

    this.getByClass = function(c){
      return document.getElementsByClassName(c || '')[0];
    };

    this.isset = function(o,p){
      if (!arguments.length) return;
      var val = o;
      if (p) val = o[p];
      return 'undefined' !== typeof val;
    };

    this.debounce = function(func,wait,immediate){
      var timeout;  
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

    this.trimTitle = function(data,limit){
      return data = data.length > limit ? data.substring(0, limit) + "..." : data;
    };

    this.trimPrice = function(price){
      (typeof price !== "undefined" && price !== null) ? price:""; 
      price = price.toString().replace(/[^0-9.]+/g, '');
      price = parseFloat(price).toFixed(2);
      price = price > 0 ? ('$' + price):'';
      return price;
    };

    this.tmpl = function(template, data) {
      var that = this;
      data.title = that.trimTitle(data.title,52); 
      if (template && 'object' == typeof data) {
        return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
          var keys = key.split("."),
            v = data[keys.shift()];
          for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
          return (typeof v !== "undefined" && v !== null) ? v : "";
        });
      }
    };
    
  }

  window.Utils = new Utils();

}(window, document));