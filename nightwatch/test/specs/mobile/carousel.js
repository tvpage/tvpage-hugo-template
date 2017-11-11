/*==============================================================================*/
/* Nightwatch Recorder generated Mon Oct 23 2017 18:49:04 GMT-0700 (PDT) */
/*==============================================================================*/

var URL = "https://www.goodlookingbean.com/test/carousel/",
    PRODUCT_URL = "http://www.ninjakitchen.com/products/0/all/67/ninja-coffee-bar-with-glass-carafe/",
    PRODUCT_SECURE_URL = "https://m.ninjakitchen.com/products/0/all/67/ninja-coffee-bar-with-glass-carafe/",
    PRODUCT_IMG = "http://www.ninjakitchen.com/include/images/products/hero-CF080.jpg",
    PRODUCT_HEADLINE = "Related Products",
    FIRST_VIDEO_TITLE = "Galette des Rois Recipe for De'Longhi MultiFry",
    SECOUND = 1000,
    SLA = 5*SECOUND;

var tvpGUITest = function (options) {
    var client, targetIframeId, sla, parent, msg
        isPlaying = false,
        isFullScreen = false,
        isMobile = (options !== undefined && options.isMobile ? options.isMobile : false),
        debug = false;

    var log = function (result) {
      if (debug === true) {
        console.log(">> DEBUG: <<");
        console.log(result);
      }

      if (msg !== undefined && msg !== "")
        console.log(">> " + msg + " <<");

      msg = undefined;
    };

    return {
      ICON_DEFAULT_SCREEN: "M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z",
      ICON_FULL_SCREEN: "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z",
      ICON_PLAYING: "M8 5v14l11-7z",
      ICON_PAUSE: "M6 19h4V5H6v14zm8-14v14h4V5h-4z",
      init: function (browser, type, url, id, count, target, time) {
        client = browser.url(url);
        targetIframeId = count;

        if (time !== undefined)
          sla = time;
        else
          sla = SLA;

        client.waitForElementVisible(id + " iframe[gesture=media]", sla);

        parent = target;

        if (count !== undefined)
          client.frame(targetIframeId);

        return client;
      },
      widgetTitle: function (iframeId, target, expected, type) {
        if (type === undefined)
          type = 'css selector';

        client.element(type)
          .waitForElementVisible(iframeId, sla)
          .waitForElementVisible(iframeId + " > " + target, sla);

        this.text(iframeId + " > " + target, expected);
      },
      widgetNav: function (iframeId, count) {
        var index = 1;

        client.element('css selector')
          .waitForElementVisible(iframeId + " > div.tvp-carousel-content.slick-initialized.slick-slider", sla);

        client.element('css selector')
          .waitForElementVisible(iframeId + " > div.tvp-carousel-arrow.prev.inactive", sla)
          .waitForElementVisible(iframeId + " > div.tvp-carousel-arrow.next", sla);

        for (i=0;i < count;i++) {
          client.element('css selector')
            .moveToElement(iframeId + " > div.tvp-carousel-arrow.next", 20, 20)
            .mouseButtonClick('left')
            .pause(SECOUND);

          index++;
          client.expect.element("div[data-slick-index='" + i + "']").to.have.attribute('aria-hidden').which.equals('true');
        }

        for (i=0;i < count;i++) {
          client.element('css selector')
            .moveToElement(iframeId + " > div.tvp-carousel-arrow.prev", 20, 20)
            .mouseButtonClick('left')
            .pause(SECOUND);

          client.expect.element("div[data-slick-index='" + index-- + "']").to.have.attribute('aria-hidden').which.equals('false');
        }
      },
      moveAndClick: function (target, x, y, button) {
        if (x === undefined)
          x = 0;

        if (y === undefined)
          y = 0;

        if (button === undefined)
          button = "left";

        client.element('css selector')
          .waitForElementPresent(target, sla)
          .moveToElement(target, x, y)
          .mouseButtonClick(button);
      },
      modalLoad: function (target, x, y) {
        client
          .waitForElementPresent(target + " > div.tvp-video", sla)
          .click(target + " > div.tvp-video");

        client.frameParent();
      },
      modalSanity: function (videoId) {
        this.modalLoad(videoId, 160, 100);

        msg = "Modal Sanity Test";
        this.pause({"callback": log});

        client
          .waitForElementVisible('div#tvp-modal-overlay-carousel-1', sla)
          .waitForElementVisible('div#tvp-modal-carousel-1', sla)
          .pause(SECOUND);

        client.expect.element(parent + ' h4#tvp-modal-title-carousel-1').text.to.equal(FIRST_VIDEO_TITLE);
        client.expect.element(parent + ' div#tvp-modal-close-carousel-1').to.be.present;

        client.frame(2),
        client.expect.element('p.tvp-products-text').text.to.equal(PRODUCT_HEADLINE),
        client.frameParent();
      },
      modalLoadPerformance: function (target) {
        targetIframeId = 2;

        client
          .waitForElementVisible(parent, sla)
          .waitForElementVisible(parent + " iframe.tvp-iframe-modal[gesture='media']", sla)
          .frame(targetIframeId),

        client.expect.element(target).to.be.present;
        client.expect.element(target + " div#tvplayer-playbutton").to.be.present;
        client.expect.element(target + " div#tvplayer-playbutton-icon").to.be.present;

        this.pause();
      },
      modalClose: function (modalId) {
        client.frameParent(),
        this.pause();

        client.element('css selector')
          .waitForElementVisible(modalId + " div#tvp-modal-close-carousel-1", sla)
          .moveToElement(modalId + " div#tvp-modal-close-carousel-1", 10, 10)
          .mouseButtonClick("left");

        client.expect.element("div#tvp-modal-overlay-carousel-1").to.have.css('display', 'hidden');
        client.expect.element(modalId).to.have.css('display', 'none');

        this.pause();
      },
      productModal: function () {
        client.waitForElementVisible(parent, sla);

        client.expect.element(parent + " a#tvp-product-83102610").to.be.present;
        client.expect.element(parent + " a#tvp-product-83102610").to.have.attribute('href', PRODUCT_URL);

        // Product pop-up
        client
          .moveToElement(parent + " a#tvp-product-83102610", 70, 70)
          .pause(2*SECOUND);

        if (isMobile === false) {
          client.expect.element(parent + " a#tvp-product-83102610").to.have.attribute('class', 'tvp-product active');
          client.expect.element(parent + " a#tvp-product-popup-83102610").to.be.present;
          client.expect.element(parent + " a#tvp-product-popup-83102610").to.have.attribute('href', PRODUCT_URL);
          client.expect.element(parent + " a#tvp-product-popup-83102610 > div.tvp-product-popup-image").to.have.css("background-image", "url(" + PRODUCT_IMG + ");");
          client.expect.element(parent + " a#tvp-product-popup-83102610 > p.tvp-product-title").text.to.match(/Ninja\ Coffee\ Bar®\ with\ Glass\ Carafe/i);
          client.expect.element(parent + " a#tvp-product-popup-83102610 > p.tvp-product-price").text.to.equal("");
          client.expect.element(parent + " a#tvp-product-popup-83102610 > button.tvp-product-cta").to.be.present;
          client.expect.element(parent + " div.tvp-inner-arrow-indicator").to.be.present;
        }

        client.pause(SECOUND);
      },
      productModalLink: function (parent) {
        // Click on product from modal
        client
          .click(parent + " a#tvp-product-83102610")
          .windowHandles(function (result) {
            this.switchWindow(result.value[1]);
            this.verify.urlContains(PRODUCT_SECURE_URL);
            this.closeWindow();

            this.switchWindow(result.value[0]);
            this.waitForElementVisible("div#tvp-modal-iframe-holder-carousel-1", sla);
            this.waitForElementVisible("iframe.tvp-iframe-modal[gesture='media']", sla);
            this.frame(targetIframeId);
          })
          .pause(2*SECOUND);
      },
      playerLoadPerformance: function (count) {
        targetIframe = count;

        if (count !== undefined)
          client.frame(targetIframe);

        client.element('css selector')
          .waitForElementVisible(parent + " div#tvplayer-playbutton", sla)
          .waitForElementPresent(parent + " div#ControlBarFloater", sla);

        // sanity check
        client.expect.element(parent + " div#ControlBarFloater > div.tvp-control-volume-container").to.be.present;
        client.expect.element(parent + " div#ControlBarFloater > div.tvp-control-volume-container > div.tvp-control-volume-selector-container").to.be.present;
        client.expect.element(parent + " div#ControlBarFloater > div.tvp-control-volume-container").to.be.present;
        client.expect.element(parent + " div#CtrlClosedCaptionImage").to.be.present;

        // tvplayer icon check
        client.expect.element(parent + " #tvplayer-playbutton-icon").to.be.present;
      },
      playerStart: function (x, y) {
        client.waitForElementVisible(parent + ' div#tvplayer-playbutton-icon', sla)
        client.expect.element(parent + " #tvplayer-playbutton-icon").to.be.present,

        client.waitForElementVisible(parent + ' div#tvplayer-playbutton-icon', sla)
        client.expect.element(parent + " #tvplayer-playbutton-icon").to.be.present,

        this.moveAndClick(parent + ' div#tvplayer-playbutton-icon', 12, 15),
        client.waitForElementPresent(parent + " div#tvp-spinner", sla),
        client.expect.element(parent + ' div#tvp-spinner').to.have.css('display').which.equals('none'),
        client.expect.element(parent + ' div#tvplayer-playbutton').not.to.be.present,
        client.expect.element(parent + ' div#tvplayer-playbutton-icon').not.to.be.present;

        isPlaying = true;
        
        this.pause();
      },
      playerSanity: function (parent) {
        this.playerStart(),
        this.pause(3),
        this.playerTime();
//        this.playerPauseAndPlay();
      },
      playerClickPause: function () {
        this.moveAndClick(parent + ' div#ControlBarFloater > div.tvp-control-playpause', 15, 15);

        if (isPlaying === false) {
          client.expect.element(parent + ' div#ControlBarFloater > div.tvp-control-playpause path').to.have.attribute("d", this.ICON_PLAYING);
          isPlaying = true;
        } else {
          client.expect.element(parent + ' div#ControlBarFloater > div.tvp-control-playpause path').to.have.attribute("d", this.ICON_PAUSE);
          isPlaying = false;
        }

        this.pause(1);
      },
      playerClickOverlay: function () {
        client.element('css selector')
          .waitForElementPresent(paernt + ' div.tvp-control-overlay', sla)
          .click(parent + ' div.tvp-control-overlay');
      },
      playerPauseAndPlay: function () {
        this.playerClickPause(),
        this.playerTime(),
        this.playerClickPause();
      },
      playerCheckFullScreen: function (keys) {
        if (keys === undefined) {
          client.element('css selector')
            .moveToElement(parent + ' iframe', 20, 20)
            .waitForElementVisible(parent + " div.tvp-control-fullscreen", sla)
            .click(parent + " div.tvp-control-fullscreen");
        } else {
          return false;
        }

        if (isFullScreen === false) {
          client.expect.element(parent + ' div.tvp-control-fullscreen > svg.tvp-controlbar-svg path:nth-child(2)').to.have.attribute('d', this.ICON_DEFAULT_SCREEN);
          isFullScreen = true;
        } else {
          client.expect.element(parent + ' div.tvp-control-fullscreen > svg.tvp-controlbar-svg path:nth-child(2)').to.have.attribute('d', this.ICON_FULL_SCREEN);
          isFullScreen = false;          
        }
      },
      playerShowControl: function (target) {
        client.element('css selector')
          .click(parent + ' div.tvp-control-overlay')
          .waitForElementVisible(parent + target, sla)
          .click(parent + ' div.tvp-control-overlay');
      },
      playerSkip: function (x) {
        var seekbar = ' div#ControlBarFloater > div.tvp-parent-seekbar',
            y = 20;

        if (isMobile === true) {
          seekbar = ' div#ControlBarFloater > div.tvp-parent-seekbar.tvp-seekbar-mobile';
          y = 4;
        }

        this.playerShowControl(seekbar),
        this.moveAndClick(parent + seekbar, x, y),
        this.playerTime();
        
        client.expect.element(parent + ' div#ControlBarFloater > div.tvp-control-playpause').to.have.css('display').which.not.equals('none');
        client.expect.element(parent + ' div#ControlBarFloater > div.tvp-control-fullscreen').to.have.css('display').which.not.equals('none');

        this.pause();
      },
      playerCheckPlaying: function (isFinished) {
        if (isFinished === undefined)
          isFinished = false;

        client.expect.element(parent + ' div#tvp-spinner').to.have.css('display').which.equals('none');

        if (isFinished === false) {
          client.expect.element(parent + ' div#tvplayer-playbutton-icon').to.not.be.present;
          client.expect.element(parent + ' div#tvplayer-playbutton').to.not.be.present;
        } else {
          client.expect.element(parent + ' div#tvplayer-playbutton-icon').to.be.present;
          client.expect.element(parent + ' div#tvplayer-playbutton').to.be.present;      
        }
      },
      playerCheckFullScreenPlaying: function () {
        this.playerCheckPlaying();
        client.expect.element(parent + " div#tvplayer-overlay").not.to.have.css('z-index', '2147483');
      },
      playerTime: function () {
        client.element('css selector')
          .click(parent + ' div.tvp-control-overlay')
          .waitForElementPresent(parent + ' div#CtrlTime', sla)
          .getText(parent + " div#CtrlTime", function (result) {
            this.assert.equal(typeof result, "object"),
            this.assert.equal(result.status, 0),
            this.assert.notEqual(result.value, "");
           
            var current = result.value.match(/^(\S+)\s(.*)/).slice(1);

            this.assert.notEqual(current[0], "00:00"),
            this.click(parent + ' div.tvp-control-overlay');
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
      pause: function (count) {
        if (count === undefined)
          count = 1;

        client.pause(count * SECOUND, log);
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
  productHolder: "div.tvp-products",
  firstVideoId: 'div[data-slick-index="0"]',
  /*
  'carousel-youtube-sanity': function (browser) {
    var carousel = new tvpGUITest({
          'isMobile': true  
        }),
        parent = this.widgetIframeId + " > " + this.productHolder,
        client = carousel.init(browser, "Carousel Youtube Sanity", URL, "div#carousel-1-holder", 0, parent);

    carousel.widgetTitle(this.widgetIframeId, this.widgetTitleId, "Recommended Videos"),
    //carousel.widgetNav(this.widgetIframeId, 16),
    carousel.modalSanity(this.modalId, this.firstVideoId),
    carousel.modalLoadPerformance(this.widgetIFrameHolder, this.widgetIframeId),
    carousel.productModal(),
    carousel.productModalLink(),

    client.end();
  },
  */
  'carousel-youtube-player': function (browser) {
    var carousel = new tvpGUITest({
          'isMobile': true
        }),
        parent = this.widgetIframeId + " > " + this.playerHolder,
        client = carousel.init(browser, "Carousel Youtube Player Normal", URL, "div#carousel-1-holder", 0, parent);

    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    carousel.playerSanity(),
    carousel.playerSkip(100),
    carousel.playerSkip(200),
    carousel.playerSkip(350),
    carousel.pause(10),

    // check for video finish playing and check for new video is playing
    carousel.playerCheckPlaying(true),
    carousel.modalClose(this.modalId), // testing close modal

    // Move to carousel iframe
    carousel.iframe(0),

    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    carousel.playerSanity(),
    carousel.end();
  },

  'caousel-youtube-player-fullscreen': function (browser) {
    var carousel = new tvpGUITest(),
        parent = this.widgetIframeId + " > " + this.playerHolder,
        client = carousel.init(browser, "Carousel Youtube Player Full Screen", URL, "div#carousel-1-holder", 0, parent);

    //client
      //.click(this.widgetIframeId + " div.tvp-carousel-arrow.next")
      //.pause(SECOUND),
    //client
      //.click(this.widgetIframeId + " div.tvp-carousel-arrow.next")
      //.pause(SECOUND),

    carousel.modalLoad(this.firstVideoId, 160, 100),
    carousel.playerLoadPerformance(2),
    carousel.playerStart(),
    carousel.pause(2),
    carousel.playerCheckFullScreen(),
    carousel.playerSkip(100),
    carousel.playerSkip(200),
    carousel.playerSkip(355),
    carousel.pause(5),

    // checking for next loaded video sanity
    carousel.playerCheckFullScreenPlaying(false),
    carousel.pause(2),

    // Starting secound video
    carousel.playerStart();
    carousel.end();
  }
};
