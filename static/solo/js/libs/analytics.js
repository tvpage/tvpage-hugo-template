;(function(root,doc) {

  function isset (o,p){
    return p ? o.hasOwnProperty(p) : "undefined" !== typeof o;
  };

  function Analytics(){
  }

  Analytics.prototype.initConfig = function(options) {
    if (!isset(options) || !isset(options.loginId) || !isset(options.domain) || !isset(options.logUrl)) {
      return console.warn('need config');
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

  Analytics.prototype.track = function(e, data) {
    if (!e || !data || !_tvpa) return console.log('no data');
    _tvpa.push(['track', e, data]);
  };

  root.Analytics = Analytics;

}(window, document));