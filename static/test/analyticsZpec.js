describe('Analytics', function() {
  var analytics;

  beforeEach(function(){
    fixture.setBase('test/fixtures');
    fixture.load('json/globalConfig.json', 'json/products.json');

    this.globalConfig = fixture.json[0];
    this.products = fixture.json[1];
  });

  afterEach(function(){
    analytics = null;
  });

  it("should create an instance", function(){
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

  it("should initialize", function(){
    var globalConfig = this.globalConfig;
    var apiBaseUrl = globalConfig.api_base_url;
    
    delete globalConfig.api_base_url;

    expect(function(){
      analytics = new Analytics(null, globalConfig);
    }).toThrow();

    globalConfig.api_base_url = apiBaseUrl;

    expect(function(){
      analytics = new Analytics(null, globalConfig);
      analytics.initialize();
    }).not.toThrow();
  });

  it("should execute the ready callback option", function(){
    var check = false;
    
    analytics = new Analytics({
      onReady: function(){
        check = true;
      }
    }, this.globalConfig);

    analytics.initialize();

    waitsFor(function(){
      return analytics.isReady;
    });

    runs(function(){
      expect(check).toBe(true);
    });
  });

  it("should track ci", function(){
    var globalConfig = this.globalConfig;

    expect(function(){
      analytics = new Analytics({
        ciTrack: true
      }, globalConfig);

      analytics.initialize();
    }).not.toThrow();
  });

  it("shouldn't brake with bad track data", function(){
    analytics = new Analytics(null, this.globalConfig);
    analytics.initialize();

    waitsFor(function() {
      return analytics.isReady;
    }, "analytics shall be ready", 5000);

    runs(function() {
      expect(function(){
        analytics.track('pi', null);
      }).not.toThrow();
    });
  });
  
  it("should track pi events", function(){
    analytics = new Analytics(null, this.globalConfig);
    analytics.initialize();
    
    waitsFor(function() {
      return analytics.isReady;
    }, "analytics shall be ready", 5000);

    runs(function() {
      var products = this.products;

      expect(function(){
        analytics.track('pi', products);
      }).not.toThrow();
    });
  });
});