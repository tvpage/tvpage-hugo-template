/*==========================================*/
/* Nightwatch Carousel Spotlight Automation */
/*==========================================*/
var CAROUSEL_SPOTLIGHT = require(__dirname + "/../../../data/carousel-spotlight.js"),
    AUTO = require(__dirname + "/../../../lib/tvpGUITest.js");

module.exports = {
  ELEMENT_WIDGET_HOLDER: "div#carousel-spotlight-2-holder",
  ELEMENT_WIDGET: 'div#skeleton',
  ELEMENT_WIDGET_TITLE: "h3#widget-title",
  ELEMENT_MODAL_HOLDER: "div#tvp-modal-carousel-spotlight-2",
  ELEMENT_MODAL_OPEN: "div.video-image-icon",
  ELEMENT_MODAL: "div#tvp-modal-carousel-spotlight-2",
  ELEMENT_MODAL_CLOSE: "div#tvp-modal-close-carousel-spotlight-2",
  ELEMENT_MODAL_OVERLAY: "div#tvp-modal-overlay-carousel-spotlight-2",
  ELEMENT_MODAL_CLOSE_BUTTON: 'div#tvp-modal-close-carousel-spotlight-2',
  ELEMENT_MODAL_TITLE: 'h4#tvp-modal-title-carousel-spotlight-2',
  ELEMENT_MODAL_IFRAME_HOLDER: 'tvp-modal-iframe-holder-carousel-spotlight-2',
  ELEMENT_PLAYER_HOLDER: "div.tvp-player-holder",
  ELEMENT_PRODUCT_HOLDER: "div.tvp-products-holder",
  ELEMENT_VIDEO_CONTENT: 'div#carousel-spotlight-2',
  ELEMENT_FIRST_VIDEO: 'div[data-slick-index="0"]',

  IFRAME_WIDGET: 0,
  IFRAME_MODAL: 1,

  'carousel-spotlight-analytics': function (browser) {

    var widget = AUTO.tvpGUITest({
          ELEMENT_MODAL_OVERLAY: this.ELEMENT_MODAL_OVERLAY,
          ELEMENT_MODAL_CLOSE: this.ELEMENT_MODAL_CLOSE,
          ELEMENT_MODAL_CLOSE_BUTTON: this.ELEMENT_MODAL_CLOSE_BUTTON,
          ELEMENT_MODAL_TITLE: this.ELEMENT_MODAL_TITLE,
          ELEMENT_MODAL_IFRAME_HOLDER: this.ELEMENT_MODAL_IFRAME_HOLDER,
          ELEMENT_MODAL_OPEN: this.ELEMENT_MODAL_OPEN,
          DATA: CAROUSEL_SPOTLIGHT.data,
          IS_SAFARI: true
        }),
        product = CAROUSEL_SPOTLIGHT.product,
        parent = this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PRODUCT_HOLDER,
        environment = browser.options.desiredCapabilities.build,
        client = widget.init(browser, "[" + environment + "] Widget Analytics", this.ELEMENT_WIDGET_HOLDER, this.IFRAME_WIDGET, parent),
        expected =  CAROUSEL_SPOTLIGHT.analytics;

    widget
      .widgetTitle(this.ELEMENT_WIDGET, this.ELEMENT_WIDGET_TITLE, "Recommended Videos")
      .modalSanity(this.ELEMENT_MODAL, this.ELEMENT_FIRST_VIDEO, 'Double wall insulated mug', this.IFRAME_MODAL, true)
      .productSanity(product, 'a[data-id="83102933"]', 'p.product-title', this.IFRAME_MODAL, false)
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
