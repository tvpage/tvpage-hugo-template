/*============================*/
/* Nightwatch Solo Automation */
/*============================*/
var SOLO = require(__dirname + "/../../../solo/solo.js"),
    AUTO = require(__dirname + "/../../../lib/tvpGUITest.js");

module.exports = {
  ELEMENT_WIDGET_HOLDER: "div#solo-2-holder",
  ELEMENT_WIDGET: 'body',
  ELEMENT_WIDGET_TITLE: "div.tvp-cta-text",
  ELEMENT_MODAL_HOLDER: "div#tvp-modal-solo-2",
  ELEMENT_MODAL_OPEN: "div.video-image-icon",
  ELEMENT_MODAL: "div#tvp-modal-solo-2",
  ELEMENT_MODAL_CLOSE: "div#tvp-modal-close-solo-2",
  ELEMENT_MODAL_OVERLAY: "div#tvp-modal-overlay-solo-2",
  ELEMENT_MODAL_CLOSE_BUTTON: 'div#tvp-modal-close-solo-2',
  ELEMENT_MODAL_TITLE: 'h4#tvp-modal-title-solo-2',
  ELEMENT_MODAL_IFRAME_HOLDER: 'tvp-modal-iframe-holder-solo-2',
  ELEMENT_PLAYER_HOLDER: "div.player-holder",
  //ELEMENT_PRODUCT_HOLDER: "div.tvp-products-holder",
  ELEMENT_VIDEO_CONTENT: 'body',
  ELEMENT_FIRST_VIDEO: 'div.tvp-cta-overlay',

  IFRAME_WIDGET: 0,
  // IFRAME_MODAL: 1,

  'solo-analytics': function (browser) {

    var widget = AUTO.tvpGUITest({
          ELEMENT_MODAL_OVERLAY: this.ELEMENT_MODAL_OVERLAY,
          ELEMENT_MODAL_CLOSE: this.ELEMENT_MODAL_CLOSE,
          ELEMENT_MODAL_CLOSE_BUTTON: this.ELEMENT_MODAL_CLOSE_BUTTON,
          ELEMENT_MODAL_TITLE: this.ELEMENT_MODAL_TITLE,
          ELEMENT_MODAL_IFRAME_HOLDER: this.ELEMENT_MODAL_IFRAME_HOLDER,
          ELEMENT_MODAL_OPEN: this.ELEMENT_MODAL_OPEN,
          DATA: SOLO.data,
          IS_SAFARI: true
        }),
        product = SOLO.product,
        parent = this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER,
        environment = browser.options.desiredCapabilities.build,
        client = widget.init(browser, "[" + environment + "] Widget Analytics", this.ELEMENT_WIDGET_HOLDER, this.IFRAME_WIDGET, parent),
        expected =  SOLO.analytics;

    widget
      // .widgetTitle(this.ELEMENT_WIDGET, this.ELEMENT_WIDGET_TITLE, "Double wall insulated mug")
      // .modalSanity(this.ELEMENT_MODAL, this.ELEMENT_FIRST_VIDEO, 'Double wall insulated mug', this.IFRAME_WIDGET, true)
      // .productSanity(product, undefined, undefined, this.IFRAME_WIDGET, false)
      .pause(5)
      .playerStartPause(this.IFRAME_WIDGET, this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER)
      .pause(25)
      .playerStartPause(this.IFRAME_WIDGET, this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER)
      .pause(10)

      // Stopping video to stop triggering vt events
      .playerStartPause(this.IFRAME_WIDGET, this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER, false)
      .pause(5)
      .playerStartPause(this.IFRAME_WIDGET, this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER, false)
      .pause(15)
      .playerStartPause(this.IFRAME_WIDGET, this.ELEMENT_VIDEO_CONTENT + " > " + this.ELEMENT_PLAYER_HOLDER, false)
      .pause(5)

      // Checking CI events on Widget iframe
      // .analytics(this.IFRAME_WIDGET, ['ci'], expected[this.IFRAME_WIDGET])
      .analytics(this.IFRAME_WIDGET, ['ci','vv','vt', 'vtp'], expected[this.IFRAME_WIDGET])

      .end();
  }

};

/*==============================================================================*/
/* Nightwatch Recorder generated Mon Oct 23 2017 18:49:04 GMT-0700 (PDT) */
/*==============================================================================*/
/*
var DATA = {
      URL: "https://widgets.goodlookingbean.com/test/solo/",
      PRODUCT_HEADLINE: "Related Products",
      SLA: 10000,
      BROWSERHEIGHT: 1080,
      BROWSEWIDTH: 1920
    };

var widget = require(__dirname + "/../../../../lib/tvpGUITest.js");

module.exports = {
  widgetHolder: "div#solo-2-holder",
  widgetIFrameHolder: "div#tvp-modal-iframe-holder-solo-2",
  widgetIframeId: 'div#solo-2',
  playerIframId: 'div#solo-2',
  widgetTitleId: "h3#widget-title",
  widgetNavHolder: "div#videos div.slick-solo.slick-initialized.slick-slider",
  widgetNavPrev: "button.slick-prev ",
  widgetNavNext: "button.slick-next",
  PLAY_BUTTON: "div.video-image-icon",
  modalId: "div#tvp-modal-solo-2",
  modalCloseId: "div#tvp-modal-close-solo-2",
  modalOverlay: "div#tvp-modal-overlay-solo-2",
  playerHolder: "div.tvp-player-holder",
  productHolder: "div#featured-product",
  firstVideoId: 'div[data-slick-index="0"]',
  modalCloseButton: 'tvp-modal-close-solo-2',
  modalTitle: 'tvp-modal-title-solo-2',
  modalIframeHolder: 'tvp-modal-iframe-holder-solo-2',

  // 'solo-youtube-sanity': function (browser) {
  //   var solo = widget.tvpGUITest({
  //         'modalOverlay': this.modalOverlay,
  //         'modalCloseId': this.modalCloseId,
  //         'DATA': DATA
  //       }),
  //       parent = this.widgetIframeId + " > " + this.productHolder;
  //       client = solo.init(browser, "Carousel Widget Normal", "div#solo-1-holder", 0, this.widgetIframeId + " > " + this.productHolder);

  //   solo.widgetTitle(this.widgetIframeId, this.widgetTitleId, "Recommended Videos"),
  //   solo.widgetNav(this.widgetIframeId, 16),
  //   solo.modalSanity(this.modalId, this.firstVideoId),
  //   solo.modalLoadPerformance(this.widgetIFrameHolder, this.firstVideoId, this.widgetIframeId + " > " + this.playerHolder, 2),
  //   solo.productModal(),
  //   solo.productModalLink(),
  //   solo.analytics(2);
  //   solo.end();
  // },

  // 'solo-youtube-player': function (browser) {
  //   var solo = widget.tvpGUITest({
  //         'modalOverlay': this.modalOverlay,
  //         'modalCloseId': this.modalCloseId,
  //         'DATA': DATA
  //       }),
  //       client = solo.init(browser, "Carousel Youtube Player Normal", "div#solo-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

  //   solo.modalLoad(this.firstVideoId, 160, 100),
  //   solo.playerLoadPerformance(2),
  //   solo.playerSanity(),
  //   // solo.playerSkip(50),
  //   // solo.playerSkip(150),
  //   // solo.playerSkip(260),
  //   solo.pause(10),

  //   // check for video finish playing and check for new video is playing
  //   // solo.playerCheckPlaying(true),
  //   solo.modalClose(this.modalId), // testing close modal

  //   // // Move to solo iframe
  //   // solo.iframe(0),

  //   // solo.modalLoad(this.firstVideoId, 160, 100),
  //   // solo.playerLoadPerformance(2),
  //   // solo.playerSanity(),
  //   solo.analytics(2);
  //   solo.end();
  // },

  // // 'caousel-youtube-player-fullscreen': function (browser) {
  // //   var solo = widget.tvpGUITest({
  // //         'modalOverlay': this.modalOverlay,
  // //         'modalCloseId': this.modalCloseId,
  // //         'DATA': DATA
  // //       }),
  // //       client = solo.init(browser, "Carousel Youtube Player Fullscreen", "div#solo-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

  // //   solo.modalLoad('div[data-slick-index="2"]', 160, 100),
  // //   solo.playerLoadPerformance(2),
  // //   solo.playerStart(),
  // //   solo.playerCheckFullScreen(),
  // //   solo.playerSkip(250),
  // //   solo.playerSkip(750),
  // //   solo.playerSkip(1030),
  // //   solo.pause(10),

  // //   // checking for next loaded video sanity
  // //   solo.playerCheckPlaying(true),
  // //   solo.pause(2),

  // //   // Starting secound video
  // //   solo.playerStart();
  // //   solo.end();
  // // },

  // 'solo-youtube-resize': function (browser) {
  //   var solo = widget.tvpGUITest({
  //         'modalOverlay': this.modalOverlay,
  //         'modalCloseId': this.modalCloseId,
  //         'DATA': DATA
  //       }),
  //       client = solo.init(browser, "Carousel Youtube Player Normal", "div#solo-1-holder", 0, this.widgetIframeId + " > " + this.playerHolder);

  //   solo.modalLoad(this.firstVideoId, 160, 100),
  //   client.resizeWindow(1440/2, 1200),
  //   client.frameParent(),
  //   client
  //     .waitForElementVisible(this.modalId, 5000),
  //   client.expect.element(this.modalId).to.have.css('width', 700),
  //   client.frame(2)
  //   client.resizeWindow(1440/3, 1200),
  //   client.frameParent(),
  //   client
  //     .waitForElementVisible(this.modalId, 5000),
  //   client.expect.element(this.modalId).to.have.css('width', 480);
  //   solo.end();
  // },

  'solo-youtube-sanity-analytics': function (browser) {
    var solo = widget.tvpGUITest({
          'modalOverlay': this.modalOverlay,
          'modalCloseId': this.modalCloseId,
          'modalCloseButton': this.modalCloseButton,
          'modalTitle': this.modalTitle,
          'modalIframeHolder': this.modalIframeHolder,
          'widgetNavHolder': this.widgetNavHolder,
          'widgetNavPrev': this.widgetNavPrev,
          'widgetNavNext': this.widgetNavNext,
          'PLAY_BUTTON': this.PLAY_BUTTON,
          'DATA': DATA,
          'isFF': true
        }),
        parent = this.playerIframId;
        client = solo.init(browser, "Solo-CTA Widget Analytics", "div#solo-2-holder", undefined, "");

    //solo.widgetTitle(this.widgetIframeId, this.widgetTitleId, "Double wall insulated mug");
    //solo.widgetNav(this.widgetIframeId, 12),
    //solo.modalSanity(this.modalId, this.firstVideoId, 'Double wall insulated mug'),
    //solo.modalLoadPerformance(this.widgetIFrameHolder, this.firstVideoId, this.playerIframId + " > " + this.playerHolder, 1);
    client
      .waitForElementVisible(this.widgetHolder + " div.tvp-cta-overlay", DATA.SLA)
      .click("div.tvp-cta-overlay")
      .frame(0);

    // var product = {
    //     "ID": 83102933,
    //     "URL": "http://www.gourmia.com/item.asp?item=10096",
    //     "SECURE_URL": "http://http://www.gourmia.com/item.asp?item=10096",
    //     "TITLE_REGEX": /Gourmia\ GDK380\ Multi\ Function\ Digital\ Tea\ Kettle,\ \.\.\./i,
    //     "IMG": "http://www.gourmia.com/itemimageslarge/GDK380-Small.png",
    //     "PRICE": "$199.99"
    //   };

    // solo.productModal(false, product, "a[data-id='83102933']"),
    // client.windowHandles(function (result) {
    //   this.switchWindow(result.value[1]),
    //   this.closeWindow(),
    //   this.switchWindow(result.value[0]),
    //   this.frame(0);
    // });

    // product = {
    //     "ID": 83102933,
    //     "URL": "http://www.gourmia.com/item.asp?item=10096",
    //     "SECURE_URL": "http://http://www.gourmia.com/item.asp?item=10096",
    //     "TITLE_REGEX": /Gourmia\ GDK380\ Multi\ Function\ Digital\ Tea\ Kettle,\ \.\.\./i,
    //     "IMG": "http://www.gourmia.com/itemimageslarge/GDK380-Small.png",
    //     "PRICE": "$199.99"
    //   }

    //solo.productModalLink(),
    solo.playerStart(70, 70, this.playerIframId + " " + this.playerHolder)
    solo.pause(15);
    //solo.productModal(false, product),
    // client.windowHandles(function (result) {
    //   this.switchWindow(result.value[1]),
    //   this.closeWindow(),
    //   this.switchWindow(result.value[0]),
    //   this.frame(1);
    // }),
    solo.playerStart(70, 70, this.playerIframId + " " + this.playerHolder),
    solo.pause(5);
    solo.analytics(0, ['ci','vv'], {
      LOGIN_ID: 1758799,
      CHANNEL_ID: 66133904,
      VIDS: [65981962,83106081],
      COUNTS: {"ci": 2, "vv": 2}
    }),
    solo.pause(10),
    solo.end();
  }
};
*/
/*==============================================================================*/
/* Nightwatch Recorder generated Mon Oct 23 2017 18:49:04 GMT-0700 (PDT) */
/*==============================================================================*/
/*
var DATA = {
  URL: "https://widgets.goodlookingbean.com/test/solo/",
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
        // TODO: enable cid when the issue is fixed
        // var cid = guiTest.getParameterByName('cid', src);
        // this.assert.ok(cid);
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
  'solo-desktop-youtube': function(client) {

    guiTest.init(client, 0);

    guiTest.playVideo(client, DATA.SLA);

    client.pause(10000);

    guiTest.playVideo(client, DATA.SLA);

    guiTest.analytics(client, 1, ['ci', 'vv'], {
      LOGIN_ID: 1758799,
      CHANNEL_ID: 66133904,
      VIDS: [65981962,83106081],
      COUNTS: {"ci": 2, "vv": 2}
    });

    client.end();
  }
};
*/