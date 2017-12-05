/*=============================*/
/* Nightwatch Embed Automation */
/*=============================*/
var EMBED = require(__dirname + "/../../../data/embed.js"),
    AUTO = require(__dirname + "/../../../lib/tvpGUITest.js");

module.exports = {
  ELEMENT_WIDGET_HOLDER_1: "div#video-wrapper-1",
  ELEMENT_WIDGET_HOLDER_2: "div#video-wrapper-2",
  ELEMENT_PLAYER_HOLDER: "div#player-el",
  ELEMENT_VIDEO_CONTENT: "div.player",
  IFRAME_WIDGET_1: 0,
  IFRAME_WIDGET_2: 1,

  'embed-analytics-1': function (browser) {

    var widget = AUTO.tvpGUITest({
          ELEMENT_MODAL_OVERLAY: this.ELEMENT_MODAL_OVERLAY,
          ELEMENT_MODAL_CLOSE: this.ELEMENT_MODAL_CLOSE,
          ELEMENT_MODAL_CLOSE_BUTTON: this.ELEMENT_MODAL_CLOSE_BUTTON,
          ELEMENT_MODAL_TITLE: this.ELEMENT_MODAL_TITLE,
          ELEMENT_MODAL_IFRAME_HOLDER: this.ELEMENT_MODAL_IFRAME_HOLDER,
          ELEMENT_MODAL_OPEN: this.ELEMENT_MODAL_OPEN,
          DATA: EMBED.data,
          IS_FF: true
        }),
        parent = this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER,
        environment = browser.options.desiredCapabilities.build,
        client = widget.init(browser, "[" + environment + "] Widget Analytics", this.ELEMENT_WIDGET_HOLDER_1, this.IFRAME_WIDGET_1, parent),
        expected = EMBED.analytics;

    // Test Youtube Embed
    widget
      .playerStartPause(this.IFRAME_WIDGET_1, this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER)
      .pause(EMBED.time[this.IFRAME_WIDGET_1])
      .playerStartPause(this.IFRAME_WIDGET_1, this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER, false)
      .pause(5)
      .playerStartPause(this.IFRAME_WIDGET_1, this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER, false)
      .pause(EMBED.time[this.IFRAME_WIDGET_1])
      .playerStartPause(this.IFRAME_WIDGET_1, this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER, false)
      .pause(5)

      .analytics(this.IFRAME_WIDGET_1, ['ci','vv','vt', 'vtp'], expected[this.IFRAME_WIDGET_1])
      .end();
  },

  'embed-analytics-2': function (browser) {

    var widget = AUTO.tvpGUITest({
          ELEMENT_MODAL_OVERLAY: this.ELEMENT_MODAL_OVERLAY,
          ELEMENT_MODAL_CLOSE: this.ELEMENT_MODAL_CLOSE,
          ELEMENT_MODAL_CLOSE_BUTTON: this.ELEMENT_MODAL_CLOSE_BUTTON,
          ELEMENT_MODAL_TITLE: this.ELEMENT_MODAL_TITLE,
          ELEMENT_MODAL_IFRAME_HOLDER: this.ELEMENT_MODAL_IFRAME_HOLDER,
          ELEMENT_MODAL_OPEN: this.ELEMENT_MODAL_OPEN,
          DATA: EMBED.data,
          IS_FF: true
        }),
        parent = this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER,
        environment = browser.options.desiredCapabilities.build,
        client = widget.init(browser, "[" + environment + "] Widget Analytics", this.ELEMENT_WIDGET_HOLDER_2, this.IFRAME_WIDGET_2, parent),
        expected = EMBED.analytics;

    // Test Uploaded Embed
    widget
      .playerStartPause(this.IFRAME_WIDGET_2, this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER)
      .pause(EMBED.time[this.IFRAME_WIDGET_2])
      .playerStartPause(this.IFRAME_WIDGET_2, this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER, false)
      .pause(5)
      .playerStartPause(this.IFRAME_WIDGET_2, this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER, false)
      .pause(EMBED.time[this.IFRAME_WIDGET_2])
      .playerStartPause(this.IFRAME_WIDGET_2, this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER, false)
      .pause(5)

      .analytics(this.IFRAME_WIDGET_2, ['ci','vv','vt', 'vtp'], expected[this.IFRAME_WIDGET_2])
      .end();
  }

};
