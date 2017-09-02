;(function(window,document) {

  function Utils() {

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

    this.getByClass = function(c){
      return document.getElementsByClassName(c || '')[0];
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

    this.isset = function(o,p){
      if (!arguments.length) return;
      var val = o;
      if (p) val = o[p];
      return 'undefined' !== typeof val;
    };

    this.sendPost = function(evtPrefix ,evt, message){
        setTimeout(function(){
            if ( window.parent ) {
                message = message || {};
                message.event = evtPrefix + evt;
                window.parent.postMessage(message, '*');
            }
        },0);    
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
    
  }

  window.Utils = new Utils();

}(window, document));