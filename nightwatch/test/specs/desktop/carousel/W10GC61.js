  /*==============================================================================*/
/* Nightwatch Recorder generated Mon Oct 23 2017 18:49:04 GMT-0700 (PDT) */
/*==============================================================================*/
var DATA = {
      URL: "https://widgets.goodlookingbean.com/test/carousel/",
      PRODUCT_HEADLINE: "Related Products",
      FIRST_VIDEO_TITLE: "Galette des Rois Recipe for De'Long...",
      SLA: 10000,
      BROWSERHEIGHT: 1080,
      BROWSEWIDTH: 1920,
      LOGIN_ID: 1758799
    };

var widget = require(__dirname + "/../../../../lib/tvpGUITest.js");

module.exports = {
  widgetHolder: "div#carousel-2-holder",
  widgetIFrameHolder: "div#tvp-modal-iframe-holder-carousel-2",
  widgetIframeId: 'div#skeleton',
  playerIframId: 'div#carousel-2',
  widgetTitleId: "h3#widget-title",
  widgetNavHolder: "div#videos div.slick-carousel.slick-initialized.slick-slider",
  widgetNavPrev: "button.slick-prev ",
  widgetNavNext: "button.slick-next",
  widgetPlayerButton: "div.video-image-icon",
  modalId: "div#tvp-modal-carousel-2",
  modalCloseId: "div#tvp-modal-close-carousel-2",
  modalOverlay: "div#tvp-modal-overlay-carousel-2",
  playerHolder: "div.tvp-player-holder",
  productHolder: "div.tvp-products-holder",
  firstVideoId: 'div[data-slick-index="0"]',
  modalCloseButton: 'tvp-modal-close-carousel-2',
  modalTitle: 'tvp-modal-title-carousel-2',
  modalIframeHolder: 'tvp-modal-iframe-holder-carousel-2',

  // 'carousel-youtube-sanity': function (browser) {
  //   var carousel = widget.tvpGUITest({
  //         'modalOverlay': this.modalOverlay,
  //         'modalCloseId': this.modalCloseId,
  //         'modalCloseButton': this.modalCloseButton,
  //         'modalTitle': this.modalTitle,
  //         'modalIframeHolder': this.modalIframeHolder,
  //         'widgetNavHolder': this.widgetNavHolder,
  //         'widgetNavPrev': this.widgetNavPrev,
  //         'widgetNavNext': this.widgetNavNext,
  //         'widgetPlayerButton': this.widgetPlayerButton,
  //         'DATA': DATA
  //       }),
  //       parent = this.widgetIframeId + " > " + this.productHolder;
  //       client = carousel.init(browser, "Carousel Widget Normal", "div#carousel-2-holder", 0, this.playerIframId + " > " + this.productHolder);

  //   carousel.widgetTitle(this.widgetIframeId, this.widgetTitleId, "Recommended Videos"),
  //   carousel.widgetNav(this.widgetIframeId, 12),
  //   carousel.modalSanity(this.modalId, this.firstVideoId),
  //   carousel.modalLoadPerformance(this.widgetIFrameHolder, this.firstVideoId, this.playerIframId + " > " + this.playerHolder, 1),
  //   carousel.productModal(),
  //   carousel.productModalLink(),
  //   carousel.end();
  // },

  // 'carousel-youtube-player': function (browser) {
  //   var carousel = widget.tvpGUITest({
  //         'modalOverlay': this.modalOverlay,
  //         'modalCloseId': this.modalCloseId,
  //         'modalCloseButton': this.modalCloseButton,
  //         'modalTitle': this.modalTitle,
  //         'modalIframeHolder': this.modalIframeHolder,
  //         'widgetNavHolder': this.widgetNavHolder,
  //         'widgetNavPrev': this.widgetNavPrev,
  //         'widgetNavNext': this.widgetNavNext,
  //         'widgetPlayerButton': this.widgetPlayerButton,
  //         'DATA': DATA
  //       }),
  //       client = carousel.init(browser, "Carousel Youtube Player Normal", "div#carousel-2-holder", 0, this.playerIframId + " > " + this.playerHolder);

  //   carousel.modalLoad(this.firstVideoId, 160, 100),
  //   carousel.playerLoadPerformance(2),
  //   carousel.playerSanity(),
  //   // carousel.playerSkip(50),
  //   // carousel.playerSkip(150),
  //   // carousel.playerSkip(260),
  //   carousel.pause(10),

  //   // check for video finish playing and check for new video is playing
  //   // carousel.playerCheckPlaying(true),
  //   carousel.modalClose(this.modalId), // testing close modal

  //   // // Move to carousel iframe
  //   // carousel.iframe(0),

  //   // carousel.modalLoad(this.firstVideoId, 160, 100),
  //   // carousel.playerLoadPerformance(2),
  //   // carousel.playerSanity(),
  //   carousel.end();
  // },

  // // 'caousel-youtube-player-fullscreen': function (browser) {
  // //   var carousel = widget.tvpGUITest({
  // //         'modalOverlay': this.modalOverlay,
  // //         'modalCloseId': this.modalCloseId,
  // //         'DATA': DATA
  // //       }),
  // //       client = carousel.init(browser, "Carousel Youtube Player Fullscreen", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

  // //   carousel.modalLoad('div[data-slick-index="2"]', 160, 100),
  // //   carousel.playerLoadPerformance(2),
  // //   carousel.playerStart(),
  // //   carousel.playerCheckFullScreen(),
  // //   carousel.playerSkip(250),
  // //   carousel.playerSkip(750),
  // //   carousel.playerSkip(1030),
  // //   carousel.pause(10),

  // //   // checking for next loaded video sanity
  // //   carousel.playerCheckPlaying(true),
  // //   carousel.pause(2),

  // //   // Starting secound video
  // //   carousel.playerStart();
  // //   carousel.end();
  // // },

  // 'carousel-youtube-resize': function (browser) {
  //   var carousel = widget.tvpGUITest({
  //         'modalOverlay': this.modalOverlay,
  //         'modalCloseId': this.modalCloseId,
  //         'modalCloseButton': this.modalCloseButton,
  //         'modalTitle': this.modalTitle,
  //         'modalIframeHolder': this.modalIframeHolder,
  //         'widgetNavHolder': this.widgetNavHolder,
  //         'widgetNavPrev': this.widgetNavPrev,
  //         'widgetNavNext': this.widgetNavNext,
  //         'widgetPlayerButton': this.widgetPlayerButton,
  //         'DATA': DATA
  //       }),
  //       client = carousel.init(browser, "Carousel Youtube Player Normal", "div#carousel-2-holder", 0, this.playerIframId + " > " + this.playerHolder);

  //   carousel.modalLoad(this.firstVideoId, 160, 100),
  //   client.resizeWindow(1440/2, 1200),
  //   client.frameParent(),
  //   client
  //     .waitForElementVisible(this.modalId, 5000),
  //   client.expect.element(this.modalId).to.have.css('width', 700),
  //   client.frame(2)
  //   client.resizeWindow(1440/3, 1200),
  //   client.frameParent(),
  //   client
  //     .waitForElementVisible(this.modalId, 5000),
  //   client.expect.element(this.modalId).to.have.css('width', 480);
  //   carousel.end();
  // },

  'carousel-youtube-sanity': function (browser) {
    var carousel = widget.tvpGUITest({
          'modalOverlay': this.modalOverlay,
          'modalCloseId': this.modalCloseId,
          'modalCloseButton': this.modalCloseButton,
          'modalTitle': this.modalTitle,
          'modalIframeHolder': this.modalIframeHolder,
          'widgetNavHolder': this.widgetNavHolder,
          'widgetNavPrev': this.widgetNavPrev,
          'widgetNavNext': this.widgetNavNext,
          'widgetPlayerButton': this.widgetPlayerButton,
          'DATA': DATA
        }),
        parent = this.widgetIframeId + " > " + this.productHolder;
        client = carousel.init(browser, "Carousel Widget Normal", "div#carousel-2-holder", 0, this.playerIframId + " > " + this.productHolder);

    carousel.widgetTitle(this.widgetIframeId, this.widgetTitleId, "Recommended Videos"),
    //carousel.widgetNav(this.widgetIframeId, 12),
    carousel.modalSanity(this.modalId, this.firstVideoId),
    carousel.modalLoadPerformance(this.widgetIFrameHolder, this.firstVideoId, this.playerIframId + " > " + this.playerHolder, 1),
    carousel.productModal(),
    //carousel.productModalLink(),
    carousel.analytics(1, ['ci','vv','pi','pk']),
    carousel.end();
  }
};
