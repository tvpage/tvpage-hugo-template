/*============================*/
/* Nightwatch Solo Automation */
/*============================*/
var WIDGET = require(__dirname + "/../../../data/solo.js"),
    AUTO = require(__dirname + "/../../../lib/tvpGUITest.js");

module.exports = {

  'solo-analytics': function (browser) {

    var widget = AUTO.tvpGUITest({
          ELEMENT_MODAL_OVERLAY: WIDGET.HTML.ELEMENT_MODAL_OVERLAY,
          ELEMENT_MODAL_CLOSE: WIDGET.HTML.ELEMENT_MODAL_CLOSE,
          ELEMENT_MODAL_CLOSE_BUTTON: WIDGET.HTML.ELEMENT_MODAL_CLOSE_BUTTON,
          ELEMENT_MODAL_TITLE: WIDGET.HTML.ELEMENT_MODAL_TITLE,
          ELEMENT_MODAL_IFRAME_HOLDER: WIDGET.HTML.ELEMENT_MODAL_IFRAME_HOLDER,
          ELEMENT_MODAL_OPEN: WIDGET.HTML.ELEMENT_MODAL_OPEN,
          DATA: WIDGET.data,
          IS_EDGE: true
        }),
        product = WIDGET.product,
        parent = WIDGET.HTML.ELEMENT_VIDEO_CONTENT + " > " + WIDGET.HTML.ELEMENT_PLAYER_HOLDER,
        environment = browser.options.desiredCapabilities.build,
        client = widget.init(browser, "[" + environment + "] Widget Analytics", WIDGET.HTML.ELEMENT_WIDGET_HOLDER, WIDGET.HTML.IFRAME_WIDGET, parent),
        expected =  WIDGET.analytics;

    widget
      .pause(5)
      .playerStartPause(WIDGET.HTML.IFRAME_WIDGET, WIDGET.HTML.ELEMENT_VIDEO_CONTENT + " > " + WIDGET.HTML.ELEMENT_PLAYER_HOLDER)
      .pause(25)
      .playerStartPause(WIDGET.HTML.IFRAME_WIDGET, WIDGET.HTML.ELEMENT_VIDEO_CONTENT + " > " + WIDGET.HTML.ELEMENT_PLAYER_HOLDER)
      .pause(10)

      // Stopping video to stop triggering vt events
      .playerStartPause(WIDGET.HTML.IFRAME_WIDGET, WIDGET.HTML.ELEMENT_VIDEO_CONTENT + " > " + WIDGET.HTML.ELEMENT_PLAYER_HOLDER, false)
      .pause(5)
      .playerStartPause(WIDGET.HTML.IFRAME_WIDGET, WIDGET.HTML.ELEMENT_VIDEO_CONTENT + " > " + WIDGET.HTML.ELEMENT_PLAYER_HOLDER, false)
      .pause(15)
      .playerStartPause(WIDGET.HTML.IFRAME_WIDGET, WIDGET.HTML.ELEMENT_VIDEO_CONTENT + " > " + WIDGET.HTML.ELEMENT_PLAYER_HOLDER, false)
      .pause(5)

      // Checking CI events on Widget iframe
      .analytics(WIDGET.HTML.IFRAME_WIDGET, WIDGET.analytic_events[WIDGET.HTML.IFRAME_WIDGET], expected[WIDGET.HTML.IFRAME_WIDGET])

      .end();
  }

};
