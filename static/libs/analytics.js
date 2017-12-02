(function(){
  function isUndefined(o){
    return 'undefined' === typeof o;
  }
  
  function Analytics(options, globalConfig){
    this.options = options || {};
    this.config = globalConfig || {};

    if(isUndefined(this.options.domain)){
      throw new Error('need domain');
    }
  }

  Analytics.prototype.init = function(){
    var that = this;

    this.getLibGlobal(function(){
      var opts = that.options;

      if(opts.firstPartyCookies && opts.cookieDomain){
       opts.firstPartyCookieDomain = opts.cookieDomain;
      }

      var logUrl = "";

      if(opts.logUrl){
        logUrl = opts.logUrl;
      }else if(that.config.api_base_url){
        logUrl = that.config.api_base_url + '/__tvpa.gif';
      }

      if(!logUrl){
        throw new Error("can't build logUrl");
      }

      window._tvpa.push(['config',{
        li: opts.loginId,
        domain: opts.domain,
        logUrl: logUrl,
        firstPartyCookies: that.config.firstpartycookies,
        cookieDomain: that.config.cookiedomain
      }]);
    });
  };

  Analytics.prototype.getLibGlobal = function(cback){
    var that = this;
    var libCheckCount = 0;
    var libCheckLimit = 1000;

    (function libCheck(){
      setTimeout(function() {
        if(that.config.debug){
          console.log('_tvpa poll...');  
        }

        //lib is ready, lets push config
        if(!isUndefined(window._tvpa)){
          cback();
        }else if(++libCheckCount < libCheckLimit){
          libCheck()
        }
      },5);
    })();
  }

  Analytics.prototype.track = function(e, data){
    if(isUndefined(e)){
      if(this.config.debug){
        console.log('need event')  
      }
      
      return;
    }

    var that = this;
    var trackData = data || {
      li: that.config.loginId
    };

    this.getLibGlobal(function(){
      if(that.config.debug){
        console.log("_tvpa: ", typeof window._tvpa && _tvpa, " event: " + e + " and track data: ", trackData);
      }

      window._tvpa.push(e,data || {
        li: that.config.loginId
      })
    });
  };

  //todo
  //globalConfig.registerClass(Analytics);
  
  window.Analytics = Analytics;
}())