/*==============================*/
/* Nightwatch Sidebar Automation */
/*==============================*/
var ANALYTIC = require(__dirname + "/analytic.counts.js"),
    AUTO = require(__dirname + "/../../../../lib/tvpGUITest.js"),
    DATA = {
      BASE_URL: "https://widgets.goodlookingbean.com/test/",
      SLA: 10000,
      BROWSERHEIGHT: 1080,
      BROWSEWIDTH: 1920,

      WIDGET_TYPE: 'carousel',
      WIDGET_CI: {MIN:0, MAX:1},
      LOGIN_ID: 1758799,
      CHANNEL_ID: 66133904
    };

module.exports = {
  ELEMENT_WIDGET_HOLDER: "div#carousel-2-holder",
  ELEMENT_WIDGET: 'div#skeleton',
  ELEMENT_WIDGET_TITLE: "h3#widget-title",

  ELEMENT_MODAL_HOLDER: "div#tvp-modal-carousel-2",
  ELEMENT_MODAL_OPEN: "div.video-image-icon",
  ELEMENT_MODAL: "div#tvp-modal-carousel-2",
  ELEMENT_MODAL_CLOSE: "div#tvp-modal-close-carousel-2",
  ELEMENT_MODAL_OVERLAY: "div#tvp-modal-overlay-carousel-2",
  ELEMENT_MODAL_CLOSE_BUTTON: 'div#tvp-modal-close-carousel-2',
  ELEMENT_MODAL_TITLE: 'h4#tvp-modal-title-carousel-2',
  ELEMENT_MODAL_IFRAME_HOLDER: 'tvp-modal-iframe-holder-carousel-2',

  ELEMENT_PLAYER_HOLDER: "div.tvp-player-holder",
  ELEMENT_PRODUCT_HOLDER: "div.tvp-products-holder",
  ELEMENT_VIDEO_CONTENT: 'div#carousel-2',
  ELEMENT_FIRST_VIDEO: 'div[data-slick-index="0"]',

  IFRAME_WIDGET: 0,
  IFRAME_MODAL: 1,

  'carousel-analytics': function (browser) {

    var widget = AUTO.tvpGUITest({
          ELEMENT_MODAL_OVERLAY: this.ELEMENT_MODAL_OVERLAY,
          ELEMENT_MODAL_CLOSE: this.ELEMENT_MODAL_CLOSE,
          ELEMENT_MODAL_CLOSE_BUTTON: this.ELEMENT_MODAL_CLOSE_BUTTON,
          ELEMENT_MODAL_TITLE: this.ELEMENT_MODAL_TITLE,
          ELEMENT_MODAL_IFRAME_HOLDER: this.ELEMENT_MODAL_IFRAME_HOLDER,
          ELEMENT_MODAL_OPEN: this.ELEMENT_MODAL_OPEN,
          DATA: DATA,
        }),
        product = {
          ID: 83102933,
          URL: "http://www.gourmia.com/item.asp?item=10096",
          SECURE_URL: "http://http://www.gourmia.com/item.asp?item=10096",
          TITLE_REGEX: /Gourmia\ GDK380\ Multi\ Function\ Digital\ Tea\ Kettle,\ \.\.\./i,
          IMG: "http://www.gourmia.com/itemimageslarge/GDK380-Small.png",
          PRICE: "$199.99"
        },
        parent = this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PRODUCT_HOLDER,
        client = widget.init(browser, "Carousel Widget Analytics", this.ELEMENT_WIDGET_HOLDER, this.IFRAME_WIDGET, parent),
        expected =  ANALYTIC.counts;

    widget
      .widgetTitle(this.ELEMENT_WIDGET, this.ELEMENT_WIDGET_TITLE, "Recommended Videos")
      .modalSanity(this.ELEMENT_MODAL, this.ELEMENT_FIRST_VIDEO, 'Double wall insulated mug', this.IFRAME_MODAL, true)
      .productSanity(product, undefined, undefined, this.IFRAME_MODAL, false)
      .pause(5)
      .playerStartPause(this.IFRAME_MODAL, this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER)
      .pause(25)
      .playerStartPause(this.IFRAME_MODAL, this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER)
      .pause(10)

      // Stopping video to stop triggering vt events
      .playerStartPause(this.IFRAME_MODAL, this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER, false)
      .pause(5)
      .playerStartPause(this.IFRAME_MODAL, this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER, false)
      .pause(15)
      .playerStartPause(this.IFRAME_MODAL, this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER, false)
      .pause(5)

      // Checking CI events on Widget iframe
      .analytics(this.IFRAME_WIDGET, ['ci'], expected[this.IFRAME_WIDGET])
      .analytics(this.IFRAME_MODAL, ['ci','vv','vt', 'vtp', 'pi','pk'], expected[this.IFRAME_MODAL])

      .end();
  }

};

/*==============================================================================*/
/* Nightwatch Recorder generated Mon Oct 23 2017 18:49:04 GMT-0700 (PDT) */
/*==============================================================================*/
/*
var DATA = {
      URL: "https://widgets.goodlookingbean.com/test/carousel/",
      PRODUCT_HEADLINE: "Related Products",
      SLA: 10000,
      BROWSERHEIGHT: 1080,
      BROWSEWIDTH: 1920
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
  PLAY_BUTTON: "div.video-image-icon",
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
  //         'DATA': DATA
  //       }),
  //       parent = this.widgetIframeId + " > " + this.productHolder;
  //       client = carousel.init(browser, "Carousel Widget Normal", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.productHolder);

  //   carousel.widgetTitle(this.widgetIframeId, this.widgetTitleId, "Recommended Videos"),
  //   carousel.widgetNav(this.widgetIframeId, 16),
  //   carousel.modalSanity(this.modalId, this.firstVideoId),
  //   carousel.modalLoadPerformance(this.widgetIFrameHolder, this.firstVideoId, this.widgetIframeId + " > " + this.playerHolder, 2),
  //   carousel.productModal(),
  //   carousel.productModalLink(),
  //   carousel.analytics(2);
  //   carousel.end();
  // },

  // 'carousel-youtube-player': function (browser) {
  //   var carousel = widget.tvpGUITest({
  //         'modalOverlay': this.modalOverlay,
  //         'modalCloseId': this.modalCloseId,
  //         'DATA': DATA
  //       }),
  //       client = carousel.init(browser, "Carousel Youtube Player Normal", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

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
  //   carousel.analytics(2);
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
  //         'DATA': DATA
  //       }),
  //       client = carousel.init(browser, "Carousel Youtube Player Normal", "div#carousel-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

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

  'carousel-youtube-sanity-analytics': function (browser) {
    var carousel = widget.tvpGUITest({
          'modalOverlay': this.modalOverlay,
          'modalCloseId': this.modalCloseId,
          'modalCloseButton': this.modalCloseButton,
          'modalTitle': this.modalTitle,
          'modalIframeHolder': this.modalIframeHolder,
          'widgetNavHolder': this.widgetNavHolder,
          'widgetNavPrev': this.widgetNavPrev,
          'widgetNavNext': this.widgetNavNext,
          'PLAY_BUTTON': this.PLAY_BUTTON,
          'DATA': DATA,
          'aReset': true,
          'initialCI': 0
        }),
        parent = this.playerIframId + " > " + this.productHolder;
        client = carousel.init(browser, "Carousel Widget Analytics", "div#carousel-2-holder", 0, parent);

    carousel.widgetTitle(this.widgetIframeId, this.widgetTitleId, "Recommended Videos"),
    //carousel.widgetNav(this.widgetIframeId, 12),
    carousel.modalSanity(this.modalId, this.firstVideoId, 'Double wall insulated mug', 1, true);
    //carousel.modalLoadPerformance(this.widgetIFrameHolder, this.firstVideoId, this.playerIframId + " > " + this.playerHolder, 1);

    var product = {
        "ID": 83102933,
        "URL": "http://www.gourmia.com/item.asp?item=10096",
        "SECURE_URL": "http://http://www.gourmia.com/item.asp?item=10096",
        "TITLE_REGEX": /Gourmia\ GDK380\ Multi\ Function\ Digital\ Tea\ Kettle,\ \.\.\./i,
        "IMG": "http://www.gourmia.com/itemimageslarge/GDK380-Small.png",
        "PRICE": "$199.99"
      }

    carousel.productModal(false, product, undefined, undefined, 1),
    client.windowHandles(function (result) {
      this.switchWindow(result.value[1]),
      this.closeWindow(),
      this.switchWindow(result.value[0]),
      this.frame(1);
    });

    // product = {
    //     "ID": 83102933,
    //     "URL": "http://www.gourmia.com/item.asp?item=10096",
    //     "SECURE_URL": "http://http://www.gourmia.com/item.asp?item=10096",
    //     "TITLE_REGEX": /Gourmia\ GDK380\ Multi\ Function\ Digital\ Tea\ Kettle,\ \.\.\./i,
    //     "IMG": "http://www.gourmia.com/itemimageslarge/GDK380-Small.png",
    //     "PRICE": "$199.99"
    //   }

    //carousel.productModalLink(),
    carousel.playerStart(70, 70, this.playerIframId + " > " + this.playerHolder)
    carousel.pause(15);
    //carousel.productModal(false, product),
    // client.windowHandles(function (result) {
    //   this.switchWindow(result.value[1]),
    //   this.closeWindow(),
    //   this.switchWindow(result.value[0]),
    //   this.frame(1);
    // }),
    carousel.playerStart(70, 70, this.playerIframId + " > " + this.playerHolder),
    carousel.pause(5),
    carousel.analytics(0, ['ci'], {
      LOGIN_ID: 1758799,
      CHANNEL_ID: 66133904,
      SKIP_COUNT: true,
    }),
    carousel.analytics(1, ['ci','vv','pi','pk'], {
      LOGIN_ID: 1758799,
      CHANNEL_ID: 66133904,
      VIDS: [65981962,83106081],
      PKIDS: [83102933,83102606],
      PIDS: [
        [83102933,83102936,83102939,83102914,83102916,83102920,83102919,83102921,83102918,83102928,83102927,83102923],
        [83102606,83096473,83096474,83102585,83102603,83106094]
      ],
      COUNTS: {"ci": 2, "pi": 18, "vv": 2, "pk": 1}
    }),
    carousel.pause(10),
    carousel.end();
  }
};
*/