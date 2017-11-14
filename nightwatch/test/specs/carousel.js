/*==============================================================================*/
/* Nightwatch Recorder generated Mon Oct 23 2017 18:49:04 GMT-0700 (PDT) */
/*==============================================================================*/
var URL = "https://www.goodlookingbean.com/test/carousel/",
    PRODUCT_URL = "http://www.ninjakitchen.com/products/0/all/67/ninja-coffee-bar-with-glass-carafe/",
    PRODUCT_SECURE_URL = "https://www.ninjakitchen.com/products/0/all/67/ninja-coffee-bar-with-glass-carafe/",
    PRODUCT_IMG = "http://www.ninjakitchen.com/include/images/products/hero-CF080.jpg",
    ONE_SEC = 1000,
    SLA = 2*ONE_SEC;

var GUITest = function () {
    var client, targetIframeId, sla;

    return {
      init: function (browser, url, id, count, time) {
        client = browser.url(url);
        targetIframeId = count;

        if (time !== undefined)
          sla = time;
        else
          sla = SLA;

        client.waitForElementPresent(id + " iframe[gesture=media]", sla);

        if (count !== undefined)
          client.frame(targetIframeId);

        client.pause(sla);

        return client;
      },
      widgetTitle: function (iframeId, target, expected, type) {
        if (type === undefined)
          type = 'css selector';

        client.element(type)
          .waitForElementPresent(iframeId, sla)
          .waitForElementPresent(iframeId + " > " + target, sla);

        this.text(iframeId + " > " + target, expected);
      },
      widgetNav: function (iframeId, count) {
        var index = 1;

        client.element('css selector')
          .waitForElementPresent(iframeId + " > div.tvp-carousel-content.slick-initialized.slick-slider", sla);

        client.element('css selector')
          .waitForElementPresent(iframeId + " > div.tvp-carousel-arrow.prev.inactive", sla)
          .waitForElementPresent(iframeId + " > div.tvp-carousel-arrow.next", sla);

        for (i=0;i < count;i++) {
          client.element('css selector')
            .moveToElement(iframeId + " > div.tvp-carousel-arrow.next", 20, 20)
            .mouseButtonClick('left')
            .pause(ONE_SEC);

          index++;
          client.expect.element("div[data-slick-index='" + i + "']").to.have.attribute('aria-hidden').which.equals('true');
        }

        for (i=0;i < count;i++) {
          client.element('css selector')
            .moveToElement(iframeId + " > div.tvp-carousel-arrow.prev", 20, 20)
            .mouseButtonClick('left')
            .pause(ONE_SEC);

          client.expect.element("div[data-slick-index='" + index-- + "']").to.have.attribute('aria-hidden').which.equals('false');
        }
      },
      modalLoad: function (target, x, y) {
        client
          .waitForElementPresent(target, sla)
          .moveToElement(target, x, y)
          .mouseButtonClick('left')
          .frameParent();

        client.pause(ONE_SEC);
      },
      modalSanity: function (parent) {
        this.modalLoad('div[data-slick-index="0"]', 160, 100);

        client
          .waitForElementPresent('div#tvp-modal-overlay-carousel-1', sla)
          .waitForElementPresent('div#tvp-modal-carousel-1', sla)
          .pause(ONE_SEC);

        client.expect.element(parent + ' h4#tvp-modal-title-carousel-1').text.to.equal("Galette des Rois Recipe for De'Longhi MultiFry");
        client.expect.element(parent + ' div#tvp-modal-close-carousel-1').to.be.present;
        client.expect.element(parent + ' div.tvp-products-headline').text.to.equal("Related Products");

        client.pause(ONE_SEC);
      },
      modalLoadPerformance: function (parent, target) {
        targetIframeId = 2;

        client
          .waitForElementPresent(parent, sla)
          .waitForElementPresent(parent + " iframe.tvp-iframe-modal[gesture='media']", sla)
          .frame(targetIframeId),

        client.expect.element(target).to.be.present;
        client.expect.element(target + " div#tvplayer-playbutton").to.be.present;
        client.expect.element(target + " div#tvplayer-playbutton-icon").to.be.present;

        client.pause(ONE_SEC);
      },
      modalClose: function (parent) {
        client.frameParent();

        client.element('css selector')
          .waitForElementPresent(parent + " div#tvp-modal-close-carousel-1", sla)
          .moveToElement(parent + " div#tvp-modal-close-carousel-1", 10, 10)
          .mouseButtonClick("left");

        client.expect.element("div#tvp-modal-overlay-carousel-1").to.have.css('display', 'hidden');
        client.expect.element(parent).to.have.css('display', 'none');

        client.pause(ONE_SEC);
      },
      productModal: function (parent) {
        client.waitForElementPresent(parent, sla);

        client.expect.element(parent + " a#tvp-product-83102610").to.be.present;
        client.expect.element(parent + " a#tvp-product-83102610").to.have.attribute('href', PRODUCT_URL);

        // Product pop-up
        client
          .moveToElement(parent + " a#tvp-product-83102610", 70, 70)
          .pause(2*ONE_SEC);

        client.expect.element(parent + " a#tvp-product-83102610").to.have.attribute('class', 'tvp-product active');
        client.expect.element(parent + " a#tvp-product-popup-83102610").to.be.present;
        client.expect.element(parent + " a#tvp-product-popup-83102610").to.have.attribute('href', PRODUCT_URL);
        client.expect.element(parent + " div.tvp-inner-arrow-indicator").to.be.present;
        client.expect.element(parent + " a#tvp-product-popup-83102610 > div.tvp-product-popup-image").to.have.css("background-image", "url(" + PRODUCT_IMG + ");");
        client.expect.element(parent + " a#tvp-product-popup-83102610 > p.tvp-product-title").text.to.match(/Ninja\ Coffee\ Bar®\ with\ Glass\ Carafe/i);
        client.expect.element(parent + " a#tvp-product-popup-83102610 > p.tvp-product-price").text.to.equal("");
        client.expect.element(parent + " a#tvp-product-popup-83102610 > button.tvp-product-cta").to.be.present;

        client.pause(ONE_SEC);
      },
      productModalLink: function (parent) {
        // Click on product from modal
        client
          .moveToElement(parent + " a#tvp-product-83102610", 70, 70)
          .pause(2*ONE_SEC)
          .mouseButtonClick("left")
          .windowHandles(function (result) {
            this.switchWindow(result.value[1]);
            this.verify.urlContains(PRODUCT_SECURE_URL);
            this.closeWindow();

            this.switchWindow(result.value[0]);
            this.waitForElementPresent("div#tvp-modal-iframe-holder-carousel-1", sla);
            this.waitForElementPresent("iframe.tvp-iframe-modal[gesture='media']", sla);
            this.frame(targetIframeId);
          })
          .pause(5*ONE_SEC);

        // Click on product from pop-up thumnail
        client
          .moveToElement(parent + " a#tvp-product-83102610", 70, 70)
          .moveToElement(parent + " a#tvp-product-popup-83102610 > div.tvp-product-popup-image", 105, 105)
          .pause(2*ONE_SEC)
          .mouseButtonClick("left")
          .pause(2*ONE_SEC)
          .windowHandles(function (result) {
            this.switchWindow(result.value[1]);
            this.verify.urlContains(PRODUCT_SECURE_URL);
            this.closeWindow();

            this.switchWindow(result.value[0]);
            this.waitForElementPresent("div#tvp-modal-iframe-holder-carousel-1", sla);
            this.waitForElementPresent("iframe.tvp-iframe-modal[gesture='media']", sla);
            this.frame(targetIframeId);
          })
          .pause(5*ONE_SEC);

        // Click on product from pop-up title
        client
          .moveToElement(parent + " a#tvp-product-83102610", 70, 70)
          .moveToElement(parent + " a#tvp-product-popup-83102610 > p.tvp-product-title", 40, 20)
          .pause(2*ONE_SEC)
          .mouseButtonClick("left")
          .pause(2*ONE_SEC)
          .windowHandles(function (result) {
            this.switchWindow(result.value[1]);
            this.verify.urlContains(PRODUCT_SECURE_URL);
            this.closeWindow();

            this.switchWindow(result.value[0]);
            this.waitForElementPresent("div#tvp-modal-iframe-holder-carousel-1", sla);
            this.waitForElementPresent("iframe.tvp-iframe-modal[gesture='media']", sla);
            this.frame(targetIframeId);
          })
          .pause(5*ONE_SEC);

        // Click on product from pop-up cta
        client
          .moveToElement(parent + " a#tvp-product-83102610", 70, 70)
          .moveToElement(parent + " a#tvp-product-popup-83102610 > button.tvp-product-cta", 40, 20)
          .pause(2*ONE_SEC)
          .mouseButtonClick("left")
          .pause(2*ONE_SEC)
          .windowHandles(function (result) {
            this.switchWindow(result.value[1]);
            this.verify.urlContains(PRODUCT_SECURE_URL);
            this.closeWindow();

            this.switchWindow(result.value[0]);
            this.waitForElementPresent("div#tvp-modal-iframe-holder-carousel-1", sla);
            this.waitForElementPresent("iframe.tvp-iframe-modal[gesture='media']", sla);
            this.frame(targetIframeId);
          })
          .pause(5*ONE_SEC);
      },
      playerLoadPerformance: function (parent, count) {
        targetIframeId = count;

        if (count !== undefined)
          client.frame(targetIframeId);

        client.element('css selector')
          .waitForElementPresent(parent + " div#tvplayer-playbutton", sla)
          .waitForElementPresent(parent + " div#ControlBarFloater", sla);

        // sanity check
        client.expect.element(parent + " #ControlBarFloater > div.tvp-control-volume-container").to.be.present;
        client.expect.element(parent + " #ControlBarFloater > div.tvp-control-volume-container > div.tvp-control-volume-selector-container").to.be.present;
        client.expect.element(parent + " #ControlBarFloater > div.tvp-control-volume-container").to.be.present;
        client.expect.element(parent + " #CtrlClosedCaptionImage").to.be.present;

        // tvplayer icon check
        client.expect.element(parent + " #tvplayer-playbutton-icon").to.be.present;
        client.pause(ONE_SEC);
      },
      playerSanity: function (parent) {
        client
          .waitForElementPresent(parent + ' #tvplayer-playbutton-icon', sla)
          .expect.element(parent + " #tvplayer-playbutton-icon").to.be.present;

        client
          .click(parent + ' #tvplayer-playbutton')
          .waitForElementPresent(parent + " #tvp-spinner", sla);

        client.expect.element(parent + ' #tvp-spinner').to.have.css('display').which.equals('none');
        client.expect.element(parent + ' #tvplayer-playbutton-icon').not.to.be.present;

        client
          .waitForElementPresent(parent + ' #ControlBarFloater > div.tvp-control-playpause', sla)
          .click(parent + ' #ControlBarFloater > div.tvp-control-playpause')
          .pause(sla);

        client
          .moveToElement(parent + ' #CtrlTime', 10, 10)
          .pause(sla);

        this.playerTime(parent, undefined, "00:00 / 01:23");
      },
      playerFullScreen: function (parent) {
        client
          .click(parent + " div.tvp-control-fullscreen.tvp-controlbar-icon");
        client.expect.element('.tvp-control-fullscreen > .tvp-controlbar-svg path:nth-child(2)').to.have.attribute('d', "M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z");
      },
      playerSkip: function (parent, skip) {
        client.element('css selector')
          .moveToElement(parent + ' #ControlBarFloater > div.tvp-parent-seekbar', 0, 20)
          .pause(ONE_SEC);

        client.expect.element('#ControlBarFloater > div.tvp-parent-seekbar > div.tvp-progress-bar').to.have.css('display').which.not.equals('none');
        
        client.element('css selector')
          .moveToElement(parent + ' #ControlBarFloater > div.tvp-parent-seekbar', skip, 20)
          .mouseButtonClick('left')
          .pause(ONE_SEC);

        this.playerTime(parent, "00:00:00 / 01:23");
        this.playerTime(parent);

        client.expect.element(parent + ' #ControlBarFloater > div.tvp-control-playpause').to.have.css('display').which.not.equals('none');
        client.expect.element(parent + ' #ControlBarFloater > div.tvp-control-fullscreen').to.have.css('display').which.not.equals('none');

        client.pause(ONE_SEC);
      },
      playerCheckPlaying: function (parent, isPlaying) {
        if (isPlaying === undefined)
          isPlaying = true;

        client.expect.element(parent + ' #tvp-spinner').to.have.css('display').which.equals('none');

        if (isPlaying === true) {
          client.expect.element(parent + ' #tvplayer-playbutton-icon').to.not.be.present;
          client.expect.element(parent + ' #tvplayer-playbutton').to.not.be.present;
        } else {
          client.expect.element(parent + ' #tvplayer-playbutton-icon').to.be.present;
          client.expect.element(parent + ' #tvplayer-playbutton').to.be.present;      
        }
      },
      playerTime: function (parent, notEqual) {
        var THAT = this;

        client.element('css selector')
          .waitForElementPresent(parent + ' #CtrlTime', sla)
          .getText(parent + " #CtrlTime", function (result) {
            this.assert.equal(typeof result, "object");
            this.assert.equal(result.status, 0);

            if (notEqual === undefined)
              THAT.text(parent + ' #CtrlTime', result.value);
            else
              this.assert.notEqual(result.value, notEqual);
          });
      },
      text: function (selector, expected, type) {
        if (type === undefined)
          type = 'css selector';

        client.element(type)
          .getText(selector, function (result) {
              this.assert.equal(typeof result, "object");
              this.assert.equal(result.status, 0);
              this.assert.equal(result.value, expected);
          });
      },
      iframe: function (count) {
        targetIframeId = count;
        client.frame(targetIframeId);
      },
      keys: function (key, callback) {
        client.keys(key, callback);
      },
      pause: function (time) {
        if (time === undefined)
          time = sla;

        client.pause(time);
      },
      end: function () {
        client.end();
      }
    };
};

module.exports = {
  widgetHolder: "div#carousel-1-holder",
  widgetIFrameHolder: "div#tvp-modal-iframe-holder-carousel-1",
  widgetIframeId: 'div#carousel-1',
  widgetTitleId: "div.tvp-carousel-title",
  modalId: "div#tvp-modal-carousel-1",
  playerHolder: "div.tvp-player-holder",
  productHolder: "div.tvp-products-holder",
  firstVideoId: 'div[data-slick-index="0"]',
  beforeEach: function (browser, done) {
    browser.resizeWindow(1440, 900);
  },
  'carousel-youtube-sanity': function (browser) {
    var carousel = new GUITest(),
        client = carousel.init(browser, URL, "div#carousel-1-holder", 0),
        parent = this.widgetIframeId + " > " + this.productHolder;

    carousel.widgetTitle(this.widgetIframeId, this.widgetTitleId, "Recommended Videos"),
    carousel.widgetNav(this.widgetIframeId, 16),
    carousel.modalSanity(this.modalId),
    carousel.modalLoadPerformance(this.widgetIFrameHolder, this.widgetIframeId),
    carousel.productModal(parent),
    carousel.productModalLink(parent),

    client.end();
  },
  'carousel-youtube-player': function (browser) {
    var carousel = new GUITest(),
        parent = this.widgetIframeId + " > " + this.playerHolder;

    client = carousel.init(browser, URL, "div#carousel-1-holder", 0),

    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(parent, 2),
    carousel.playerSanity(parent),
    carousel.playerSkip(parent, 130),
    carousel.playerSkip(parent, 190),
    carousel.playerSkip(parent, 280),
    carousel.pause(2*ONE_SEC),
    carousel.playerTime(parent, "01:16 / 01:23"),
    carousel.playerCheckPlaying(parent),
    carousel.pause(6*ONE_SEC), // waiting to finish current video

    // check for video finish playing and check for new video is playing
    carousel.playerCheckPlaying(parent, false),
    carousel.modalClose(this.modalId), // testing close modal

    // Move to carousel iframe
    carousel.iframe(0),

    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(parent, 2),
    carousel.playerSanity(parent),

Window Resize Testing
    client.resizeWindow(1440/2, 1200),
    client.frameParent(),
    client
      .waitForElementPresent(this.modalId, SLA),
    client.expect.element(this.modalId).to.have.css('width', 700),
    client.frame(2)
    client.resizeWindow(1440/3, 1200),
    client.frameParent(),
    client
      .waitForElementPresent(this.modalId, SLA),
    client.expect.element(this.modalId).to.have.css('width', 480),
    client.frame(2)
    client.pause(2*ONE_SEC),
//    carousel.playerFullScreen(parent),
//    carousel.playerSkip(parent, 400),
    carousel.end();
  }, */
/*  'caousel-youtube-player-fullscreen': function (browser) {
    browser.url(URL)
      .waitForElementPresent(this.widgetHolder + " iframe[gesture=media]", SLA)
      .pause(SLA)
      .frame(0)
      .click(this.widgetIframeId + " " + this.firstVideoId)
      .pause(SLA)
      .frameParent()
      .waitForElementPresent(this.modalId + " div.tvp-modal-content", SLA)
      .pause(SLA)
      .frame(2)
      .pause(SLA)
      .click(this.widgetIframeId + " > " + this.playerHolder + " div#tvplayer-playbutton")
      .pause(SLA)
      .moveToElement(this.widgetIframeId + " > " + this.playerHolder + " .tvp-control-overlay", 18, 18)
      .moveToElement(this.widgetIframeId + " > " + this.playerHolder + " .tvp-control-fullscreen", 18, 18)
      .click(this.widgetIframeId + " > " + this.playerHolder + " .tvp-control-fullscreen")
      .pause(10000)
      .end();
  }
*/
};