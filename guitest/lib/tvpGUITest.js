
exports.tvpGUITest = function (options) {
  const SECOND = 2000;

  var client, TARGET_IFRAME, parent, msg,
      isPlaying = false,
      isFullScreen = false,
      isMobile = (options !== undefined && options.isMobile ? options.isMobile : false),
      isFF = (options !== undefined && options.isFF ? options.isFF : false),
      isIE = (options !== undefined && options.isIE ? options.isIE : false),
      isEdge = (options !== undefined && options.isEdge ? options.isEdge : false),
      isSafari = (options !== undefined && options.isSafari ? options.isSafari : false),
      orientation =  (options !== undefined && options.orientation ? options.orientation : 'PORTRAIT'),
      ANALYTIC_RESET = (options !== undefined && options.ANALYTIC_RESET ? options.ANALYTIC_RESET : false),
      loginId = (options !== undefined && options.loginId ? options.loginId : 1758799),
      channelId = (options !== undefined && options.channelId ? options.channelId : 66133904),
      initialCI = (options !== undefined && options.initialCI !== undefined ? options.initialCI : 1),

      ELEMENT_MODAL_OVERLAY = options.ELEMENT_MODAL_OVERLAY,
      ELEMENT_MODAL_CLOSE = options.ELEMENT_MODAL_CLOSE,
      ELEMENT_MODAL_TITLE = options.ELEMENT_MODAL_TITLE,
      ELEMENT_MODAL_CLOSE_BUTTON = options.ELEMENT_MODAL_CLOSE_BUTTON,
      ELEMENT_MODAL_IFRAME_HOLDER = options.ELEMENT_MODAL_IFRAME_HOLDER,
      widgetNavHolder = options.widgetNavHolder,
      widgetNavPrev = options.widgetNavPrev,
      widgetNavNext = options.widgetNavNext,
      ELEMENT_MODAL_OPEN = options.ELEMENT_MODAL_OPEN,

      DATA = (options !== undefined && options.DATA !== undefined ? options.DATA : {}),
      SELECTOR_TYPE = (options !== undefined && options.SELECTOR_TYPE !== undefined ? options.SELECTOR_TYPE : "css selector"),
      debug = false;

  var aCounts = {
        'ci': 0,
        'vv': 0,
        'pi': 0,
        'pk': 0
      },
      vids = [];

  if (DATA.SLA === undefined)
    DATA.SLA = SECOND;

  if (DATA.BROWSERHEIGHT === undefined)
    DATA.BROWSERHEIGHT = 900;

  if (DATA.BROWSEWIDTH === undefined)
    DATA.BROWSEWIDTH = 1440;

  if (DATA.isFF === undefined)
    DATA.isFF = false;

  var log = function (result) {
    if (debug === true) {
      console.log(">> DEBUG: <<");
      console.log(result);
    }

    if (msg !== undefined && msg !== "")
      console.log(">> " + msg + " <<");

    msg = undefined;
  };

  var getParameterByName = function(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);

    if (!results) return null;
    if (!results[2]) return '';

    return decodeURIComponent(results[2].replace(/\+/g, " "));
  };

  var inArray = function(needle, haystack, isIndex) {
    var found = false;

    if (haystack === undefined)
      return false;

    haystack.forEach(function(value, i) {
      if (needle == value) {
        found = (isIndex === true ? i : true);
      }
    });

    return found;
  };

  var checkCounts = function (client, events, expected) {
    events.forEach(function (key, i) {
      console.log(">>> Checking " + key + " Event Counts: " + aCounts[key] + " <<<");
      client.assert.equal(aCounts[key], expected[key]);
    })
  };

  return {
    ICON_DEFAULT_SCREEN: "M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z",
    ICON_FULL_SCREEN: "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z",
    ICON_PLAYING: "M8 5v14l11-7z",
    ICON_PAUSE: "M6 19h4V5H6v14zm8-14v14h4V5h-4z",
    init: function (browser, type, widgetHolder, targetIframe, target) {
      var THAT = this;

      TARGET_IFRAME = targetIframe;
      parent = target;
      client = browser;

      return client.url(DATA.URL, function (r) {
          if (isMobile === false) {
            if (isSafari !== true) {
              this.resizeWindow(DATA.BROWSEWIDTH, DATA.BROWSERHEIGHT);
            }
          }

          if (isMobile === true && orientation !== undefined) {
            this.setOrientation(orientation);
          }
        })
        .pause(2*SECOND, function (r) {
          if (parent !== "") {
            this.waitForElementVisible(widgetHolder + " iframe[gesture=media]", DATA.SLA);
          }
          
          if (TARGET_IFRAME !== undefined) {
            // CI check for Initial Widget Load
            THAT.analytics(TARGET_IFRAME, ['ci'], {
              LOGIN_ID: loginId,
              CHANNEL_ID: channelId,
              COUNTS: {"ci": initialCI}
              //,
              //TARGET_IFRAME: TARGET_IFRAME
            });
          }
        });

//      return client;
    },

    widgetTitle: function (target, title, expected) {
      var THAT = this;

      client
        .frame(TARGET_IFRAME)
        .element(SELECTOR_TYPE)
        .waitForElementVisible(target, DATA.SLA)
        .waitForElementVisible(target + " " + title, DATA.SLA, function (r) {
          THAT.text(target + " " + title, expected);
        });

      return this;
    },

    widgetNav: function (target, count, skip) {
      if(skip){
        return;
      }
      var index = 1;

      client
        .frameParent()
        .frame(TARGET_IFRAME)
        .element(SELECTOR_TYPE)
        .waitForElementVisible(target + " " + widgetNavHolder, DATA.SLA);

      client.element(SELECTOR_TYPE)
        .waitForElementVisible(target + " " + widgetNavPrev, DATA.SLA)
        .waitForElementVisible(target + " " + widgetNavNext, DATA.SLA);

      for (i=0;i < count;i++) {
        client.element(SELECTOR_TYPE)
        .click(target +  " " + widgetNavNext)
        .pause(SECOND);

        index++;
        client.expect.element("div[data-slick-index='" + i + "']").to.have.attribute('aria-hidden').which.equals('true');
      }

      for (i=0;i < count;i++) {
        client.element(SELECTOR_TYPE)
        .click(target + " " + widgetNavPrev)
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
        client
          .frameParent()
          .frame(TARGET_IFRAME)
          .element(SELECTOR_TYPE)
          .waitForElementVisible(target, DATA.SLA)
          .moveToElement(target, x, y)
          .mouseButtonClick(button);
      } else {
        client
          .frameParent()
          .frame(TARGET_IFRAME)
          .element(SELECTOR_TYPE)
          .waitForElementPresent(target, DATA.SLA)
          .moveToElement(target, x, y)
          .mouseButtonClick(button);
      }
    },
    modalLoad: function (target, x, y) {
      client
        .frameParent()
        .frame(TARGET_IFRAME)
        .waitForElementPresent(target + " " + ELEMENT_MODAL_OPEN, DATA.SLA)
        .click(target + " " + ELEMENT_MODAL_OPEN);
    },
    modalSanity: function (target, video, videoTitle, targetIframe, skip, hasProductHeadline) {
      this.modalLoad(video, 160, 100),
      this.pause();

      client
        .frameParent()
        .waitForElementVisible(target, DATA.SLA)
        .waitForElementVisible(target + " " + ELEMENT_MODAL_TITLE, DATA.SLA)
        .waitForElementVisible(target + " " + ELEMENT_MODAL_CLOSE_BUTTON, DATA.SLA)
        .pause(SECOND);

      client.expect.element(target + " " + ELEMENT_MODAL_TITLE).text.to.equal(videoTitle),
      client.expect.element(target + " " + ELEMENT_MODAL_CLOSE_BUTTON).to.be.present;

      if (targetIframe !== undefined) {
        TARGET_IFRAME = targetIframe;
      }

      client
        .frameParent()
        .frame(TARGET_IFRAME)

      if (hasProductHeadline === true) {
        if (isMobile === false) {
          client.waitForElementVisible(target + ' div.tvp-products-headline', DATA.SLA);
          client.expect.element(target + ' div.tvp-products-headline').text.to.equal(DATA.PRODUCT_HEADLINE);
        } else {
          client
            .frame(2)
            .waitForElementVisible('p.tvp-products-text', DATA.SLA);

          client.expect.element('p.tvp-products-text').text.to.equal(DATA.PRODUCT_HEADLINE);
        }
      }

      if(!skip){
        this.modalClose(target);        
      }

      return this;
    },
    modalLoadPerformance: function (target, video, target, targetIframe, skip) {
      if(!skip){
        client.frameParent()
          .pause(SECOND),
        //  .frame(TARGET_IFRAME),
        this.modalLoad(video, 160, 100),
        this.pause();
      }
      

      TARGET_IFRAME = targetIframe;

      if (isSafari === true) {
        client
          .waitForElementPresent(target, DATA.SLA)
          .frame(TARGET_IFRAME);
      } else {
        client
          .waitForElementVisible(target, DATA.SLA)
          .waitForElementVisible(target + " iframe.tvp-iframe-modal[gesture='media']", DATA.SLA)
          .frame(TARGET_IFRAME);
      }

      this.pause();
    },
    modalClose: function (target) {
      client.frameParent(),
      this.pause();

      this.moveAndClick(target + " " + ELEMENT_MODAL_CLOSE, DATA.SLA, 10, 10, 'left', true);

      client.expect.element(ELEMENT_MODAL_OVERLAY).to.have.css('display', 'hidden');
      client.expect.element(target).to.have.css('display', 'none');

      this.pause();
    },

    products: function (featuredId, product) {
      if (product === undefined) {
        product = {
          "ID": 83102610,
          "URL": "http://www.ninjakitchen.com/products/0/all/67/ninja-coffee-bar-with-glass-carafe/",
          "SECURE_URL": "https://www.ninjakitchen.com/products/0/all/67/ninja-coffee-bar-with-glass-carafe/",
          "TITLE_REGEX": /Ninja\ Coffee\ Bar®\ with\ Glass\ Carafe/i,
          "IMG": "http://www.ninjakitchen.com/include/images/products/hero-CF080.jpg",
          "PRICE": ""
        }
      }

      client.waitForElementVisible(featuredId, DATA.SLA);

      client.expect.element(featuredId + " a[data-id='" + product.ID + "']").to.be.visible;
      client.expect.element(featuredId + " a[data-id='" + product.ID + "']").to.have.attribute('href', product.URL);

      client.click(featuredId + " a[data-id='" + product.ID + "']");
    },

    productSanity: function (product, productTarget, productClick, productIframe, isPopup) {
      var THAT = this;

      if (product === undefined) {
        product = {
          "ID": 83102610,
          "URL": "http://www.ninjakitchen.com/products/0/all/67/ninja-coffee-bar-with-glass-carafe/",
          "SECURE_URL": "https://www.ninjakitchen.com/products/0/all/67/ninja-coffee-bar-with-glass-carafe/",
          "TITLE_REGEX": /Ninja\ Coffee\ Bar®\ with\ Glass\ Carafe/i,
          "IMG": "http://www.ninjakitchen.com/include/images/products/hero-CF080.jpg",
          "PRICE": ""
        }
      }

      if (productTarget === undefined) {
        productTarget = "a#tvp-product-" + product.ID;
      }

      if (productClick === undefined) {
        productClick = '';
      }

      if (productIframe === undefined) {
        productIframe = TARGET_IFRAME;
      }

      var regex = (product.TITLE_REGEX !== undefined ? product.TITLE_REGEX : /\ /i);

      if (isSafari !== true) {
        client
          .frameParent()
          .frame(productIframe)
          .waitForElementVisible(parent, DATA.SLA);
          
          client.expect.element(parent + " " + productTarget).to.be.visible;
          client.expect.element(parent + " " + productTarget).to.have.attribute('href', product.URL);

        client
          .click(parent + " " + productTarget + " " + productClick)
          .pause(2*SECOND);
      } else {
        client
          .frameParent()
          .frame(productIframe)
          .click(parent + " " + productTarget + " " + productClick)
          .pause(2*SECOND);
      }

      if (isPopup === false) {
        return this.windowHandles(0, 1);
      }

      // Product pop-up
      client
        .moveToElement(parent + " " + productTarget, 70, 70)
        .pause(2*SECOND, function (r) {
        // if (isMobile === false) {
        //   client.expect.element(parent + " a#tvp-product-" + product.ID).to.have.attribute('class', 'tvp-product active');
        //   client.expect.element(parent + " a#tvp-product-popup-" + product.ID).to.be.present;
        //   client.expect.element(parent + " a#tvp-product-popup-" + product.ID).to.have.attribute('href', product.URL);
        //   client.expect.element(parent + " a#tvp-product-popup-" + product.ID + " > div.tvp-product-popup-image").to.have.css("background-image", "url(" + product.IMG + ");");
        //   client.expect.element(parent + " a#tvp-product-popup-" + product.ID + " > p.tvp-product-title").text.to.match(regex);
        //   client.expect.element(parent + " a#tvp-product-popup-" + product.ID + " > p.tvp-product-price").text.to.equal(product.PRICE);
        //   client.expect.element(parent + " a#tvp-product-popup-" + product.ID + " > button.tvp-product-cta").to.be.present;
        //   client.expect.element(parent + " div.tvp-inner-arrow-indicator").to.be.present;
        // }
        });

      return this.windowHandles(0, 1);
    },
    windowHandles: function (current, target) {
      client
        .frameParent()
        .windowHandles(function(r) {
          this.switchWindow(r.value[target]),
          this.closeWindow(),
          this.switchWindow(r.value[current]);
        });

      return this;
    },
    productSanityLink: function (skip, product) {
      if (product === undefined) {
        product = {
          "ID": 83102610,
          "URL": "http://www.ninjakitchen.com/products/0/all/67/ninja-coffee-bar-with-glass-carafe/",
          "SECURE_URL": "https://www.ninjakitchen.com/products/0/all/67/ninja-coffee-bar-with-glass-carafe/",
          "TITLE_REGEX": /Ninja\ Coffee\ Bar®\ with\ Glass\ Carafe/i,
          "IMG": "http://www.ninjakitchen.com/include/images/products/hero-CF080.jpg"
        }
      }

      // Click on product from modal
      if (isMobile === true) {
        client
          .click(parent + " a#tvp-product-" + product.ID)
          .windowHandles(function (result) {
            this.switchWindow(result.value[1]);
            this.verify.urlContains(product.SECURE_URL);
            this.closeWindow();

            this.switchWindow(result.value[0]);
            this.waitForElementVisible("div#" + ELEMENT_MODAL_IFRAME_HOLDER, DATA.SLA);
            this.waitForElementVisible("iframe.tvp-iframe-modal[gesture='media']", DATA.SLA);
            this.frame(TARGET_IFRAME);
          })
          .pause(2*SECOND);
      } else {
        if (DATA.isFF) {
          return;
        }
        client
          .waitForElementVisible(parent + " a#tvp-product-" + product.ID, DATA.SLA)
          .moveToElement(parent + " a#tvp-product-" + product.ID, 70, 70)
          .waitForElementVisible(parent + "  a#tvp-product-popup-" + product.ID, DATA.SLA)
          .pause(SECOND)
          .mouseButtonClick("left")
          .windowHandles(function (result) {
            this.switchWindow(result.value[1]),
            this.verify.urlContains(product.SECURE_URL),
            this.closeWindow(),

            this.switchWindow(result.value[0]),
            this.waitForElementVisible("div#tvp-modal-iframe-holder-carousel-1", DATA.SLA),
            this.waitForElementVisible("iframe.tvp-iframe-modal[gesture='media']", DATA.SLA),
            this.frame(TARGET_IFRAME);
          })
          .pause(5*SECOND);

        // Click on product from pop-up thumnail
        client
          .waitForElementVisible(parent + " a#tvp-product-" + product.ID, DATA.SLA)
          .moveToElement(parent + " a#tvp-product-" + product.ID, 70, 70)
          .waitForElementVisible(parent + " a#tvp-product-popup-" + product.ID + " div.tvp-product-popup-image", DATA.SLA)
          .moveToElement(parent + " a#tvp-product-popup-" + product.ID + " div.tvp-product-popup-image", 105, 105)
          .mouseButtonClick("left")
          .pause(SECOND)
          .windowHandles(function (result) {
            if(skip){
              return;
            }
            this.switchWindow(result.value[1]),
            this.verify.urlContains(product.SECURE_URL),
            this.closeWindow(),

            this.switchWindow(result.value[0]),
            this.waitForElementVisible("div#tvp-modal-iframe-holder-carousel-1", DATA.SLA),
            this.waitForElementVisible("iframe.tvp-iframe-modal[gesture='media']", DATA.SLA),
            this.frame(TARGET_IFRAME);
          })
          .pause(5*SECOND);

        // Click on product from pop-up title
        client
          .waitForElementVisible(parent + " a#tvp-product-" + product.ID, DATA.SLA)
          .moveToElement(parent + " a#tvp-product-" + product.ID, 70, 70)
          .waitForElementVisible(parent + " a#tvp-product-popup-" + product.ID + " p.tvp-product-title", DATA.SLA)
          .moveToElement(parent + " a#tvp-product-popup-" + product.ID + " p.tvp-product-title", 40, 20)
          .pause(SECOND)
          .mouseButtonClick("left")
          .windowHandles(function (result) {
            if(skip){
              return;
            }
            this.switchWindow(result.value[1]),
            this.verify.urlContains(product.SECURE_URL),
            // this.closeWindow(),

            this.switchWindow(result.value[0]),
            this.waitForElementVisible("div#tvp-modal-iframe-holder-carousel-1", DATA.SLA),
            this.waitForElementVisible("iframe.tvp-iframe-modal[gesture='media']", DATA.SLA),
            this.frame(TARGET_IFRAME);
          })
          .pause(5*SECOND);

        // Click on product from pop-up cta
        client
          .waitForElementVisible(parent + " a#tvp-product-" + product.ID, DATA.SLA)
          .moveToElement(parent + " a#tvp-product-" + product.ID, 70, 70)
          .waitForElementVisible(parent + " a#tvp-product-popup-" + product.ID + " button.tvp-product-cta", DATA.SLA)
          .moveToElement(parent + " a#tvp-product-popup-" + product.ID + " button.tvp-product-cta", 40, 20)
          .mouseButtonClick("left")
          .pause(SECOND)
          .windowHandles(function (result) {
            if(skip){
              return;
            }
            this.switchWindow(result.value[1]),
            this.verify.urlContains(product.SECURE_URL),
            this.closeWindow(),

            this.switchWindow(result.value[0]),
            this.waitForElementVisible("div#tvp-modal-iframe-holder-carousel-1", DATA.SLA),
            this.waitForElementVisible("iframe.tvp-iframe-modal[gesture='media']", DATA.SLA),
            this.frame(TARGET_IFRAME);
          })
          .pause(5*SECOND);
      }
    },
    playerLoadPerformance: function (count) {
      TARGET_IFRAME = count;

      if (count !== undefined)
        client.frame(TARGET_IFRAME);

      client.element(SELECTOR_TYPE)
        .waitForElementVisible(parent + " div#tvplayer-playbutton", DATA.SLA)
        .waitForElementPresent(parent + " div#ControlBarFloater", DATA.SLA);

      // // sanity check
      // client.expect.element(parent + " div#ControlBarFloater > div.tvp-control-volume-container").to.be.present;
      // client.expect.element(parent + " div#ControlBarFloater > div.tvp-control-volume-container > div.tvp-control-volume-selector-container").to.be.present;
      // client.expect.element(parent + " div#ControlBarFloater > div.tvp-control-volume-container").to.be.present;
      // client.expect.element(parent + " div#CtrlClosedCaptionImage").to.be.present;

      // tvplayer icon check
      // client.expect.element(parent + " #tvplayer-playbutton-icon").to.be.present;
    },

    playerStart: function (videoIframe, playerParent, x, y) {
      if (videoIframe === undefined)
        videoIframe = TARGET_IFRAME;

      if (playerParent !== undefined)
        parent = playerParent;

      client
        .frameParent()
        .frame(videoIframe);

      if (isFF === true) {
        client.waitForElementPresent(parent + ' div#tvplayer-playbutton-icon', DATA.SLA),
        client.expect.element(parent + " div#tvplayer-playbutton-icon").to.be.present;
      } else {
        client.waitForElementVisible(parent + ' div#tvplayer-playbutton-icon', DATA.SLA),
        client.expect.element(parent + " div#tvplayer-playbutton-icon").to.be.present;
      }

      if (isFF === true || isEdge === true || isIE === true) {
        client.click(parent + ' div#tvplayer-playbutton-icon');
      } else {
        this.moveAndClick(parent + ' div#tvplayer-playbutton-icon', 12, 15);        
      }

      client.waitForElementPresent(parent + " div#tvp-spinner", DATA.SLA),
      client.waitForElementNotVisible(parent + ' div#tvp-spinner', DATA.SLA);

      if (isFF !== true && isEdge !== true && isIE !== true) {
        client.waitForElementNotPresent(parent + ' div#tvplayer-playbutton', DATA.SLA),
        client.waitForElementNotPresent(parent + ' div#tvplayer-playbutton-icon', DATA.SLA);
      }

      isPlaying = true;

      return this.pause(3);
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
      client.element(SELECTOR_TYPE)
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

        client.element(SELECTOR_TYPE)
          .moveToElement(parent + ' div.tvp-control-overlay', x, y)
          .mouseButtonDown("left")
          .pause(SECOND)
          .moveToElement(parent + " " + target, x, y)
          .mouseButtonUp("left");

        if (isFullScreen === false) {
          client.waitForElementVisible(parent + " " + target, DATA.SLA);
        }
      } else {
        client.element(SELECTOR_TYPE)
          .moveToElement(parent + ' div.tvp-control-overlay', x, y)
          .waitForElementPresent(parent + " " + target, DATA.SLA)
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

      client.element(SELECTOR_TYPE)
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
      client.element(SELECTOR_TYPE)
        .getText(selector, function (result) {
            this.assert.equal(typeof result, "object");
            this.assert.equal(result.status, 0);
            this.assert.equal(result.value, expected);
        });
    },
    iframe: function (count) {
      TARGET_IFRAME = count;
      client.frame(TARGET_IFRAME);
    },
    keys: function (key, callback) {
      client.keys(key, callback);
    },
    pause: function (count) {
      if (count === undefined) {
        count = 1;
      }

      client.pause(count * SECOND);

      return this;
    },
    end: function () {
      client.end();
      return this;
    },
    analyticReset: function () {
      aCounts = {'ci': 0, 'vv': 0, 'pi': 0, 'pk': 0};
    },
    analytics: function(frame, events, aData) {
      var widgetTest = this,
          skipCount = (aData.SKIP_COUNT !== undefined ? aData.SKIP_COUNT : false),
          tests = {
            'ci': function(client, src, current) {
              console.log(">>> Checking CI <<<");

              client.waitForElementVisible('p.analtyticsTestCI', 6000);
              client.expect.element('p.analtyticsTestCI').to.be.present;
              this.assert.ok(aCounts['ci'] > 0);

              var li = getParameterByName('li', src);
              this.assert.equal(li, aData.LOGIN_ID);

              var url = getParameterByName('url', src);
              this.assert.equal(url, DATA.URL);

              var cid = getParameterByName('cid', src);
              this.assert.ok(cid);
            },
            'vv': function(client, src, current) {
              console.log(">>> Checking VV <<<");

              var li = getParameterByName('li', src);
              this.assert.equal(li, aData.LOGIN_ID);

              var url = getParameterByName('url', src);
              this.assert.equal(url, DATA.URL);

              var pg = getParameterByName('pg', src);
              this.assert.equal(pg, aData.CHANNEL_ID);

              var vd = getParameterByName('vd', src);

              // checking if videos already played
              this.assert.equal(false, inArray(aData.VIDS[current], vids));
              this.assert.equal(vd, aData.VIDS[current]);

              vids.push(aData.VIDS[current]);

              client.waitForElementPresent('p.analtyticsTestVV', 6000);
              client.expect.element('p.analtyticsTestVV').to.be.present;

              var vvs = getParameterByName('vvs', src);
              this.assert.ok(vvs);

              DATA.vvs = vvs;
            },
            'pi': function(client, src, current) {
              var THAT = this;
              console.log(">>> Checking PI ");

              var url = getParameterByName('url', src);
              this.assert.equal(url, DATA.URL);
              var li = getParameterByName('li', src);
              this.assert.equal(li, aData.LOGIN_ID);
              var pg = getParameterByName('pg', src);
              this.assert.equal(pg, aData.CHANNEL_ID);

              var cid = getParameterByName('cid', src);
              this.assert.ok(cid !== "");

              var vd = getParameterByName('vd', src);
              THAT.assert.equal(vd, aData.VIDS[current]);

              var productId = getParameterByName('ct', src);

              console.log("Expected Product ID: " + productId);
              var found = inArray(productId, aData.PIDS[current]);
              this.assert.equal(found, true);
            },
            'pk': function(client, src, current) {
              console.log(">>> Checking PK <<<");

              client.waitForElementVisible('p.analtyticsTestPK', 6000);
              client.expect.element('p.analtyticsTestPK').to.be.present;
              var url = getParameterByName('url', src);
              this.assert.equal(url, DATA.URL);

              var li = getParameterByName('li', src);
              this.assert.equal(li, aData.LOGIN_ID);

              var pg = getParameterByName('pg', src);
              this.assert.equal(pg, aData.CHANNEL_ID);

              var cid = getParameterByName('cid', src);
              this.assert.ok(cid);

              var vd = getParameterByName('vd', src);
              this.assert.equal(vd, aData.VIDS[current]);

              var ct = getParameterByName('ct', src);
              this.assert.equal(ct, aData.PKIDS[current]);

              client.elements("class name", "analtyticsTestPK", function(result) {
                this.assert.ok(aCounts['pk'] <= result.value.length);
              });
            }
          };

      // if (mIframe !== undefined) {
      //   client
      //     .frame(mIframe)
      //     .elements("tag name", "script", function(elements) {
      //       console.log(">>> Checking CI Event on Landing Page");

      //       elements.value.forEach(function(script) {
      //         client.elementIdAttribute(script.ELEMENT, 'src', function(element) {
      //           var src = element.value,
      //               key = 'ci',
      //               THAT = this;

      //           if (src.indexOf('rt=' + key) >= 0) {
      //             var test = tests[key].bind(THAT, client, src, undefined);

      //             aCounts[key]++;
      //             test();
      //           }
      //         });
      //       });
      //     })
      //     .frameParent();
      // }

      client
        .frameParent()
        .frame(frame)
        .elements("tag name", "script", function(result) {
          console.log(">>> Widget Analytics Testing [" + frame + "] <<<");

          result.value.forEach(function(script, rIndex) {
            client.elementIdAttribute(script.ELEMENT, 'src', function(element) {
              var src = element.value,
                  THAT = this;
              events.forEach(function (key, eIndex) {

                if (src.indexOf('rt=' + key) >= 0) {
                  var vd = getParameterByName('vd', src),
                      current = inArray(vd, aData.VIDS, true);

                  aCounts[key]++;

                  var test = tests[key].bind(THAT, client, src, current);
                  test();
                }

                // Checking counts if loop reaches end of script list and event list
                if (skipCount === false && eIndex == (events.length - 1) && rIndex == (result.value.length - 1)) {
                  console.log(">>> Analytic Events Count Check <<<");
                  events.forEach(function (event) {
                    console.log("Expected [" + event + "] " + aData.COUNTS[event]);
                    console.log("Actual [" + event + "] " + aCounts[event]);
                    THAT.assert.equal(aCounts[event], aData.COUNTS[event]);
                  });

                  if (ANALYTIC_RESET === true) {
                    widgetTest.analyticReset();
                  }
                }
              });
            });
          });
        })
    }
  };
};
