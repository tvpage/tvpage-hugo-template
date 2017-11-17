/*==============================================================================*/
/* Nightwatch Recorder generated Mon Oct 23 2017 18:49:04 GMT-0700 (PDT) */
/*==============================================================================*/
var DATA = {
      URL: "https://www.goodlookingbean.com/test/carousel/",
      PRODUCT_URL: "http://www.keurig.com/Brewers/Home/Keurig%C2%AE-K475-Coffee-Maker/p/K475-Coffee-Maker?text=k400",
      PRODUCT_SECURE_URL: "https://www.keurig.com/Brewers/Home/Keurig%C2%AE-K475-Coffee-Maker/p/K475-Coffee-Maker?text=k400",
      PRODUCT_IMG: "https://app.tvpage.com/api/spotImage/1758799/479/458/6295232216827.png",
      PRODUCT_HEADLINE: "Related Products",
      PRODUCT_TITLE_REGEX: /Keurig®\ K475\ Coffee\ Maker/i,
      FIRST_VIDEO_TITLE: "Galette des Rois Recipe for De'Longhi MultiFry",
      SLA: 20000,
      BROWSERHEIGHT: 1080,
      BROWSEWIDTH: 1920,
      PRODUCTID: 83102883,
      isFF: true
    };

var widget = require(__dirname + "/../../../../lib/tvpGUITest.js");

module.exports = {
  widgetHolder: "div#carousel-1-holder",
  widgetIFrameHolder: "div#tvp-modal-iframe-holder-carousel-1",
  widgetIframeId: 'div#carousel-1',
  widgetTitleId: "div.tvp-carousel-title",
  modalId: "div#tvp-modal-carousel-1",
  modalCloseId: "div#tvp-modal-close-carousel-1",
  modalOverlay: "div#tvp-modal-overlay-carousel-1",
  playerHolder: "div.tvp-player-holder",
  productHolder: "div.tvp-products-holder",
  firstVideoId: 'div[data-slick-index="0"]',

  'carousel-youtube-sanity': function (browser) {
    var carousel = widget.tvpGUITest({
          'modalOverlay': this.modalOverlay,
          'modalCloseId': this.modalCloseId,
          'DATA': DATA
        }),
        parent = this.widgetIframeId + " > " + this.productHolder;
        client = carousel.init(browser, "Carousel Widget Normal", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.productHolder);

    carousel.widgetTitle(this.widgetIframeId, this.widgetTitleId, "Recommended Videos"),
    carousel.widgetNav(this.widgetIframeId, 16, true),
    carousel.modalSanity(this.modalId, this.firstVideoId, true),
    carousel.modalLoadPerformance(this.widgetIFrameHolder, this.firstVideoId, this.widgetIframeId + " > " + this.playerHolder, 2, true),
    carousel.productModal(true),
    carousel.productModalLink(true),
    carousel.end();
  },

  'carousel-youtube-player': function (browser) {
    var carousel = widget.tvpGUITest({
          'modalOverlay': this.modalOverlay,
          'modalCloseId': this.modalCloseId,
          'DATA': DATA
        }),
        client = carousel.init(browser, "Carousel Youtube Player Normal", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    carousel.playerSanity(),
    // carousel.playerSkip(50),
    // carousel.playerSkip(150),
    // carousel.playerSkip(260),
    carousel.pause(10),

    // check for video finish playing and check for new video is playing
    // carousel.playerCheckPlaying(true),
    carousel.modalClose(this.modalId), // testing close modal

    // // Move to carousel iframe
    // carousel.iframe(0),

    // carousel.modalLoad(this.firstVideoId, 160, 100),
    // carousel.playerLoadPerformance(2),
    // carousel.playerSanity(),
    carousel.end();
  },

  // 'caousel-youtube-player-fullscreen': function (browser) {
  //   var carousel = widget.tvpGUITest({
  //         'modalOverlay': this.modalOverlay,
  //         'modalCloseId': this.modalCloseId,
  //         'DATA': DATA
  //       }),
  //       client = carousel.init(browser, "Carousel Youtube Player Fullscreen", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

  //   carousel.modalLoad('div[data-slick-index="2"]', 160, 100),
  //   carousel.playerLoadPerformance(2),
  //   carousel.playerStart(),
  //   carousel.playerCheckFullScreen(),
  //   carousel.playerSkip(250),
  //   carousel.playerSkip(750),
  //   carousel.playerSkip(1030),
  //   carousel.pause(10),

  //   // checking for next loaded video sanity
  //   carousel.playerCheckPlaying(true),
  //   carousel.pause(2),

  //   // Starting secound video
  //   carousel.playerStart();
  //   carousel.end();
  // },

  'carousel-youtube-resize': function (browser) {
    var carousel = widget.tvpGUITest({
          'modalOverlay': this.modalOverlay,
          'modalCloseId': this.modalCloseId,
          'DATA': DATA
        }),
        client = carousel.init(browser, "Carousel Youtube Player Normal", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

    carousel.modalLoad(this.firstVideoId, 160, 100),
    client.resizeWindow(1440/2, 1200),
    client.frameParent(),
    client
      .waitForElementVisible(this.modalId, 5000),
    client.expect.element(this.modalId).to.have.css('width', 700),
    client.frame(2)
    client.resizeWindow(1440/3, 1200),
    client.frameParent(),
    client
      .waitForElementVisible(this.modalId, 5000),
    client.expect.element(this.modalId).to.have.css('width', 480);
    carousel.end();
  }
};
