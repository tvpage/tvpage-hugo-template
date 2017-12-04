/*==============================*/
/* Nightwatch Sidebar Automation */
/*==============================*/
var ANALYTIC = require(__dirname + "/../analytics/sidebar.counts.js"),
    AUTO = require(__dirname + "/../../../lib/tvpGUITest.js"),
    DATA = {
      BASE_URL: "https://widgets.goodlookingbean.com/test/",
      SLA: 10000,
      BROWSERHEIGHT: 1080,
      BROWSEWIDTH: 1920,

      WIDGET_TYPE: 'sidebar',
      WIDGET_CI: {MIN:0, MAX:1},
      LOGIN_ID: 1758799,
      CHANNEL_ID: 66133904
    };

module.exports = {
  ELEMENT_WIDGET_HOLDER: "div#sidebar-2-holder",
  ELEMENT_WIDGET: 'div#skeleton',
  ELEMENT_WIDGET_TITLE: "h3#widget-title",
  ELEMENT_MODAL_HOLDER: "div#tvp-modal-sidebar-2",
  ELEMENT_MODAL_OPEN: "div.video-image-icon",
  ELEMENT_MODAL: "div#tvp-modal-sidebar-2",
  ELEMENT_MODAL_CLOSE: "div#tvp-modal-close-sidebar-2",
  ELEMENT_MODAL_OVERLAY: "div#tvp-modal-overlay-sidebar-2",
  ELEMENT_MODAL_CLOSE_BUTTON: 'div#tvp-modal-close-sidebar-2',
  ELEMENT_MODAL_TITLE: 'h4#tvp-modal-title-sidebar-2',
  ELEMENT_MODAL_IFRAME_HOLDER: 'tvp-modal-iframe-holder-sidebar-2',
  ELEMENT_PLAYER_HOLDER: "div.tvp-player-holder",
  ELEMENT_PRODUCT_HOLDER: "div.tvp-products-holder",
  ELEMENT_VIDEO_CONTENT: 'div#sidebar-2',
  ELEMENT_FIRST_VIDEO: 'div[data-id="65981962"]',

  IFRAME_WIDGET: 0,
  IFRAME_MODAL: 1,

  'sidebar-analytics': function (browser) {

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
        environment = browser.options.desiredCapabilities.build,
        client = widget.init(browser, "[" + environment + "] Widget Analytics", this.ELEMENT_WIDGET_HOLDER, this.IFRAME_WIDGET, parent),
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
