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

  Analytics.prototype.onReady = function(){
    if(this.isReady)
      return;

    var onReady = this.options.onReady;

    if(Utils.isFunction(onReady)){
      onReady();
    }

    this.isReady = true;
  };

  Analytics.prototype.initialize = function(){
    var that = this;
    var configObj = {
      domain: this.options.domain,
      li: this.config.loginId,
      logUrl: this.logUrl
    };

    configObj = Utils.extend(configObj, this.getCookiesConfig());

    Utils.globalPoll(['_tvpa'], function(){
      _tvpa.push(['config', configObj]);

      if(!!that.options.ciTrack)
        that.track('ci');

      that.onReady();
    });
  };

  Analytics.prototype.track = function(e, data){
    if(!e){
      throw 'need event';
    }

    data = data || {
      li: this.config.loginId
    };

    var trackFn;
    var format = function(type, obj){
      if('pi' === type || 'pk' === type){
        return {
          pg: this.config.channelId,
          vd: obj.entityIdParent,
          ct: obj.id
        } 
      }
    }

    if(Array.isArray(data)){
      trackFn = function(){
        var length = data.length;
        var item;
        var i;

        for (i = 0; i < length; i++) {
          _tvpa.push(['track', e, format.call(this, data[i])]);
        }
      };
    }
    else if(Utils.isObject(data)){
      trackFn = function(){
        _tvpa.push(['track', e, format.call(this, data)]);
      }
    }
    else{
      throw "bad track data";
    }

    trackFn();
  };
  
  window.Analytics = Analytics;
}())