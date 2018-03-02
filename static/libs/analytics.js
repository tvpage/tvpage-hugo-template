(function(){
  function Analytics(options, globalConfig){
    if(!globalConfig || !Utils.isObject(globalConfig))
      throw new Error('bad global config');

      

    var loginId = globalConfig.loginId;

    console.log(globalConfig, loginId)

    if(Utils.isUndefined(loginId) || Utils.isNaN(loginId))
      throw new Error('bad loginId');

    if(!options || Utils.isUndefined(options.domain))
      throw new Error('need domain');

    this.options = options;
    this.config = globalConfig;
  }

  Analytics.prototype.initialize = function(){
    var config = this.config;
    var options = this.options;

    // if(options.firstPartyCookies && options.cookieDomain)
    //   options.firstPartyCookieDomain = options.cookieDomain;

    var logUrl = "";

    if(options.logUrl){
      logUrl = options.logUrl;
    }else if(config.api_base_url){
      logUrl = config.api_base_url + '/__tvpa.gif';
    }

    if(!logUrl)
      throw "can't build logUrl";

    Utils.globalPoll(['_tvpa'], function(){
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