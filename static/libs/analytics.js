(function(){
  function Analytics(options, globalConfig){
    this.options = options || {};
    this.config = globalConfig || {};

    if(Utils.isUndefined(this.options.domain))
      throw new Error('need domain');
  }

  Analytics.prototype.initialize = function(){
    var that = this;

    Utils.globalPoll(['_tvpa'], function(){
      var opts = that.options;

      if(opts.firstPartyCookies && opts.cookieDomain)
       opts.firstPartyCookieDomain = opts.cookieDomain;

      var logUrl = "";

      if(opts.logUrl){
        logUrl = opts.logUrl;
      }else if(that.config.api_base_url){
        logUrl = that.config.api_base_url + '/__tvpa.gif';
      }

      if(!logUrl)
        throw new Error("can't build logUrl");

      _tvpa.push(['config',{
        li: opts.loginId,
        domain: opts.domain,
        logUrl: logUrl,
        firstPartyCookies: that.config.firstpartycookies,
        cookieDomain: that.config.cookiedomain
      }]);
    });
  };

  Analytics.prototype.track = function(e, data){
    var loginId = this.config.loginId;

    if(Utils.isUndefined(e) || Utils.isUndefined(loginId)){
      throw new Error("bad event or loginId", e);
    }

    Utils.globalPoll(['_tvpa'], function(){
      _tvpa.push(e, data || {
        li: loginId
      })
    });
  };
  
  window.Analytics = Analytics;
}())