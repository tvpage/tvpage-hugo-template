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
          DATA: EMBED.data
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
          DATA: EMBED.data
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

/*==============================================================================*/
/* Nightwatch Recorder generated Mon Oct 23 2017 18:49:04 GMT-0700 (PDT) */
/*==============================================================================*/
/*
var DATA = {
  URL: "https://widgets.goodlookingbean.com/test/embed/",
  SLA: 10000
};

var aCounts = {
  'ci': 0,
  'vv': 0
};

var guiTest = {
  init: function (client, frameId) {
    client
      .url(DATA.URL)
      .pause(1000);

    if (frameId !== undefined)
      client.frame(frameId);

    return client
  },
  playVideo: function (client, loadTime) {
    client.click('#tvplayer-playbutton').pause(loadTime);
  },
  getParameterByName: function(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);

    if (!results) return null;
    if (!results[2]) return '';

    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },
  inArray : function(needle, haystack, isIndex) {
    var found = false;

    haystack.forEach(function(value, i) {
      if (needle == value) {
        found = (isIndex === true ? i : true);
      }
    });

    return found;
  },
  isNotEmpty: function(string){
    if(string.length > 0){
      return true;
    }
    return false;
  },
  analytics: function(client, frame, events, aData) {
    var tests = {
      'ci': function(client, src, current) {
        console.log(">>> Checking CI <<<");

        client.waitForElementVisible('p#analtyticsTestCI', 6000);
        client.expect.element('p#analtyticsTestCI').to.be.present;
        this.assert.equal(aCounts['ci'], 1);

        var li = guiTest.getParameterByName('li', src);
        this.assert.equal(li, aData.LOGIN_ID);

        var url = guiTest.getParameterByName('url', src);
        this.assert.equal(url, DATA.URL);

      },
      'vv': function(client, src, current) {
        console.log(">>> Checking VV <<<");

        var li = guiTest.getParameterByName('li', src);
        this.assert.equal(li, aData.LOGIN_ID);

        var url = guiTest.getParameterByName('url', src);
        this.assert.equal(url, DATA.URL);

        var pg = guiTest.getParameterByName('pg', src);
        this.assert.equal(pg, aData.CHANNEL_ID);

        var vd = guiTest.getParameterByName('vd', src);
        this.assert.equal(vd, aData.VIDS[current]);

        client.waitForElementPresent('p.analtyticsTestVV', 6000);
        client.expect.element('p.analtyticsTestVV').to.be.present;

        var vvs = guiTest.getParameterByName('vvs', src);
        this.assert.ok(vvs);

        var cid = guiTest.getParameterByName('cid', src);
        this.assert.ok(cid);

        DATA.vvs = vvs;
      }

    };

    client.frame(frame).elements("tag name", "script", function(result) {
      console.log(">>> Widget Analytics Testing <<<");

      result.value.forEach(function(script) {
        client.elementIdAttribute(script.ELEMENT, 'src', function(res) {
          var src = res.value,
              THAT = this;
          events.forEach(function (key, index) {
            if (src.indexOf('rt=' + key) >= 0) {
              var vd = guiTest.getParameterByName('vd', src),
                  current = guiTest.inArray(vd, aData.VIDS, true);

              aCounts[key]++;

              var test = tests[key].bind(THAT, client, src, current);
              test();
            }
          });
        });
      });
    });
  },
  getAnalyticCounts: function () {
    return aCounts;
  }

};

module.exports = {
  before : function (client) {
    client.windowMaximize();
  },
  'embed-desktop-youtube': function(client) {

    guiTest.init(client, 0);

    guiTest.playVideo(client, DATA.SLA);

    client.pause(10000);

    guiTest.analytics(client, 1, ['ci', 'vv'], {
      LOGIN_ID: 1758799,
      CHANNEL_ID: 0,
      VIDS: [83094532],
      COUNTS: {"ci": 1, "vv": 1}
    });

    client.end();
  }
};
*/