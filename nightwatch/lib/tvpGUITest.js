
exports.tvpGUITest = function (options) {
  const SECOND = 1000;

  var client, targetIframeId, parent, msg,
      isPlaying = false,
      isFullScreen = false,
      isMobile = (options !== undefined && options.isMobile ? options.isMobile : false),
      orientation =  (options !== undefined && options.orientation ? options.orientation : 'PORTRAIT'),
      modalOverlay = options.modalOverlay,
      modalCloseId = options.modalCloseId,
      DATA = (options !== undefined && options.DATA !== undefined ? options.DATA : {}),
      selectorType = (options !== undefined && options.selectorType !== undefined ? options.selectorType : "css selector"),
      debug = false;

  if (DATA.SLA === undefined)
    DATA.SLA = SECOND;

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
    init: function (browser, type, id, count, target) {
      targetIframeId = count;

      client = browser.url(DATA.URL, function (result) {
          msg = type;
          log();

          if (isMobile === false) {
            this.resizeWindow(1440, 900);
          }

          if (orientation !== undefined) {
            this.setOrientation(orientation);
          }
        })
        .pause(2*SECOND);
          
      client.waitForElementVisible(id + " iframe[gesture=media]", DATA.SLA);

      parent = target;

      if (count !== undefined)
        client.frame(targetIframeId);

      return client;
    },
    widgetTitle: function (iframeId, target, expected) {
      client.element(selectorType, function (result) {
          msg = "Start Widget Title Testing";
          log();
        })
        .waitForElementVisible(iframeId, DATA.SLA)
        .waitForElementVisible(iframeId + " > " + target, DATA.SLA);

      this.text(iframeId + " > " + target, expected);
    },
    widgetNav: function (iframeId, count) {
      var index = 1;

      client.element(selectorType)
        .waitForElementVisible(iframeId + " > div.tvp-carousel-content.slick-initialized.slick-slider", DATA.SLA);

      client.element(selectorType)
        .waitForElementVisible(iframeId + " > div.tvp-carousel-arrow.prev.inactive", DATA.SLA)
        .waitForElementVisible(iframeId + " > div.tvp-carousel-arrow.next", DATA.SLA);

      for (i=0;i < count;i++) {
        client.element(selectorType)
          .moveToElement(iframeId + " > div.tvp-carousel-arrow.next", 20, 20)
          .mouseButtonClick('left')
          .pause(SECOND);

        index++;
        client.expect.element("div[data-slick-index='" + i + "']").to.have.attribute('aria-hidden').which.equals('true');
      }

      for (i=0;i < count;i++) {
        client.element(selectorType)
          .moveToElement(iframeId + " > div.tvp-carousel-arrow.prev", 20, 20)
          .mouseButtonClick('left')
          .pause(SECOND);

        client.expect.element("div[data-slick-index='" + index-- + "']").to.have.attribute('aria-hidden').which.equals('false');
      }
    },
    moveAndClick: function (target, x, y, button, isVisible) {
      if (x === undefined)
        x = 0;

      if (y === undefined)
        y = 0;

      if (button === undefined)
        button = "left";

      if (isVisible === true) {
        client.element(selectorType)
          .waitForElementVisible(target, DATA.SLA)
          .moveToElement(target, x, y)
          .mouseButtonClick(button);
      } else {
        client.element(selectorType)
          .waitForElementPresent(target, DATA.SLA)
          .moveToElement(target, x, y)
          .mouseButtonClick(button);
      }
    },
    modalLoad: function (target, x, y) {
      client
        .waitForElementPresent(target + " > div.tvp-video", DATA.SLA)
        .click(target + " > div.tvp-video");

      client.frameParent();
    },
    modalSanity: function (modalId, videoId) {
      this.modalLoad(videoId, 160, 100),
      this.pause(),

      client
        .waitForElementVisible(modalId, DATA.SLA)
        .waitForElementVisible(modalId + ' h4#tvp-modal-title-carousel-1', DATA.SLA)
        .waitForElementVisible(modalId + ' div#tvp-modal-close-carousel-1', DATA.SLA)
        .pause(SECOND),

      client.expect.element(modalId + ' h4#tvp-modal-title-carousel-1').text.to.equal(DATA.FIRST_VIDEO_TITLE),
      client.expect.element(modalId + ' div#tvp-modal-close-carousel-1').to.be.present;

      if (isMobile === false) {
        client.waitForElementVisible(modalId + ' div.tvp-products-headline', DATA.SLA),
        client.expect.element(modalId + ' div.tvp-products-headline').text.to.equal(DATA.PRODUCT_HEADLINE);
      } else {
        client.frame(2),
        client.waitForElementVisible('p.tvp-products-text', DATA.SLA),
        client.expect.element('p.tvp-products-text').text.to.equal(DATA.PRODUCT_HEADLINE);
      }

      this.modalClose(modalId);
    },
    modalLoadPerformance: function (iframeId, videoId, target, targetIframe) {
      client.frameParent()
        .pause(SECOND)
        .frame(targetIframeId),
      this.modalLoad(videoId, 160, 100),
      this.pause();

      targetIframeId = targetIframe;

      client
        .waitForElementVisible(iframeId, DATA.SLA)
        .waitForElementVisible(iframeId + " iframe.tvp-iframe-modal[gesture='media']", DATA.SLA)
        .frame(targetIframeId),

      client.expect.element(target).to.be.present;
      client.expect.element(target + " div#tvplayer-playbutton").to.be.present;
      client.expect.element(target + " div#tvplayer-playbutton-icon").to.be.present;

      this.pause();
    },
    modalClose: function (modalId) {
      client.frameParent(),
      this.pause();

      this.moveAndClick(modalId + " " + modalCloseId, DATA.SLA, 10, 10, 'left', true);

      client.expect.element(modalOverlay).to.have.css('display', 'hidden');
      client.expect.element(modalId).to.have.css('display', 'none');

      this.pause();
    },
    productModal: function () {
      var regex = (DATA.PRODUCT_TITLE_REGEX !== undefined ? DATA.PRODUCT_TITLE_REGEX : /\ /i);

      client.waitForElementVisible(parent, DATA.SLA);

      client.expect.element(parent + " a#tvp-product-83102610").to.be.present;
      client.expect.element(parent + " a#tvp-product-83102610").to.have.attribute('href', DATA.PRODUCT_URL);

      // Product pop-up
      client
        .moveToElement(parent + " a#tvp-product-83102610", 70, 70)
        .pause(2*SECOND);

      if (isMobile === false) {
        client.expect.element(parent + " a#tvp-product-83102610").to.have.attribute('class', 'tvp-product active');
        client.expect.element(parent + " a#tvp-product-popup-83102610").to.be.present;
        client.expect.element(parent + " a#tvp-product-popup-83102610").to.have.attribute('href', DATA.PRODUCT_URL);
        client.expect.element(parent + " a#tvp-product-popup-83102610 > div.tvp-product-popup-image").to.have.css("background-image", "url(" + DATA.PRODUCT_IMG + ");");
        client.expect.element(parent + " a#tvp-product-popup-83102610 > p.tvp-product-title").text.to.match(regex);
        client.expect.element(parent + " a#tvp-product-popup-83102610 > p.tvp-product-price").text.to.equal("");
        client.expect.element(parent + " a#tvp-product-popup-83102610 > button.tvp-product-cta").to.be.present;
        client.expect.element(parent + " div.tvp-inner-arrow-indicator").to.be.present;
      }

      client.pause(SECOND);
    },
    productModalLink: function () {
      // Click on product from modal
      if (isMobile === true) {
        client
          .click(parent + " a#tvp-product-83102610")
          .windowHandles(function (result) {
            this.switchWindow(result.value[1]);
            this.verify.urlContains(DATA.PRODUCT_SECURE_URL);
            this.closeWindow();

            this.switchWindow(result.value[0]);
            this.waitForElementVisible("div#tvp-modal-iframe-holder-carousel-1", DATA.SLA);
            this.waitForElementVisible("iframe.tvp-iframe-modal[gesture='media']", DATA.SLA);
            this.frame(targetIframeId);
          })
          .pause(2*SECOND);
      } else {
        client
          .waitForElementVisible(parent + " a#tvp-product-83102610", DATA.SLA)
          .moveToElement(parent + " a#tvp-product-83102610", 70, 70)
          .waitForElementVisible(parent + " a.tvp-product-popup", DATA.SLA)
          .pause(SECOND)
          .mouseButtonClick("left")
          .windowHandles(function (result) {
            this.switchWindow(result.value[1]);
            this.verify.urlContains(DATA.PRODUCT_SECURE_URL);
            this.closeWindow();

            this.switchWindow(result.value[0]);
            this.waitForElementVisible("div#tvp-modal-iframe-holder-carousel-1", DATA.SLA);
            this.waitForElementVisible("iframe.tvp-iframe-modal[gesture='media']", DATA.SLA);
            this.frame(targetIframeId);
          })
          .pause(5*SECOND);

        // Click on product from pop-up thumnail
        client
          .waitForElementVisible(parent + " a#tvp-product-83102610", DATA.SLA)
          .moveToElement(parent + " a#tvp-product-83102610", 70, 70)
          .waitForElementVisible(parent + " div.tvp-product-popup-image", DATA.SLA)
          .moveToElement(parent + " div.tvp-product-popup-image", 105, 105)
          .mouseButtonClick("left")
          .pause(SECOND)
          .windowHandles(function (result) {
            this.switchWindow(result.value[1]);
            this.verify.urlContains(DATA.PRODUCT_SECURE_URL);
            this.closeWindow();

            this.switchWindow(result.value[0]);
            this.waitForElementVisible("div#tvp-modal-iframe-holder-carousel-1", DATA.SLA);
            this.waitForElementVisible("iframe.tvp-iframe-modal[gesture='media']", DATA.SLA);
            this.frame(targetIframeId);
          })
          .pause(5*SECOND);

        // Click on product from pop-up title
        client
          .waitForElementVisible(parent + " a#tvp-product-83102610", DATA.SLA)
          .moveToElement(parent + " a#tvp-product-83102610", 70, 70)
          .waitForElementVisible(parent + " p.tvp-product-title", DATA.SLA)
          .moveToElement(parent + " p.tvp-product-title", 40, 20)
          .pause(SECOND)
          .mouseButtonClick("left")
          .windowHandles(function (result) {
            this.switchWindow(result.value[1]);
            this.verify.urlContains(DATA.PRODUCT_SECURE_URL);
            this.closeWindow();

            this.switchWindow(result.value[0]);
            this.waitForElementVisible("div#tvp-modal-iframe-holder-carousel-1", DATA.SLA);
            this.waitForElementVisible("iframe.tvp-iframe-modal[gesture='media']", DATA.SLA);
            this.frame(targetIframeId);
          })
          .pause(5*SECOND);

        // Click on product from pop-up cta
        client
          .waitForElementVisible(parent + " a#tvp-product-83102610", DATA.SLA)
          .moveToElement(parent + " a#tvp-product-83102610", 70, 70)
          .waitForElementVisible(parent + " button.tvp-product-cta", DATA.SLA)
          .moveToElement(parent + " button.tvp-product-cta", 40, 20)
          .mouseButtonClick("left")
          .pause(SECOND)
          .windowHandles(function (result) {
            this.switchWindow(result.value[1]);
            this.verify.urlContains(DATA.PRODUCT_SECURE_URL);
            this.closeWindow();

            this.switchWindow(result.value[0]);
            this.waitForElementVisible("div#tvp-modal-iframe-holder-carousel-1", DATA.SLA);
            this.waitForElementVisible("iframe.tvp-iframe-modal[gesture='media']", DATA.SLA);
            this.frame(targetIframeId);
          })
          .pause(5*SECOND);
      }
    },
    playerLoadPerformance: function (count) {
      targetIframeId = count;

      if (count !== undefined)
        client.frame(targetIframeId);

      client.element(selectorType)
        .waitForElementVisible(parent + " div#tvplayer-playbutton", DATA.SLA)
        .waitForElementPresent(parent + " div#ControlBarFloater", DATA.SLA);

      // sanity check
      client.expect.element(parent + " div#ControlBarFloater > div.tvp-control-volume-container").to.be.present;
      client.expect.element(parent + " div#ControlBarFloater > div.tvp-control-volume-container > div.tvp-control-volume-selector-container").to.be.present;
      client.expect.element(parent + " div#ControlBarFloater > div.tvp-control-volume-container").to.be.present;
      client.expect.element(parent + " div#CtrlClosedCaptionImage").to.be.present;

      // tvplayer icon check
      client.expect.element(parent + " #tvplayer-playbutton-icon").to.be.present;
    },
    playerStart: function (x, y) {
      client.waitForElementVisible(parent + ' div#tvplayer-playbutton-icon', DATA.SLA)
      client.expect.element(parent + " #tvplayer-playbutton-icon").to.be.present,

      client.waitForElementVisible(parent + ' div#tvplayer-playbutton-icon', DATA.SLA)
      client.expect.element(parent + " #tvplayer-playbutton-icon").to.be.present,

      this.moveAndClick(parent + ' div#tvplayer-playbutton-icon', 12, 15),
      client.waitForElementPresent(parent + " div#tvp-spinner", DATA.SLA),
      client.waitForElementNotVisible(parent + ' div#tvp-spinner', DATA.SLA),
      client.waitForElementNotPresent(parent + ' div#tvplayer-playbutton', DATA.SLA),
      client.waitForElementNotPresent(parent + ' div#tvplayer-playbutton-icon', DATA.SLA),        
      this.pause(3);

      isPlaying = true;
    },
    playerSanity: function () {
      this.playerStart(),
      this.playerShowControl('div#ControlBarFloater > div.tvp-parent-seekbar'),
      this.playerTime();
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
      client.element(selectorType)
        .waitForElementPresent(paernt + ' div.tvp-control-overlay', DATA.SLA)
        .click(parent + ' div.tvp-control-overlay');
    },
    playerPauseAndPlay: function () {
      this.playerClickPause(),
      this.playerTime(),
      this.playerClickPause();
    },
    playerCheckFullScreen: function (keys) {
      if (keys === undefined) {
        if (isMobile === true) {
          this.playerShowControl("div#ControlBarFloater > div.tvp-control-fullscreen.tvp-controlbar-icon");
          client.click(parent + " div#ControlBarFloater > div.tvp-control-fullscreen.tvp-controlbar-icon");
        } else if (isMobile === false) {
          this.playerShowControl("div#ControlBarFloater > div.tvp-control-fullscreen.tvp-controlbar-icon"),
          client.click(parent + " div#ControlBarFloater > div.tvp-control-fullscreen.tvp-controlbar-icon");
        }
      } else {
        return false;
      }

      if (isFullScreen === false) {
        client.expect.element(parent + ' div.tvp-control-fullscreen.tvp-controlbar-icon > svg.tvp-controlbar-svg path:nth-child(2)').to.have.attribute('d', this.ICON_DEFAULT_SCREEN);
        isFullScreen = true;
      } else {
        client.expect.element(parent + ' div.tvp-control-fullscreen.tvp-controlbar-icon > svg.tvp-controlbar-svg path:nth-child(2)').to.have.attribute('d', this.ICON_FULL_SCREEN);
        isFullScreen = false;
      }
    },
    playerShowControl: function (target, x, y) {
      if (isMobile === true) {
        if (x === undefined) {
          x = 20;
        }

        if (y === undefined) {
          y = 20;
        }

        client.element(selectorType)
          .moveToElement(parent + ' div.tvp-control-overlay', x, y)
          .mouseButtonDown("left")
          .pause(SECOND)
          .moveToElement(parent + " " + target, x, y)
          .mouseButtonUp("left");

        if (isFullScreen === false) {
          client.waitForElementVisible(parent + " " + target, DATA.SLA);
        }
      } else {
        client.element(selectorType)
          .moveToElement(parent + ' div.tvp-control-overlay', x, y)
          .waitForElementVisible(parent + " " + target, DATA.SLA)
          .pause(SECOND);
      }
    },
    playerSkip: function (x) {
      var seekbar = 'div#ControlBarFloater > div.tvp-parent-seekbar',
          y = 20;

      if (isMobile === true) {
        if (orientation === 'PORTRAIT') {
          y = 4;
        } else if (orientation === 'LANDSCAPE') {
          y = 16;
        }
      }

      this.playerShowControl(seekbar, x, y),
      this.moveAndClick(parent + " " + seekbar, x, y, "left", true),
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

        if (isFullScreen === true) {
          //client.expect.element(parent + " div#tvplayer-overlay").not.to.have.css('z-index', '2147483');
        }
      }
    },
    playerTime: function () {
      this.playerShowControl("div#CtrlTime")

      client.element(selectorType)
        .pause(2*SECOND)
        .waitForElementPresent(parent + ' div#CtrlTime', DATA.SLA)
        .getText(parent + " div#CtrlTime", function (result) {
          this.assert.equal(typeof result, "object"),
          this.assert.equal(result.status, 0);

          if (typeof result.value === "string" && result.value !== "" ) {
            var current = result.value.match(/^(\S+)\s(.*)/).slice(1);

            this.assert.notEqual(result.value, ""),
            this.assert.notEqual(current[0], "00:00");
          } else {
            console.log(">> Skipping Time Check!! <<");
          }
        });
    },
    text: function (selector, expected) {
      client.element(selectorType)
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

      client.pause(count * SECOND);
    },
    end: function () {
      client.end();
    }
  };
};
