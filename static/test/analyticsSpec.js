describe('Analytics', function() {
  var analytics;
  var _tvpaBackup = window._tvpa;

  beforeEach(function(){
    analytics = new Analytics();
  });

  afterEach(function(){
    analytics = null;
  });

  it('should break if the global _tvpa doesn\'t exists', function(){
    window._tvpa = null;

    expect(analytics.initConfig).toThrow(new Error('need _tvpa'));
  });
});