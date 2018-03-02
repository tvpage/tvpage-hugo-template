describe('Analytics', function() {
  var analytics;

    // analytics.initialize();
    // analytics.track('ci');

  // beforeEach(function(){
  //   analytics = new Analytics({
  //     domain: location.hostname
  //   });
  // });

  afterEach(function(){
    analytics = null;
  });

  it("should break if options are not met", function(){
    expect(function(){
      analytics = new Analytics();
    }).toThrow("bad global config");

    expect(function(){
      analytics = new Analytics(null, {});
    }).toThrow("bad loginId");

    expect(function(){
      analytics = new Analytics(null, {
        loginId: NaN
      });
    }).toThrow("bad loginId");
  });

  // it("should break if initialized without a global config", function(){
  //   analytics = new Analytics({
  //     domain: location.hostname
  //   });

  //   expect(function(){
  //     analytics.initialize();
  //   }).toThrow("can't build logUrl");
  // });

  // it('should add special config options', function(){
  //   analytics.initConfig({
  //     logUrl:"//test.tvpage.com/api/__tvpa.gif",
  //     domain:"localhost",
  //     firstPartyCookies:true,
  //     cookieDomain:"goodlookingbean.com",
  //     loginId:"1758799"
  //   });

  //   expect(analytics.config.logUrl).toBe("//test.tvpage.com/api/__tvpa.gif");
  //   expect(analytics.config.firstPartyCookieDomain).toBe("goodlookingbean.com");
  // });
});