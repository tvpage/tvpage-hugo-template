/*========================================*/
/* Nightwatch Inline Spotlight Automation */
/*========================================*/
var INLINE_SPOTLIGHT = require(__dirname + "/../../../data/inline-spotlight.js"),
    AUTO = require(__dirname + "/../../../lib/tvpGUITest.js");

module.exports = {
  ELEMENT_WIDGET_HOLDER: "div#inline-spotlight-2-holder",
  ELEMENT_WIDGET: 'div#skeleton',
  ELEMENT_WIDGET_TITLE: "h3#widget-title",

  ELEMENT_MODAL_HOLDER: "div#tvp-modal-inline-spotlight-2",
  ELEMENT_MODAL_OPEN: "div.video-image-icon",
  ELEMENT_MODAL: "div#tvp-modal-inline-spotlight-2",
  ELEMENT_MODAL_CLOSE: "div#tvp-modal-close-inline-spotlight-2",
  ELEMENT_MODAL_OVERLAY: "div#tvp-modal-overlay-inline-spotlight-2",
  ELEMENT_MODAL_CLOSE_BUTTON: 'div#tvp-modal-close-inline-spotlight-2',
  ELEMENT_MODAL_TITLE: 'h4#tvp-modal-title-inline-spotlight-2',
  ELEMENT_MODAL_IFRAME_HOLDER: 'tvp-modal-iframe-holder-inline-spotlight-2',

  ELEMENT_PLAYER_HOLDER: "div.player-holder",
  ELEMENT_PRODUCT_HOLDER: "a[data-id='83102933']",
  ELEMENT_VIDEO_CONTENT: 'div#skeleton',
  ELEMENT_FIRST_VIDEO: 'div[data-id="65981962"]',

  IFRAME_WIDGET: 0,

  'inline-spotlight-analytics': function (browser) {

    var widget = AUTO.tvpGUITest({
          ELEMENT_MODAL_OVERLAY: this.ELEMENT_MODAL_OVERLAY,
          ELEMENT_MODAL_CLOSE: this.ELEMENT_MODAL_CLOSE,
          ELEMENT_MODAL_CLOSE_BUTTON: this.ELEMENT_MODAL_CLOSE_BUTTON,
          ELEMENT_MODAL_TITLE: this.ELEMENT_MODAL_TITLE,
          ELEMENT_MODAL_IFRAME_HOLDER: this.ELEMENT_MODAL_IFRAME_HOLDER,
          ELEMENT_MODAL_OPEN: this.ELEMENT_MODAL_OPEN,
          DATA: INLINE_SPOTLIGHT.data,
          IS_SARAFI: true
        }),
        product = INLINE_SPOTLIGHT.product,
        parent = this.ELEMENT_VIDEO_CONTENT,
        environment = browser.options.desiredCapabilities.build,
        client = widget.init(browser, "[" + environment + "] Widget Analytics", this.ELEMENT_WIDGET_HOLDER, this.IFRAME_WIDGET, parent),
        expected = INLINE_SPOTLIGHT.analytics;

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
