describe('Carousel', function() {
  var carousel;

  beforeEach(function(){
    fixture.setBase('test/fixtures');
    fixture.load('json/globalConfig.json', 'json/videos.json', 'html/carousel.html');

    this.globalConfig = fixture.json[0];
    this.videos = fixture.json[1];
  });

  afterEach(function(){
    carousel = null;
  });

  it("should create an instance", function(){
    expect(function(){
      carousel = new Carousel();
    }).toThrow("bad global config");

    expect(function(){
      carousel = new Carousel(null, {});
    }).toThrow("need selector");

    expect(function(){
      carousel = new Carousel({
        selector: null
      }, {});
    }).toThrow("need selector");

    expect(function(){
      carousel = new Carousel({
        selector: 'dummy'
      }, {});
    }).toThrow("element not in dom");

    expect(function(){
      carousel = new Carousel({
        selector: document.createElement('div')
      }, {});
    }).toThrow('element not in dom');

    expect(function(){
      var div = document.createElement('div');

      div.id = 'dummy-el';

      document.body.appendChild(div);
      
      carousel = new Carousel({
        selector: div
      }, {});
    }).not.toThrow();
  });

  it("should initialize without data", function(){
    var globalConfig = this.globalConfig;
    var videos = this.videos;

    expect(function(){
      carousel = new Carousel({
        selector: 'carousel'
      }, globalConfig);
      carousel.initialize();
    }).not.toThrow();
  });

  it("should initialize with data", function(){
    var globalConfig = this.globalConfig;
    var videos = this.videos;

    expect(function(){
      carousel = new Carousel({
        selector: 'carousel',
        data: videos
      }, globalConfig);
      carousel.initialize();
    }).not.toThrow();
  });
});