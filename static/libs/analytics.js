(function(){
  function Analytics(options, globalConfig){
    this.options = options || {};
    this.config = globalConfig || {};

    if(Utils.isUndefined(this.options.domain))
      throw new Error('need domain');
  }

  Analytics.prototype.initialize = function(){
    var config = this.config;
    var options = this.options;

    Utils.globalPoll(['_tvpa'], function(){

      if(options.firstPartyCookies && options.cookieDomain)
       options.firstPartyCookieDomain = options.cookieDomain;

      var logUrl = "";

      if(options.logUrl){
        logUrl = options.logUrl;
      }else if(config.api_base_url){
        logUrl = config.api_base_url + '/__tvpa.gif';
      }

      if(!logUrl)
        throw new Error("can't build logUrl");

      _tvpa.push(['config',{
        li: config.loginId,
        domain: options.domain,
        logUrl: logUrl,
        firstPartyCookies: config.firstpartycookies,
        cookieDomain: config.cookiedomain
      }]);
    });
  };

  Analytics.prototype.track = function(e, data){
    var loginId = this.config.loginId;

    if(Utils.isUndefined(e) || Utils.isUndefined(loginId)){
      throw new Error("bad event or loginId", e);
    }

    Utils.globalPoll(['_tvpa'], function(){
      _tvpa.push(['track', e, data || {
        li: loginId
      }]);
    });
  };
  
  window.Analytics = Analytics;
}())