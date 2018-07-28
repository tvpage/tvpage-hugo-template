/*=============================*/
/* Nightwatch Embed Automation */
/*=============================*/
var WIDGET = require(__dirname + "/../../../data/embed.js"),
    AUTO = require(__dirname + "/../../../lib/tvpGUITest.js");

module.exports = {

  'embed-analytics-1': function (browser) {

    var widget = AUTO.tvpGUITest({
          ELEMENT_MODAL_OVERLAY: WIDGET.HTML.ELEMENT_MODAL_OVERLAY,
          ELEMENT_MODAL_CLOSE: WIDGET.HTML.ELEMENT_MODAL_CLOSE,
          ELEMENT_MODAL_CLOSE_BUTTON: WIDGET.HTML.ELEMENT_MODAL_CLOSE_BUTTON,
          ELEMENT_MODAL_TITLE: WIDGET.HTML.ELEMENT_MODAL_TITLE,
          ELEMENT_MODAL_IFRAME_HOLDER: WIDGET.HTML.ELEMENT_MODAL_IFRAME_HOLDER,
          ELEMENT_MODAL_OPEN: WIDGET.HTML.ELEMENT_MODAL_OPEN,
          DATA: WIDGET.data,
          IS_IE: true
        }),
        parent = WIDGET.HTML.ELEMENT_VIDEO_CONTENT + " > " + WIDGET.HTML.ELEMENT_PLAYER_HOLDER,
        environment = browser.options.desiredCapabilities.build,
        client = widget.init(browser, "[" + environment + "] Widget Analytics", WIDGET.HTML.ELEMENT_WIDGET_HOLDER_1, WIDGET.HTML.IFRAME_WIDGET_1, parent),
        expected = WIDGET.analytics;

    // Test Youtube Embed
    widget
      .playerStartPause(WIDGET.HTML.IFRAME_WIDGET_1, WIDGET.HTML.ELEMENT_VIDEO_CONTENT + " > " + WIDGET.HTML.ELEMENT_PLAYER_HOLDER)
      .pause(WIDGET.time[WIDGET.HTML.IFRAME_WIDGET_1])
      .playerStartPause(WIDGET.HTML.IFRAME_WIDGET_1, WIDGET.HTML.ELEMENT_VIDEO_CONTENT + " > " + WIDGET.HTML.ELEMENT_PLAYER_HOLDER, false)
      .pause(5)
      .playerStartPause(WIDGET.HTML.IFRAME_WIDGET_1, WIDGET.HTML.ELEMENT_VIDEO_CONTENT + " > " + WIDGET.HTML.ELEMENT_PLAYER_HOLDER, false)
      .pause(WIDGET.time[WIDGET.HTML.IFRAME_WIDGET_1])
      .playerStartPause(WIDGET.HTML.IFRAME_WIDGET_1, WIDGET.HTML.ELEMENT_VIDEO_CONTENT + " > " + WIDGET.HTML.ELEMENT_PLAYER_HOLDER, false)
      .pause(5)

      .analytics(WIDGET.HTML.IFRAME_WIDGET_1, WIDGET.analytic_events[WIDGET.HTML.IFRAME_WIDGET_1], expected[WIDGET.HTML.IFRAME_WIDGET_1])
      .end();
  },

  'embed-analytics-2': function (browser) {

    var widget = AUTO.tvpGUITest({
          ELEMENT_MODAL_OVERLAY: WIDGET.HTML.ELEMENT_MODAL_OVERLAY,
          ELEMENT_MODAL_CLOSE: WIDGET.HTML.ELEMENT_MODAL_CLOSE,
          ELEMENT_MODAL_CLOSE_BUTTON: WIDGET.HTML.ELEMENT_MODAL_CLOSE_BUTTON,
          ELEMENT_MODAL_TITLE: WIDGET.HTML.ELEMENT_MODAL_TITLE,
          ELEMENT_MODAL_IFRAME_HOLDER: WIDGET.HTML.ELEMENT_MODAL_IFRAME_HOLDER,
          ELEMENT_MODAL_OPEN: WIDGET.HTML.ELEMENT_MODAL_OPEN,
          DATA: WIDGET.data,
          IS_IE: true
        }),
        parent = WIDGET.HTML.ELEMENT_VIDEO_CONTENT + " > " + WIDGET.HTML.ELEMENT_PLAYER_HOLDER,
        environment = browser.options.desiredCapabilities.build,
        client = widget.init(browser, "[" + environment + "] Widget Analytics", WIDGET.HTML.ELEMENT_WIDGET_HOLDER_2, WIDGET.HTML.IFRAME_WIDGET_2, parent),
        expected = WIDGET.analytics;

    // Test Uploaded Embed
    widget
      .playerStartPause(WIDGET.HTML.IFRAME_WIDGET_2, WIDGET.HTML.ELEMENT_VIDEO_CONTENT + " > " + WIDGET.HTML.ELEMENT_PLAYER_HOLDER)
      .pause(WIDGET.time[WIDGET.HTML.IFRAME_WIDGET_2])
      .playerStartPause(WIDGET.HTML.IFRAME_WIDGET_2, WIDGET.HTML.ELEMENT_VIDEO_CONTENT + " > " + WIDGET.HTML.ELEMENT_PLAYER_HOLDER, false)
      .pause(5)
      .playerStartPause(WIDGET.HTML.IFRAME_WIDGET_2, WIDGET.HTML.ELEMENT_VIDEO_CONTENT + " > " + WIDGET.HTML.ELEMENT_PLAYER_HOLDER, false)
      .pause(WIDGET.time[WIDGET.HTML.IFRAME_WIDGET_2])
      .playerStartPause(WIDGET.HTML.IFRAME_WIDGET_2, WIDGET.HTML.ELEMENT_VIDEO_CONTENT + " > " + WIDGET.HTML.ELEMENT_PLAYER_HOLDER, false)
      .pause(5)

      .analytics(WIDGET.HTML.IFRAME_WIDGET_2, WIDGET.analytic_events[WIDGET.HTML.IFRAME_WIDGET_2], expected[WIDGET.HTML.IFRAME_WIDGET_2])
      .end();
  }

};
