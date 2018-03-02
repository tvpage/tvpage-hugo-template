(function(){

  function Analytics(options, globalConfig){
    if(!globalConfig || !Utils.isObject(globalConfig))
      throw new Error('bad global config');

    var loginId = globalConfig.loginId;
    
    if(!loginId || isNaN(Number(loginId)))
      throw new Error('bad loginId');

    var apiBaseUrl = globalConfig.api_base_url;
    var logUrl = options && options.logUrl ? options.logUrl : 
    apiBaseUrl ? apiBaseUrl + '/__tvpa.gif' : null;

    if(!logUrl){
     throw "can't build url"; 
    }

    this.options = options || {};
    this.config = globalConfig;
    this.logUrl = logUrl;
  }

  Analytics.prototype.getCookiesConfig = function(){
    var firstPartyCookies = !!this.config.firstPartyCookies;

    if(firstPartyCookies){
      var cookieDomain = this.config.cookieDomain;

      if(Utils.hasDot(cookieDomain)){
        return {
          firstPartyCookies: firstPartyCookies,
          cookieDomain: cookieDomain
        };
      }else{
        throw 'bad cookie domain';
      }
    }else{
      return {};
    }
  };

  Analytics.prototype.initialize = function(){
    var configObj = {
      domain: this.options.domain,
      li: this.config.loginId,
      logUrl: this.logUrl
    };

    configObj = Utils.addProps(configObj, this.getCookiesConfig());

    Utils.globalPoll(['_tvpa'], function(){
      _tvpa.push(['config', configObj]);
    });
  };

  Analytics.prototype.track = function(e, data){
    var obj = data || {
      li: this.config.loginId
    };

    if(Utils.isUndefined(e) || !Utils.isObject(obj)){
      throw "bad args";
    }

    Utils.globalPoll(['_tvpa'], function(){
      _tvpa.push(['track', e, data]);
    });
  };
  
  window.Analytics = Analytics;
}())