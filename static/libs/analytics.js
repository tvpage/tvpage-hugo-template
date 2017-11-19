(function(){
  var isUndefined = function(o){
    return 'undefined' === typeof o;
  };
  
  function Analytics(){
    this.config = null;
  }
  
  Analytics.prototype.getConfigBase = function(options){
    var opts = options || {};
    return {
      logUrl: opts.logUrl || '',
      li: opts.loginId || '',
      gaDomain: opts.domain || ''
    };
  };
  
  Analytics.prototype.initConfig = function(options){
    var _tvpa = isUndefined(window._tvpa) ? [] : _tvpa;
  
    this.config = this.getConfigBase(options);

    if (options && options.firstPartyCookies && options.cookieDomain)
      this.config.firstPartyCookieDomain = options.cookieDomain;

    _tvpa.push(['config', this.config]);
  };
  
  Analytics.prototype.track = function(e, data){
    var _tvpa = isUndefined(window._tvpa) ? [] : _tvpa;

    if(!isUndefined(e) && !isUndefined(data)){
      _tvpa.push(['track', e, data]);
    }
  };
  
  window.Analytics = Analytics;
}())