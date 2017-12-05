/*================================*/
/* Nightwatch Solo CTA Automation */
/*================================*/
var SOLO_CTA = require(__dirname + "/../../../data/solo-cta.js"),
    AUTO = require(__dirname + "/../../../lib/tvpGUITest.js");

module.exports = {
  ELEMENT_WIDGET_HOLDER: "div#solo-cta-2-holder",
  ELEMENT_WIDGET: 'body.tvp-solo-cta-iframe-body',
  ELEMENT_WIDGET_TITLE: "div.tvp-cta-text",
  ELEMENT_MODAL_HOLDER: "tvp-modal-iframe-holder-solo-cta-2",
  ELEMENT_MODAL_OPEN: "",
  ELEMENT_MODAL: "div#tvp-modal-solo-cta-2",
  ELEMENT_MODAL_CLOSE: "div#tvp-modal-close-solo-cta-2",
  ELEMENT_MODAL_OVERLAY: "div#tvp-modal-overlay-solo-cta-2",
  ELEMENT_MODAL_CLOSE_BUTTON: 'div#tvp-modal-close-solo-cta-2',
  ELEMENT_MODAL_TITLE: 'h4#tvp-modal-title-solo-cta-2',
  ELEMENT_MODAL_IFRAME_HOLDER: 'tvp-modal-iframe-holder-solo-cta-2',
  ELEMENT_PLAYER_HOLDER: "div.tvp-player-holder",
  //ELEMENT_PRODUCT_HOLDER: "div.tvp-products-holder",
  ELEMENT_VIDEO_CONTENT: 'div#solo-cta-2',
  ELEMENT_FIRST_VIDEO: 'div.tvp-cta-overlay',

  IFRAME_WIDGET: 0,
  IFRAME_MODAL: 1,

  'solo-cta-analytics': function (browser) {

    var widget = AUTO.tvpGUITest({
          ELEMENT_MODAL_OVERLAY: this.ELEMENT_MODAL_OVERLAY,
          ELEMENT_MODAL_CLOSE: this.ELEMENT_MODAL_CLOSE,
          ELEMENT_MODAL_CLOSE_BUTTON: this.ELEMENT_MODAL_CLOSE_BUTTON,
          ELEMENT_MODAL_TITLE: this.ELEMENT_MODAL_TITLE,
          ELEMENT_MODAL_IFRAME_HOLDER: this.ELEMENT_MODAL_IFRAME_HOLDER,
          ELEMENT_MODAL_OPEN: this.ELEMENT_MODAL_OPEN,
          DATA: SOLO_CTA.data,
          IS_IE: true
        }),
        product = SOLO_CTA.product,
        parent = this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PRODUCT_HOLDER,
        environment = browser.options.desiredCapabilities.build,
        client = widget.init(browser, "[" + environment + "] Widget Analytics", this.ELEMENT_WIDGET_HOLDER, this.IFRAME_WIDGET, parent),
        expected = SOLO_CTA.analytics;

    widget
      .widgetTitle(this.ELEMENT_WIDGET, this.ELEMENT_WIDGET_TITLE, "Double wall insulated mug")
      .modalSanity(this.ELEMENT_MODAL, this.ELEMENT_FIRST_VIDEO, 'Double wall insulated mug', this.IFRAME_MODAL, true)
      // .productSanity(product, undefined, undefined, this.IFRAME_WIDGET, false)
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
      .analytics(this.IFRAME_WIDGET, ['ci','vv','vt', 'vtp'], expected[this.IFRAME_MODAL])

      .end();
  }

};
