;(function(root,doc) {

  var isset = function(o,p){
    var val = o;
    if (p) val = o[p];
    return 'undefined' !== typeof val;
  };

  function Analytics() {

    this.initConfig = function(options){
      if (!isset(options) || !isset(options.loginId) || !isset(options.domain) || !isset(options.logUrl)) {
        return;
      }
      
      var config = {
        logUrl: options.logUrl,
        li: options.loginId,
        gaDomain: options.domain,
      };

      if (options.firstPartyCookies)
        config.firstPartyCookieDomain = options.cookieDomain;

      _tvpa.push(['config', config]);
    };

    this.track = function(e,data){
      if (!e || !data || typeof _tvpa === "undefined") return;
      _tvpa.push(['track', e, data]);
    };
    
  }

  root.Analytics = Analytics;

}(window, document));