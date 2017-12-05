/*==============================*/
/* Nightwatch Inline Automation */
/*==============================*/
var INLINE = require(__dirname + "/../../../data/inline.js"),
    AUTO = require(__dirname + "/../../../lib/tvpGUITest.js");

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
          DATA: INLINE.data,
        }),
        product = INLINE.product,
        parent = this.ELEMENT_VIDEO_CONTENT,
        environment = browser.options.desiredCapabilities.build,
        client = widget.init(browser, "[" + environment + "] Widget Analytics", this.ELEMENT_WIDGET_HOLDER, this.IFRAME_WIDGET, parent),
        expected = INLINE.analytics;

    widget
      .widgetTitle(this.ELEMENT_WIDGET, this.ELEMENT_WIDGET_TITLE, "Double wall insulated mug")
      .productSanity(product, this.ELEMENT_PRODUCT_HOLDER, undefined, this.IFRAME_WIDGET, false)
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
