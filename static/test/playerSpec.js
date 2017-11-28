describe('Player', function() {
  var player;

  beforeEach(function(){
    fixture.setBase('test/fixtures');
    fixture.load('html/player.html', 'json/playerConfig.json', 'json/videos.json');
    
    this.config = fixture.json[0];
    this.videos = fixture.json[1];
  });

  afterEach(function(){
    player = null;
  });

  it('should break if no options or data was passed', function() {
    expect(function(){
      new Player()
    }).toThrow(new Error('need options'));

    var that = this;
    expect(function(){ 
      new Player(null,that.config)
    }).toThrow(new Error('need options'));
  });

  it('should break if no selector/element is passed', function() {
    var config = this.config;
    config.data = this.videos;

    expect(function(){
      new Player(null,config)
    }).toThrow(new Error('need el'));
  });

  it('should create instance element & properties', function() {
    var config = this.config;
    config.data = this.videos;

    player = new Player('player',config);
    
    expect(player.el.id).toEqual('player');
    expect(player.eventPrefix).toEqual('tvp_carousel_1');
  });

  it('should create instance properties', function() {
    var config = this.config;
    config.data = this.videos;

    player = new Player('player',config);
    player.initialize();
  });
});