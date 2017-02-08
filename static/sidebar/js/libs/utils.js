;(function(root,doc) {

  function Utils() {

  	this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    this.isset = function(e,data){
      var val = o;
      if (p) val = o[p];
      return 'undefined' !== typeof val;
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
	};
    
  }

  root.Utils = new Utils();

}(window, document));