describe('Player', function() {
  var analytics;

  beforeEach(function(){
    fixture.setBase('test/fixtures');
    fixture.load('json/globalConfig.json', 'html/player.html');

  //   fixture.load('html/player.html', 'json/playerConfig.json', 'json/videos.json');

    this.globalConfig = fixture.json[0];
  });

  afterEach(function(){
    player = null;
  });

  it("should construct an instance", function(){
    expect(function(){
      player = new Player();
    }).toThrow("bad global config");

    expect(function(){
      player = new Player(null, {});
    }).toThrow("need selector");

    expect(function(){
      player = new Player({
        selector: null
      }, {});
    }).toThrow("need selector");

    //passing just an element that doesn't exist in the page shall throw
    expect(function(){
      player = new Player({
        selector: document.createElement('div')
      }, {});
    }).toThrow('element not in dom');
  });

  // it("should should initialize", function(){
  //   var globalConfig = this.globalConfig;

  //   expect(function(){
  //     analytics = new Player(null, globalConfig);
  //     analytics.initialize();
  //   }).not.toThrow();
  // });

  // it("should track ci", function(){
  //   var globalConfig = this.globalConfig;

  //   expect(function(){
  //     analytics = new Analytics(null, globalConfig);
  //     analytics.track('ci');
  //   }).not.toThrow();
  // });
});

// describe('Player', function() {
  // var player;

  // beforeEach(function(){
  //   fixture.setBase('test/fixtures');
  //   fixture.load('html/player.html', 'json/playerConfig.json', 'json/videos.json');
    
  //   this.config = fixture.json[0];
  //   this.videos = fixture.json[1];
  // });

  // afterEach(function(){
  //   player = null;
  // });

  // it('should break if no options or data was passed', function() {
  //   expect(function(){
  //     new Player()
  //   }).toThrow(new Error('need options'));

  //   var that = this;
  //   expect(function(){ 
  //     new Player(null,that.config)
  //   }).toThrow(new Error('need options'));
  // });

  // it('should break if no selector/element is passed', function() {
  //   var config = this.config;
  //   config.data = this.videos;

  //   expect(function(){
  //     new Player(null,config)
  //   }).toThrow(new Error('need el'));
  // });

  // it('should create instance element & properties', function() {
  //   var config = this.config;
  //   config.data = this.videos;

  //   player = new Player('player',config);
    
  //   expect(player.el.id).toEqual('player');
  //   expect(player.eventPrefix).toEqual('tvp_carousel_1');
  // });

  // it('should create instance properties', function() {
  //   var config = this.config;
  //   config.data = this.videos;

  //   player = new Player('player',config);
  //   player.initialize();
  // });
// });