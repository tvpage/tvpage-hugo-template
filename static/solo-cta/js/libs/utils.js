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
    
  }

  window.Utils = new Utils();

}(window, document));