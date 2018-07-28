/*==============================*/
/* Nightwatch Inline Automation */
/*==============================*/
var WIDGET = require(__dirname + "/../../../data/inline.js"),
    AUTO = require(__dirname + "/../../../lib/tvpGUITest.js");

module.exports = {

  'inline-analytics': function (browser) {

    var widget = AUTO.tvpGUITest({
          ELEMENT_MODAL_OVERLAY: WIDGET.ELEMENT_MODAL_OVERLAY,
          ELEMENT_MODAL_CLOSE: WIDGET.ELEMENT_MODAL_CLOSE,
          ELEMENT_MODAL_CLOSE_BUTTON: WIDGET.ELEMENT_MODAL_CLOSE_BUTTON,
          ELEMENT_MODAL_TITLE: WIDGET.ELEMENT_MODAL_TITLE,
          ELEMENT_MODAL_IFRAME_HOLDER: WIDGET.ELEMENT_MODAL_IFRAME_HOLDER,
          ELEMENT_MODAL_OPEN: WIDGET.ELEMENT_MODAL_OPEN,
          DATA: WIDGET.data,
          IS_SAFARI: true
        }),
        product = WIDGET.product,
        parent = WIDGET.ELEMENT_VIDEO_CONTENT,
        environment = browser.options.desiredCapabilities.build,
        client = widget.init(browser, "[" + environment + "] Widget Analytics", WIDGET.ELEMENT_WIDGET_HOLDER, WIDGET.IFRAME_WIDGET, parent),
        expected = WIDGET.analytics;

    widget
      .widgetTitle(WIDGET.ELEMENT_WIDGET, WIDGET.ELEMENT_WIDGET_TITLE, "Double wall insulated mug")
      .productSanity(product, WIDGET.ELEMENT_PRODUCT_HOLDER, undefined, WIDGET.IFRAME_WIDGET, false)
      .pause(5)
      .playerStartPause(WIDGET.IFRAME_WIDGET, WIDGET.ELEMENT_VIDEO_CONTENT + " " + WIDGET.ELEMENT_PLAYER_HOLDER)
      .pause(25)
      .playerStartPause(WIDGET.IFRAME_WIDGET, WIDGET.ELEMENT_VIDEO_CONTENT + " " + WIDGET.ELEMENT_PLAYER_HOLDER)
      .pause(10)

      // Stopping video to stop triggering vt events
      .playerStartPause(WIDGET.IFRAME_WIDGET, WIDGET.ELEMENT_VIDEO_CONTENT + " " + WIDGET.ELEMENT_PLAYER_HOLDER, false)
      .pause(5)
      .playerStartPause(WIDGET.IFRAME_WIDGET, WIDGET.ELEMENT_VIDEO_CONTENT + " " + WIDGET.ELEMENT_PLAYER_HOLDER, false)
      .pause(15)
      .playerStartPause(WIDGET.IFRAME_WIDGET, WIDGET.ELEMENT_VIDEO_CONTENT + " " + WIDGET.ELEMENT_PLAYER_HOLDER, false)
      .pause(5)

      .analytics(WIDGET.IFRAME_WIDGET, WIDGET.analytic_events[WIDGET.IFRAME_WIDGET], expected[WIDGET.IFRAME_WIDGET])
      .end();
  }

};
