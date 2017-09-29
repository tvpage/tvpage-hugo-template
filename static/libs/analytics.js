(function() {

  var hasKey = function(o,p){
    return o.hasOwnProperty(p);
  };

  var isUndefined = function(o){
    return 'undefined' === typeof o;
  };

  function Analytics(){
  }

  Analytics.prototype.initConfig = function(options) {
    if (isUndefined(options) || isUndefined(_tvpa) || !hasKey(options,'loginId') || !hasKey(options,'logUrl'))
      return;

    var config = {
      logUrl: options.logUrl,
      li: options.loginId,
      gaDomain: options.domain || '',
    };

    if (options.firstPartyCookies && options.cookieDomain)
      config.firstPartyCookieDomain = options.cookieDomain;

    _tvpa.push(['config', config]);
  };

  Analytics.prototype.track = function(e, data) {
    if(isUndefined(e) || isUndefined(data))
      return;
    
    _tvpa.push(['track', e, data]);
  };

  window.Analytics = Analytics;

}());