describe('Analytics', function() {
  var analytics;

  beforeEach(function(){
    analytics = new Analytics();
  });

  afterEach(function(){
    analytics = null;
  });

  it('should create a config object', function(){
    analytics.initConfig();

    expect(analytics.config).toBeDefined();
  });

  it('should add special config options', function(){
    analytics.initConfig({
      logUrl:"//test.tvpage.com/api/__tvpa.gif",
      domain:"localhost",
      firstPartyCookies:true,
      cookieDomain:"goodlookingbean.com",
      loginId:"1758799"
    });

    expect(analytics.config.logUrl).toBe("//test.tvpage.com/api/__tvpa.gif");
    expect(analytics.config.firstPartyCookieDomain).toBe("goodlookingbean.com");
  });
});