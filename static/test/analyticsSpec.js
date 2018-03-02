describe('Analytics', function() {
  var analytics;

  beforeEach(function(){
    fixture.setBase('test/fixtures');
    fixture.load('json/globalConfig.json');

    this.globalConfig = fixture.json[0];
  });

  afterEach(function(){
    analytics = null;
  });

  it("should construct an instance", function(){
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

    expect(function(){
      analytics = new Analytics(null, {
        loginId: null
      });
    }).toThrow("bad loginId");

    expect(function(){
      analytics = new Analytics(null, {
        loginId: 'null'
      });
    }).toThrow("bad loginId");
  });

  it("should should initialize", function(){
    var globalConfig = this.globalConfig;

    expect(function(){
      analytics = new Analytics(null, globalConfig);
      analytics.initialize();
    }).not.toThrow();
  });

  it("should track ci", function(){
    var globalConfig = this.globalConfig;

    expect(function(){
      analytics = new Analytics(null, globalConfig);
      analytics.track('ci');
    }).not.toThrow();
  });
});