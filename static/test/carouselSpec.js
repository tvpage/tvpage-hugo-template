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

  it("should initialize with data", function(){
    var globalConfig = this.globalConfig;
    
    carousel = new Carousel({
      selector: 'carousel',
      data: null
    }, globalConfig);

    expect(function(){  
      carousel.initialize();
    }).toThrow("need url to load data");

    expect(function(){
      carousel = new Carousel({
        selector: 'carousel',
        data: '{}'
      }, globalConfig);
      
      carousel.initialize();
    }).toThrow("need url to load data");

    carousel = new Carousel({
      selector: 'carousel',
      data: this.videos,
      templates: '{}'
    }, globalConfig);
    
    expect(function(){
      carousel.initialize();
    }).toThrow("need templates");

    carousel = new Carousel({
      selector: 'carousel',
      data: this.videos,
      templates: {}
    }, globalConfig);
    
    expect(function(){
      carousel.initialize();
    }).toThrow("need templates");

    carousel = new Carousel({
      selector: 'carousel',
      data: this.videos,
      templates: {
        slide: ""
      }
    }, globalConfig);
    
    expect(function(){
      carousel.initialize();
    }).toThrow("need templates");

    carousel = new Carousel({
      selector: 'carousel',
      data: this.videos,
      templates: {
        slide: "<div>{title}</div>"
      },
      
      //same as slick here
      options: {

      }
    }, globalConfig);
    
    //window.$ = null;

    //expect(function(){
      carousel.initialize();
    //}).toThrow("need jQuery");

    // carousel = new Carousel({
    //   selector: 'carousel',
    //   data: this.videos,
    //   templates: {
    //     slide: "<div>{title}</div>"
    //   }
    // }, globalConfig);
    
   //expect(function(){
      //carousel.initialize();
    //}).toThrow("need jQuery");
  });

  xit("should initialize without data", function(){
    var globalConfig = this.globalConfig;
    
    carousel = new Carousel({
      selector: 'carousel',
      loadUrl: ''
    }, globalConfig);

    expect(function(){
      carousel.initialize();
    }).toThrow("need url to load data");
    
    carousel = new Carousel({
      selector: 'carousel',
      templates: {
        slide: "<div>{title}</div>"
      },
      loadUrl: globalConfig.api_base_url + '/channels/' + globalConfig.channelId + '/videos'
    }, globalConfig);

    expect(function(){
      carousel.initialize();
    }).not.toThrow();
  });

  xit("should load data", function(){
    var globalConfig = this.globalConfig;
    var check = false;
    
    carousel = new Carousel({
      loadUrl: globalConfig.api_base_url + '/channels/' + globalConfig.channelId + '/videos',
      selector: 'carousel',
      templates: {
        slide: "<div>{title}</div>"
      },
      onLoad: function(){
        check = true;
      }
    }, globalConfig);

    carousel.initialize();

    waitsFor(function(){
      return check;
    });

    runs(function(){
     expect(Array.isArray(carousel.slidesData)).toBeTruthy();
    });
  });
});