(function(){
  function isUndefined(o){
    return 'undefined' === typeof o;
  }
  
  function Analytics(){
    this.config = null;
  }

  Analytics.prototype.getGlobal = function(){
    return window._tvpa || [];
  };
  
  Analytics.prototype.getConfigBase = function(options){
    var opts = options || {};

    return {
      logUrl: opts.logUrl || '',
      li: opts.loginId || '',
      gaDomain: opts.domain || ''
    };
  };
  
  Analytics.prototype.initConfig = function(options){
    this.config = this.getConfigBase(options);

    if (options && options.firstPartyCookies && options.cookieDomain)
      this.config.firstPartyCookieDomain = options.cookieDomain;

    this.getGlobal().push(['config', this.config]);
  };
  
  Analytics.prototype.track = function(e, data){
    if('undefined' !== typeof e && 'undefined' !== typeof data){
      this.getGlobal().push(['track', e, data]);
    }
  };
  
  window.Analytics = Analytics;
}())