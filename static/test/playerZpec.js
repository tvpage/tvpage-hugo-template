describe('Player', function() {
  var analytics;

  beforeEach(function(){
    fixture.setBase('test/fixtures');
    fixture.load('json/globalConfig.json', 'json/videos.json', 'html/player.html');

    this.globalConfig = fixture.json[0];
    this.videos = fixture.json[1];
  });

  afterEach(function(){
    player = null;

    var dummyEl = document.getElementById('dummy-el');

    if(dummyEl && dummyEl.remove)
      dummyEl.remove();
  });

  it("should create an instance", function(){
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

    expect(function(){
      player = new Player({
        selector: 'dummy'
      }, {});
    }).toThrow("element not in dom");

    expect(function(){
      player = new Player({
        selector: document.createElement('div')
      }, {});
    }).toThrow('element not in dom');

    expect(function(){
      var div = document.createElement('div');

      div.id = 'dummy-el';

      document.body.appendChild(div);
      
      player = new Player({
        selector: div
      }, {});
    }).not.toThrow();
  });

  it("should initialize without data", function(){
    var globalConfig = this.globalConfig;
    var videos = this.videos;

    expect(function(){
      player = new Player({
        selector: 'player'
      }, globalConfig);
      player.initialize();
    }).not.toThrow();
  });

  it("should initialize with data", function(){
    var globalConfig = this.globalConfig;
    var videos = this.videos;

    expect(function(){
      player = new Player({
        selector: 'player',
        data: videos
      }, globalConfig);
      player.initialize();
    }).not.toThrow();
  });

  it("should allow passing data after initialization", function(){
    var globalConfig = this.globalConfig;
    var videos = this.videos;

    expect(function(){
      player = new Player({
        selector: 'player'
      }, globalConfig);

      player.initialize();

      player.addAssets(videos);
      player.startPlayer();
    }).not.toThrow();
  });

  it("should be ready after initialized with data", function(){
    player = new Player({
      selector: 'player',
      data: this.videos
    }, this.globalConfig);

    player.initialize();

    waitsFor(function() {
      return player.onReadyCalled;
    }, "player should be ready", 5000);

    runs(function() {
      expect(player.onReadyCalled).toBeTruthy();
    });
  });

  it("should play a video if autoplay is on", function(){
    player = new Player({
      selector: 'player',
      data: this.videos
    }, this.globalConfig);

    player.initialize();

    waitsFor(function() {
      return player.onReadyCalled && player.instance.getCurrentTime();
    }, "playback time should move forward", 5000);

    runs(function() {
      expect(player.instance.getCurrentTime()).toBeTruthy();
    });
  });

  it("should start a specific video if indicated", function(){
    var videos = this.videos;
    var randomVideoId = videos[Math.floor(Math.random() * videos.length)].id;

    player = new Player({
      startWith: randomVideoId,
      selector: 'player',
      data: videos
    }, this.globalConfig);

    player.initialize();

    waitsFor(function() {
      return player.onReadyCalled;
    }, "player should be ready", 5000);

    runs(function() {
      var playingVideo = videos[player.currentIndex];

      expect(playingVideo.id == randomVideoId).toBeTruthy();
      expect(player.instance).toBeTruthy();
    });
  });
});