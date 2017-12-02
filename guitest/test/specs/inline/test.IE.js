/*==============================*/
/* Nightwatch Inline Automation */
/*==============================*/
var ANALYTIC = require(__dirname + "/../analytics/inline.counts.js"),
    AUTO = require(__dirname + "/../../../lib/tvpGUITest.js"),
    DATA = {
      BASE_URL: "https://widgets.goodlookingbean.com/test/",
      SLA: 10000,
      BROWSERHEIGHT: 1080,
      BROWSEWIDTH: 1920,

      WIDGET_TYPE: 'inline',
      WIDGET_CI: {MIN:0, MAX:1},
      LOGIN_ID: 1758799,
      CHANNEL_ID: 66133904
    };

module.exports = {
  ELEMENT_WIDGET_HOLDER: "div#inline-2-holder",
  ELEMENT_WIDGET: 'div#skeleton',
  ELEMENT_WIDGET_TITLE: "h3#widget-title",

  ELEMENT_MODAL_HOLDER: "div#tvp-modal-inline-2",
  ELEMENT_MODAL_OPEN: "div.video-image-icon",
  ELEMENT_MODAL: "div#tvp-modal-inline-2",
  ELEMENT_MODAL_CLOSE: "div#tvp-modal-close-inline-2",
  ELEMENT_MODAL_OVERLAY: "div#tvp-modal-overlay-inline-2",
  ELEMENT_MODAL_CLOSE_BUTTON: 'div#tvp-modal-close-inline-2',
  ELEMENT_MODAL_TITLE: 'h4#tvp-modal-title-inline-2',
  ELEMENT_MODAL_IFRAME_HOLDER: 'tvp-modal-iframe-holder-inline-2',

  ELEMENT_PLAYER_HOLDER: "div.player-holder",
  ELEMENT_PRODUCT_HOLDER: "a[data-id='83102933']",
  ELEMENT_VIDEO_CONTENT: 'div#skeleton',
  ELEMENT_FIRST_VIDEO: 'div[data-id="65981962"]',

  IFRAME_WIDGET: 0,

  'inline-analytics': function (browser) {

    var widget = AUTO.tvpGUITest({
          ELEMENT_MODAL_OVERLAY: this.ELEMENT_MODAL_OVERLAY,
          ELEMENT_MODAL_CLOSE: this.ELEMENT_MODAL_CLOSE,
          ELEMENT_MODAL_CLOSE_BUTTON: this.ELEMENT_MODAL_CLOSE_BUTTON,
          ELEMENT_MODAL_TITLE: this.ELEMENT_MODAL_TITLE,
          ELEMENT_MODAL_IFRAME_HOLDER: this.ELEMENT_MODAL_IFRAME_HOLDER,
          ELEMENT_MODAL_OPEN: this.ELEMENT_MODAL_OPEN,
          DATA: DATA,
          IS_IE: true
        }),
        product = {
          ID: 83102933,
          URL: "http://www.gourmia.com/item.asp?item=10096",
          SECURE_URL: "http://http://www.gourmia.com/item.asp?item=10096",
          TITLE_REGEX: /Gourmia\ GDK380\ Multi\ Function\ Digital\ Tea\ Kettle,\ \.\.\./i,
          IMG: "http://www.gourmia.com/itemimageslarge/GDK380-Small.png",
          PRICE: "$199.99"
        },
        parent = this.ELEMENT_VIDEO_CONTENT,
        client = widget.init(browser, "Sidebar Widget Analytics", this.ELEMENT_WIDGET_HOLDER, this.IFRAME_WIDGET, parent),
        expected = ANALYTIC.counts;

    widget
      .widgetTitle(this.ELEMENT_WIDGET, this.ELEMENT_WIDGET_TITLE, "Double wall insulated mug")

      // On IE, order of element is very important, make sure targetting very exact element to click (specifiy product title element to open link)
      .productSanity(product, this.ELEMENT_PRODUCT_HOLDER, "p.product-title", this.IFRAME_WIDGET, false)
      .pause(5)

      .playerStartPause(this.IFRAME_WIDGET, this.ELEMENT_VIDEO_CONTENT + " " + this.ELEMENT_PLAYER_HOLDER)
      .pause(25)
      .playerStartPause(this.IFRAME_WIDGET, this.ELEMENT_VIDEO_CONTENT + " " + this.ELEMENT_PLAYER_HOLDER)
      .pause(10)

      // Stopping video to stop triggering vt events
      .playerStartPause(this.IFRAME_WIDGET, this.ELEMENT_VIDEO_CONTENT + " " + this.ELEMENT_PLAYER_HOLDER, false)
      .pause(5)
      .playerStartPause(this.IFRAME_WIDGET, this.ELEMENT_VIDEO_CONTENT + " " + this.ELEMENT_PLAYER_HOLDER, false)
      .pause(15)
      .playerStartPause(this.IFRAME_WIDGET, this.ELEMENT_VIDEO_CONTENT + " " + this.ELEMENT_PLAYER_HOLDER, false)
      .pause(5)

      .analytics(this.IFRAME_WIDGET, ['ci','vv','vt', 'vtp', 'pi','pk'], expected[this.IFRAME_WIDGET])
      .end();
  }

};

/*==============================================================================*/
/* Nightwatch Recorder generated Mon Oct 23 2017 18:49:04 GMT-0700 (PDT) */
/*==============================================================================*/
/*
var DATA = {
      URL: "https://widgets.goodlookingbean.com/test/inline/",
      PRODUCT_HEADLINE: "Related Products",
      SLA: 10000,
      BROWSERHEIGHT: 1080,
      BROWSEWIDTH: 1920
    };

var widget = require(__dirname + "/../../../../lib/tvpGUITest.js");

module.exports = {
  widgetHolder: "div#carousel-spotlight-2-holder",
  widgetIFrameHolder: "div#tvp-modal-iframe-holder-carousel-spotlight-2",
  widgetIframeId: 'div#skeleton',
  playerIframId: 'div#skeleton',
  widgetTitleId: "h3#widget-title",
  widgetNavHolder: "div#videos div.slick-carousel-spotlight.slick-initialized.slick-slider",
  widgetNavPrev: "button.slick-prev ",
  widgetNavNext: "button.slick-next",
  widgetPlayerButton: "div.video-image-icon",
  modalId: "div#tvp-modal-carousel-spotlight-2",
  modalCloseId: "div#tvp-modal-close-carousel-spotlight-2",
  modalOverlay: "div#tvp-modal-overlay-carousel-spotlight-2",
  playerHolder: "div.player-holder",
  productHolder: "div#featured-product",
  firstVideoId: 'div[data-slick-index="0"]',
  modalCloseButton: 'tvp-modal-close-carousel-spotlight-2',
  modalTitle: 'tvp-modal-title-carousel-spotlight-2',
  modalIframeHolder: 'tvp-modal-iframe-holder-carousel-spotlight-2',
*/
  // 'inline-youtube-sanity': function (browser) {
  //   var inline = widget.tvpGUITest({
  //         'modalOverlay': this.modalOverlay,
  //         'modalCloseId': this.modalCloseId,
  //         'DATA': DATA
  //       }),
  //       parent = this.widgetIframeId + " > " + this.productHolder;
  //       client = inline.init(browser, "Carousel Widget Normal", "div#inline-1-holder", 0, this.widgetIframeId + " > " + this.productHolder);

  //   inline.widgetTitle(this.widgetIframeId, this.widgetTitleId, "Recommended Videos"),
  //   inline.widgetNav(this.widgetIframeId, 16),
  //   inline.modalSanity(this.modalId, this.firstVideoId),
  //   inline.modalLoadPerformance(this.widgetIFrameHolder, this.firstVideoId, this.widgetIframeId + " > " + this.playerHolder, 2),
  //   inline.productModal(),
  //   inline.productModalLink(),
  //   inline.analytics(2);
  //   inline.end();
  // },

  // 'inline-youtube-player': function (browser) {
  //   var inline = widget.tvpGUITest({
  //         'modalOverlay': this.modalOverlay,
  //         'modalCloseId': this.modalCloseId,
  //         'DATA': DATA
  //       }),
  //       client = inline.init(browser, "Carousel Youtube Player Normal", "div#inline-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

  //   inline.modalLoad(this.firstVideoId, 160, 100),
  //   inline.playerLoadPerformance(2),
  //   inline.playerSanity(),
  //   // inline.playerSkip(50),
  //   // inline.playerSkip(150),
  //   // inline.playerSkip(260),
  //   inline.pause(10),

  //   // check for video finish playing and check for new video is playing
  //   // inline.playerCheckPlaying(true),
  //   inline.modalClose(this.modalId), // testing close modal

  //   // // Move to inline iframe
  //   // inline.iframe(0),

  //   // inline.modalLoad(this.firstVideoId, 160, 100),
  //   // inline.playerLoadPerformance(2),
  //   // inline.playerSanity(),
  //   inline.analytics(2);
  //   inline.end();
  // },

  // // 'caousel-youtube-player-fullscreen': function (browser) {
  // //   var inline = widget.tvpGUITest({
  // //         'modalOverlay': this.modalOverlay,
  // //         'modalCloseId': this.modalCloseId,
  // //         'DATA': DATA
  // //       }),
  // //       client = inline.init(browser, "Carousel Youtube Player Fullscreen", "div#inline-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

  // //   inline.modalLoad('div[data-slick-index="2"]', 160, 100),
  // //   inline.playerLoadPerformance(2),
  // //   inline.playerStart(),
  // //   inline.playerCheckFullScreen(),
  // //   inline.playerSkip(250),
  // //   inline.playerSkip(750),
  // //   inline.playerSkip(1030),
  // //   inline.pause(10),

  // //   // checking for next loaded video sanity
  // //   inline.playerCheckPlaying(true),
  // //   inline.pause(2),

  // //   // Starting secound video
  // //   inline.playerStart();
  // //   inline.end();
  // // },

  // 'inline-youtube-resize': function (browser) {
  //   var inline = widget.tvpGUITest({
  //         'modalOverlay': this.modalOverlay,
  //         'modalCloseId': this.modalCloseId,
  //         'DATA': DATA
  //       }),
  //       client = inline.init(browser, "Carousel Youtube Player Normal", "div#inline-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

  //   inline.modalLoad(this.firstVideoId, 160, 100),
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
  //   inline.end();
  // },
/*
  'inline-youtube-sanity-analytics': function (browser) {
    var inline = widget.tvpGUITest({
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
          'aReset': true
        }),
        parent = this.playerIframId + " " + this.productHolder;
        client = inline.init(browser, "Inline Widget Analytics", "div#inline-2-holder", 0, parent);

    inline.widgetTitle(this.widgetIframeId, this.widgetTitleId, "Double wall insulated mug");
    //inline.widgetNav(this.widgetIframeId, 12),
    //inline.modalSanity(this.modalId, this.firstVideoId, 'Double wall insulated mug'),
    //inline.modalLoadPerformance(this.widgetIFrameHolder, this.firstVideoId, this.playerIframId + " > " + this.playerHolder, 1);

    var product = {
        "ID": 83102933,
        "URL": "http://www.gourmia.com/item.asp?item=10096",
        "SECURE_URL": "http://http://www.gourmia.com/item.asp?item=10096",
        "TITLE_REGEX": /Gourmia\ GDK380\ Multi\ Function\ Digital\ Tea\ Kettle,\ \.\.\./i,
        "IMG": "http://www.gourmia.com/itemimageslarge/GDK380-Small.png",
        "PRICE": "$199.99"
      };

    inline.productModal(false, product, "a[data-id='83102933']"),
    client.windowHandles(function (result) {
      this.switchWindow(result.value[1]),
      this.closeWindow(),
      this.switchWindow(result.value[0]),
      this.frame(0);
    });

    // product = {
    //     "ID": 83102933,
    //     "URL": "http://www.gourmia.com/item.asp?item=10096",
    //     "SECURE_URL": "http://http://www.gourmia.com/item.asp?item=10096",
    //     "TITLE_REGEX": /Gourmia\ GDK380\ Multi\ Function\ Digital\ Tea\ Kettle,\ \.\.\./i,
    //     "IMG": "http://www.gourmia.com/itemimageslarge/GDK380-Small.png",
    //     "PRICE": "$199.99"
    //   }

    //inline.productModalLink(),
    inline.playerStart(70, 70, this.playerIframId + " " + this.playerHolder)
    inline.pause(15);
    //inline.productModal(false, product),
    // client.windowHandles(function (result) {
    //   this.switchWindow(result.value[1]),
    //   this.closeWindow(),
    //   this.switchWindow(result.value[0]),
    //   this.frame(1);
    // }),
    inline.playerStart(70, 70, this.playerIframId + " " + this.playerHolder),
    inline.pause(5);
    inline.analytics(0, ['ci', 'vv','pi','pk'], {
      LOGIN_ID: 1758799,
      CHANNEL_ID: 66133904,
      VIDS: [65981962,83106081],
      PKIDS: [83102933,83102606],
      PIDS: [
        [83102933,83102936,83102939,83102914,83102916,83102920,83102919,83102921,83102918,83102928,83102927,83102923],
        [83102606,83096473,83096474,83102585,83102603,83106094]
      ],
      COUNTS: {"ci": 1, "vv": 2, "pi": 18, "pk": 1}
    }),
    inline.pause(10),
    inline.end();
  }
};
*/