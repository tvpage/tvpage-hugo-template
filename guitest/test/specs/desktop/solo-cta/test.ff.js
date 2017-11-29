/*==============================================================================*/
/* Nightwatch Recorder generated Mon Oct 23 2017 18:49:04 GMT-0700 (PDT) */
/*==============================================================================*/
var DATA = {
      URL: "https://widgets.goodlookingbean.com/test/solo-cta/",
      PRODUCT_HEADLINE: "Related Products",
      SLA: 10000,
      BROWSERHEIGHT: 1080,
      BROWSEWIDTH: 1920
    };

var widget = require(__dirname + "/../../../../lib/tvpGUITest.js");

module.exports = {
  widgetHolder: "div#solo-cta-2-holder",
  widgetIFrameHolder: "div#tvp-modal-iframe-holder-solo-cta-2",
  widgetIframeId: 'div#solo-cta-2',
  playerIframId: 'div#solo-cta-2',
  widgetTitleId: "h3#widget-title",
  widgetNavHolder: "div#videos div.slick-solo-cta.slick-initialized.slick-slider",
  widgetNavPrev: "button.slick-prev ",
  widgetNavNext: "button.slick-next",
  widgetPlayerButton: "div.video-image-icon",
  modalId: "div#tvp-modal-solo-cta-2",
  modalCloseId: "div#tvp-modal-close-solo-cta-2",
  modalOverlay: "div#tvp-modal-overlay-solo-cta-2",
  playerHolder: "div.tvp-player-holder",
  productHolder: "div#featured-product",
  firstVideoId: 'div[data-slick-index="0"]',
  modalCloseButton: 'tvp-modal-close-solo-cta-2',
  modalTitle: 'tvp-modal-title-solo-cta-2',
  modalIframeHolder: 'tvp-modal-iframe-holder-solo-cta-2',

  // 'solo-youtube-sanity': function (browser) {
  //   var solo = widget.tvpGUITest({
  //         'modalOverlay': this.modalOverlay,
  //         'modalCloseId': this.modalCloseId,
  //         'DATA': DATA
  //       }),
  //       parent = this.widgetIframeId + " > " + this.productHolder;
  //       client = solo.init(browser, "Carousel Widget Normal", "div#solo-1-holder", 0, this.widgetIframeId + " > " + this.productHolder);

  //   solo.widgetTitle(this.widgetIframeId, this.widgetTitleId, "Recommended Videos"),
  //   solo.widgetNav(this.widgetIframeId, 16),
  //   solo.modalSanity(this.modalId, this.firstVideoId),
  //   solo.modalLoadPerformance(this.widgetIFrameHolder, this.firstVideoId, this.widgetIframeId + " > " + this.playerHolder, 2),
  //   solo.productModal(),
  //   solo.productModalLink(),
  //   solo.analytics(2);
  //   solo.end();
  // },

  // 'solo-youtube-player': function (browser) {
  //   var solo = widget.tvpGUITest({
  //         'modalOverlay': this.modalOverlay,
  //         'modalCloseId': this.modalCloseId,
  //         'DATA': DATA
  //       }),
  //       client = solo.init(browser, "Carousel Youtube Player Normal", "div#solo-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

  //   solo.modalLoad(this.firstVideoId, 160, 100),
  //   solo.playerLoadPerformance(2),
  //   solo.playerSanity(),
  //   // solo.playerSkip(50),
  //   // solo.playerSkip(150),
  //   // solo.playerSkip(260),
  //   solo.pause(10),

  //   // check for video finish playing and check for new video is playing
  //   // solo.playerCheckPlaying(true),
  //   solo.modalClose(this.modalId), // testing close modal

  //   // // Move to solo iframe
  //   // solo.iframe(0),

  //   // solo.modalLoad(this.firstVideoId, 160, 100),
  //   // solo.playerLoadPerformance(2),
  //   // solo.playerSanity(),
  //   solo.analytics(2);
  //   solo.end();
  // },

  // // 'caousel-youtube-player-fullscreen': function (browser) {
  // //   var solo = widget.tvpGUITest({
  // //         'modalOverlay': this.modalOverlay,
  // //         'modalCloseId': this.modalCloseId,
  // //         'DATA': DATA
  // //       }),
  // //       client = solo.init(browser, "Carousel Youtube Player Fullscreen", "div#solo-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

  // //   solo.modalLoad('div[data-slick-index="2"]', 160, 100),
  // //   solo.playerLoadPerformance(2),
  // //   solo.playerStart(),
  // //   solo.playerCheckFullScreen(),
  // //   solo.playerSkip(250),
  // //   solo.playerSkip(750),
  // //   solo.playerSkip(1030),
  // //   solo.pause(10),

  // //   // checking for next loaded video sanity
  // //   solo.playerCheckPlaying(true),
  // //   solo.pause(2),

  // //   // Starting secound video
  // //   solo.playerStart();
  // //   solo.end();
  // // },

  // 'solo-youtube-resize': function (browser) {
  //   var solo = widget.tvpGUITest({
  //         'modalOverlay': this.modalOverlay,
  //         'modalCloseId': this.modalCloseId,
  //         'DATA': DATA
  //       }),
  //       client = solo.init(browser, "Carousel Youtube Player Normal", "div#solo-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

  //   solo.modalLoad(this.firstVideoId, 160, 100),
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
  //   solo.end();
  // },

  'solo-cta-youtube-sanity-analytics': function (browser) {
    var solo = widget.tvpGUITest({
          'modalOverlay': this.modalOverlay,
          'modalCloseId': this.modalCloseId,
          'modalCloseButton': this.modalCloseButton,
          'modalTitle': this.modalTitle,
          'modalIframeHolder': this.modalIframeHolder,
          'widgetNavHolder': this.widgetNavHolder,
          'widgetNavPrev': this.widgetNavPrev,
          'widgetNavNext': this.widgetNavNext,
          'widgetPlayerButton': this.widgetPlayerButton,
          'DATA': DATA,
          'isFF': true
        }),
        parent = this.playerIframId;
        client = solo.init(browser, "Solo-CTA Widget Analytics", "div#solo-cta-2-holder", undefined, "");

    //solo.widgetTitle(this.widgetIframeId, this.widgetTitleId, "Double wall insulated mug");
    //solo.widgetNav(this.widgetIframeId, 12),
    //solo.modalSanity(this.modalId, this.firstVideoId, 'Double wall insulated mug'),
    //solo.modalLoadPerformance(this.widgetIFrameHolder, this.firstVideoId, this.playerIframId + " > " + this.playerHolder, 1);
    client
      .waitForElementVisible(this.widgetHolder + " div.tvp-cta-overlay", DATA.SLA)
      .click("div.tvp-cta-overlay")
      .frame(0);

    // var product = {
    //     "ID": 83102933,
    //     "URL": "http://www.gourmia.com/item.asp?item=10096",
    //     "SECURE_URL": "http://http://www.gourmia.com/item.asp?item=10096",
    //     "TITLE_REGEX": /Gourmia\ GDK380\ Multi\ Function\ Digital\ Tea\ Kettle,\ \.\.\./i,
    //     "IMG": "http://www.gourmia.com/itemimageslarge/GDK380-Small.png",
    //     "PRICE": "$199.99"
    //   };

    // solo.productModal(false, product, "a[data-id='83102933']"),
    // client.windowHandles(function (result) {
    //   this.switchWindow(result.value[1]),
    //   this.closeWindow(),
    //   this.switchWindow(result.value[0]),
    //   this.frame(0);
    // });

    // product = {
    //     "ID": 83102933,
    //     "URL": "http://www.gourmia.com/item.asp?item=10096",
    //     "SECURE_URL": "http://http://www.gourmia.com/item.asp?item=10096",
    //     "TITLE_REGEX": /Gourmia\ GDK380\ Multi\ Function\ Digital\ Tea\ Kettle,\ \.\.\./i,
    //     "IMG": "http://www.gourmia.com/itemimageslarge/GDK380-Small.png",
    //     "PRICE": "$199.99"
    //   }

    //solo.productModalLink(),
    solo.playerStart(70, 70, this.playerIframId + " " + this.playerHolder)
    solo.pause(15);
    //solo.productModal(false, product),
    // client.windowHandles(function (result) {
    //   this.switchWindow(result.value[1]),
    //   this.closeWindow(),
    //   this.switchWindow(result.value[0]),
    //   this.frame(1);
    // }),
    solo.playerStart(70, 70, this.playerIframId + " " + this.playerHolder),
    solo.pause(5);
    solo.analytics(0, ['ci','vv'], {
      LOGIN_ID: 1758799,
      CHANNEL_ID: 66133904,
      VIDS: [65981962,83106081],
      COUNTS: {"ci": 2, "vv": 2}
    }),
    solo.pause(10),
    solo.end();
  }
};
