/*==============================================================================*/
/* Nightwatch Recorder generated Mon Oct 23 2017 18:49:04 GMT-0700 (PDT) */
/*==============================================================================*/
var DATA = {
      URL: "https://www.goodlookingbean.com/test/carousel/",
      PRODUCT_URL: "http://www.ninjakitchen.com/products/0/all/67/ninja-coffee-bar-with-glass-carafe/",
      PRODUCT_SECURE_URL: "https://m.ninjakitchen.com/products/0/all/67/ninja-coffee-bar-with-glass-carafe/",
      PRODUCT_IMG: "http://www.ninjakitchen.com/include/images/products/hero-CF080.jpg",
      PRODUCT_HEADLINE: "Related Products",
      PRODUCT_TITLE_REGEX: /Ninja\ Coffee\ Bar®\ with\ Glass\ Carafe/i,
      FIRST_VIDEO_TITLE: "Galette des Rois Recipe for De'Longhi MultiFry",
      SLA: 10000
    };

var widget = require(__dirname + "/../../../lib/tvpGUITest.js");

module.exports = {
  widgetHolder: "div#carousel-1-holder",
  widgetIFrameHolder: "div#tvp-modal-iframe-holder-carousel-1",
  widgetIframeId: 'div#carousel-1',
  widgetTitleId: "div.tvp-carousel-title",
  modalId: "div#tvp-modal-carousel-1",
  modalCloseId: "div#tvp-modal-close-carousel-1",
  modalOverlay: "div#tvp-modal-overlay-carousel-1",
  playerHolder: "div.tvp-player-holder",
  productHolder: "div.tvp-products",
  firstVideoId: 'div[data-slick-index="0"]',

  'carousel-youtube-sanity': function (browser) {
    var carousel = widget.tvpGUITest({
          'isMobile': true,
          'modalOverlay': this.modalOverlay,
          'modalCloseId': this.modalCloseId,
          'orientation': "PORTRAIT",
          'DATA': DATA
        }),
        parent = this.widgetIframeId + " > " + this.productHolder,
        client = carousel.init(browser, "Carousel Youtube Sanity", "div#carousel-1-holder", 0, parent);

    carousel.widgetTitle(this.widgetIframeId, this.widgetTitleId, "Recommended Videos"),
    //carousel.widgetNav(this.widgetIframeId, 16),
    carousel.modalSanity(this.modalId, this.firstVideoId),
    carousel.modalLoadPerformance(this.widgetIFrameHolder, this.firstVideoId, this.widgetIframeId + " > " + this.playerHolder, 2),
    carousel.productModal(),
    carousel.productModalLink(),

    client.end();
  },

  'carousel-youtube-player': function (browser) {
    var carousel = widget.tvpGUITest({
          'isMobile': true,
          'modalOverlay': this.modalOverlay,
          'modalCloseId': this.modalCloseId,
          'orientation': "PORTRAIT",
          'DATA': DATA
        }),
        parent = this.widgetIframeId + " > " + this.playerHolder,
        client = carousel.init(browser, "Carousel Youtube Player Normal", "div#carousel-1-holder", 0, parent);

    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    carousel.playerSanity(),
    carousel.playerSkip(100),
    carousel.playerSkip(200),
    carousel.playerSkip(300),
    carousel.pause(10),

    // check for video finish playing and check for new video is playing
    carousel.playerCheckPlaying(true),
    carousel.modalClose(this.modalId), // testing close modal

    // Move to carousel iframe
    carousel.iframe(0),

    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    carousel.playerSanity(),
    carousel.end();
  },

  'caousel-youtube-player-fullscreen': function (browser) {
    var carousel = widget.tvpGUITest({
          'isMobile': true,
          'modalOverlay': this.modalOverlay,
          'modalCloseId': this.modalCloseId,
          'orientation': "PORTRAIT",
          'DATA': DATA
        }),
        parent = this.widgetIframeId + " > " + this.playerHolder,
        client = carousel.init(browser, "Carousel Youtube Player Full Screen", "div#carousel-1-holder", 0, parent);

    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    carousel.playerStart(),
    carousel.playerCheckFullScreen(),
//    carousel.playerTime(),
//    carousel.playerSkip(100),
//    carousel.playerSkip(200),
//    carousel.playerSkip(355),
//    carousel.pause(5),

    // checking for next loaded video sanity
    //carousel.playerCheckPlaying(true),
    carousel.pause(2),

    // Starting secound video
    //carousel.playerStart();
    carousel.end();
  },
  
  'carousel-youtube-player-landscape': function (browser) {
    var carousel = widget.tvpGUITest({
          'isMobile': true,
          'modalOverlay': this.modalOverlay,
          'modalCloseId': this.modalCloseId,
          'orientation': 'LANDSCAPE',
          'DATA': DATA
        }),
        client = carousel.init(browser, "Carousel Youtube Player Normal", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

    carousel.pause(),
    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    carousel.playerSanity(),
    carousel.playerSkip(150),
    carousel.playerSkip(230),
    carousel.playerSkip(260),
    carousel.pause(10),

    // check for video finish playing and check for new video is playing
    carousel.playerCheckPlaying(true),
    carousel.modalClose(this.modalId), // testing close modal

    // Move to carousel iframe
    carousel.iframe(0),

    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    carousel.playerSanity(),
    carousel.end();
  },

  'caousel-youtube-player-fullscreen-landscape': function (browser) {
    var carousel = widget.tvpGUITest({
          'isMobile': true,
          'modalOverlay': this.modalOverlay,
          'modalCloseId': this.modalCloseId,
          'orientation': 'LANDSCAPE',
          'DATA': DATA
        }),
        client = carousel.init(browser, "Carousel Youtube Player Full Screen", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

    carousel.pause(),
    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    carousel.playerStart(),
    //carousel.playerSkip(100),
    //carousel.playerSkip(200),
    ////carousel.playerSkip(355),
    //carousel.pause(5),

    // checking for next loaded video sanity
    //carousel.playerCheckPlaying(true),
    carousel.pause(2),

    // Starting secound video
//    carousel.playerStart();
    carousel.end();
  },

  'carousel-youtube-portrait-landscape-play-portrait': function (browser) {
    var carousel = widget.tvpGUITest({
          'isMobile': true,
          'modalOverlay': this.modalOverlay,
          'modalCloseId': this.modalCloseId,
          'orientation': "PORTRAIT",
          'DATA': DATA
        }),
        client = carousel.init(browser, "Carousel Youtube Player Rotation Test #1", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

    client.setOrientation('LANDSCAPE'),
    carousel.pause(3),
    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    carousel.playerStart(),
    carousel.pause(5),
    client.setOrientation('PORTRAIT'),
    carousel.pause(5),
    carousel.end();
  },

  'carousel-youtube-portrait-play-landscape-portrait': function (browser) {
    var carousel = widget.tvpGUITest({
          'isMobile': true,
          'modalOverlay': this.modalOverlay,
          'modalCloseId': this.modalCloseId,
          'orientation': "PORTRAIT",
          'DATA': DATA
        }),
        client = carousel.init(browser, "Carousel Youtube Player Rotation Test #2", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    carousel.playerStart(),
    carousel.pause(5),
    client.setOrientation('LANDSCAPE'),
    carousel.pause(5),
    client.setOrientation('PORTRAIT'),
    carousel.pause(5),
    carousel.end();
  },

  'carousel-youtube-landscape-portrait-play-landscape': function (browser) {
    var carousel = widget.tvpGUITest({
          'isMobile': true,
          'modalOverlay': this.modalOverlay,
          'modalCloseId': this.modalCloseId,
          'orientation': "LANDSCAPE",
          'DATA': DATA
        }),
        client = carousel.init(browser, "Carousel Youtube Player Rotation Test #3", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

    carousel.pause(2),
    client.setOrientation('PORTRAIT'),
    carousel.pause(2),
    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    carousel.playerStart(),
    carousel.pause(5),
    client.setOrientation('LANDSCAPE'),
    carousel.pause(5),
    carousel.end();
  },

  'carousel-youtube-landscape-play-portrait-landscape': function (browser) {
    var carousel = widget.tvpGUITest({
          'isMobile': true,
          'modalOverlay': this.modalOverlay,
          'modalCloseId': this.modalCloseId,
          'orientation': "LANDSCAPE",
          'DATA': DATA
        }),
        client = carousel.init(browser, "Carousel Youtube Player Rotation Test #4", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    carousel.playerStart(),
    carousel.pause(5),
    client.setOrientation('PORTRAIT'),
    carousel.pause(5),
    client.setOrientation('LANDSCAPE'),
    carousel.pause(5),
    carousel.end();
  },

  'carousel-youtube-portrait-play-fullscreen-landscape-portrait': function (browser) {
    var carousel = widget.tvpGUITest({
          'isMobile': true,
          'modalOverlay': this.modalOverlay,
          'modalCloseId': this.modalCloseId,
          'orientation': "PORTRAIT",
          'DATA': DATA
        }),
        client = carousel.init(browser, "Carousel Youtube Player Rotation Test #5", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    carousel.playerStart(),
    carousel.pause(5),
    carousel.playerCheckFullScreen(),
    carousel.pause(5)
    client.setOrientation('LANDSCAPE'),
    carousel.pause(5),
    client.setOrientation('PORTRAIT'),
    carousel.pause(5),
    carousel.playerCheckFullScreen(),
    carousel.pause(5),
    carousel.end();
  },

  'carousel-youtube-landscape-play-fullscreen-portrait': function (browser) {
    var carousel = widget.tvpGUITest({
        'isMobile': true,
        'modalOverlay': this.modalOverlay,
        'modalCloseId': this.modalCloseId,
        'orientation': "LANDSCAPE",
        'DATA': DATA
      }),
      client = carousel.init(browser, "Carousel Youtube Player Rotation Test #6", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    carousel.playerStart(),
    carousel.pause(5),
    carousel.playerCheckFullScreen(),
    carousel.pause(5)
    client.setOrientation('PORTRAIT'),
    carousel.pause(5),
    carousel.playerCheckFullScreen(),
    carousel.pause(5),
    carousel.end();
  },

  'carousel-youtube-portrait-landscape-play-fullscreen-portrait-landscape': function (browser) {
    var carousel = widget.tvpGUITest({
        'isMobile': true,
        'modalOverlay': this.modalOverlay,
        'modalCloseId': this.modalCloseId,
        'orientation': "PORTRAIT",
        'DATA': DATA
      }),
      client = carousel.init(browser, "Carousel Youtube Player Rotation Test #6", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    client.setOrientation("LANDSCAPE"),
    carousel.pause(2)
    carousel.playerStart(),
    carousel.pause(2),
    carousel.playerCheckFullScreen(),
    carousel.pause(2)
    client.setOrientation('PORTRAIT'),
    carousel.pause(5),
    client.setOrientation("LANDSCAPE"),
    carousel.pause(5)
    carousel.playerCheckFullScreen(),
    carousel.pause(5),
    carousel.end();
  },

  'carousel-youtube-landscape-portrait-play-fullscreen-landscape': function (browser) {
    var carousel = widget.tvpGUITest({
        'isMobile': true,
        'modalOverlay': this.modalOverlay,
        'modalCloseId': this.modalCloseId,
        'orientation': "LANDSCAPE",
        'DATA': DATA
      }),
      client = carousel.init(browser, "Carousel Youtube Player Rotation Test #7", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    client.setOrientation("PORTRAIT"),
    carousel.pause(2)
    carousel.playerStart(),
    carousel.pause(2),
    carousel.playerCheckFullScreen(),
    carousel.pause(2)
    client.setOrientation('LANDSCAPE'),
    carousel.pause(5),
    carousel.playerCheckFullScreen(),
    carousel.pause(5),
    carousel.end();
  },

  'carousel-youtube-landscape-portrait-play-fullscreen-landscape-portrait': function (browser) {
    var carousel = widget.tvpGUITest({
        'isMobile': true,
        'modalOverlay': this.modalOverlay,
        'modalCloseId': this.modalCloseId,
        'orientation': "LANDSCAPE",
        'DATA': DATA
      }),
      client = carousel.init(browser, "Carousel Youtube Player Rotation Test #8", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    client.setOrientation("PORTRAIT"),
    carousel.pause(2)
    carousel.playerStart(),
    carousel.pause(2),
    carousel.playerCheckFullScreen(),
    carousel.pause(2)
    client.setOrientation('LANDSCAPE'),
    carousel.pause(5),
    client.setOrientation("PORTRAIT"),
    carousel.pause(5)
    carousel.playerCheckFullScreen(),
    carousel.pause(5),
    carousel.end();
  }
};
