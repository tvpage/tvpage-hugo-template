
const { URL, URLSearchParams } = require('url');

exports.tvpGUITest = function (options) {
  const SECOND = 2000;

  var CLIENT, TARGET_IFRAME, PARENT, msg,
      IS_FULLSCREEN = false,
      IS_MOBILE = (options !== undefined && options.IS_MOBILE ? options.IS_MOBILE : false),
      IS_FF = (options !== undefined && options.IS_FF ? options.IS_FF : false),
      IS_IE = (options !== undefined && options.IS_IE ? options.IS_IE : false),
      IS_EDGE = (options !== undefined && options.IS_EDGE ? options.IS_EDGE : false),
      IS_SAFARI = (options !== undefined && options.IS_SAFARI ? options.IS_SAFARI : false),
      ORIENTATION =  (options !== undefined && options.ORIENTATION ? options.ORIENTATION : 'PORTRAIT'),

      SELECTOR_TYPE = (options !== undefined && options.SELECTOR_TYPE !== undefined ? options.SELECTOR_TYPE : "css selector"),

      ELEMENT_MODAL_OVERLAY = options.ELEMENT_MODAL_OVERLAY,
      ELEMENT_MODAL_OPEN = options.ELEMENT_MODAL_OPEN,
      ELEMENT_MODAL_CLOSE = options.ELEMENT_MODAL_CLOSE,
      ELEMENT_MODAL_TITLE = options.ELEMENT_MODAL_TITLE,
      ELEMENT_MODAL_CLOSE_BUTTON = options.ELEMENT_MODAL_CLOSE_BUTTON,
      ELEMENT_MODAL_IFRAME_HOLDER = options.ELEMENT_MODAL_IFRAME_HOLDER,

      widgetNavHolder = options.widgetNavHolder,
      widgetNavPrev = options.widgetNavPrev,
      widgetNavNext = options.widgetNavNext,

      DATA = (options !== undefined && options.DATA !== undefined ? options.DATA : {}),
      WIDGET_URL = DATA.BASE_URL + DATA.WIDGET_TYPE + "/",
      debug = false;

  var aCounts = {ci: 0,vv: 0,vt: 0,vtp: 0,pi: 0,pk: 0},
      vids = [];

  if (DATA.SLA === undefined)
    DATA.SLA = SECOND;

  if (DATA.BROWSERHEIGHT === undefined)
    DATA.BROWSERHEIGHT = 900;

  if (DATA.BROWSEWIDTH === undefined)
    DATA.BROWSEWIDTH = 1440;

  if (DATA.IS_FF === undefined)
    DATA.IS_FF = false;

  var log = function (result) {
    if (debug === true) {
      console.log(">> DEBUG: <<");
      console.log(result);
    }

    if (msg !== undefined && msg !== "")
      console.log(">> " + msg + " <<");

    msg = undefined;
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

  var findKeys = function(key, idx, needle, haystack) {
    var obj = [];

    haystack.forEach(function(v, i) {
      if (needle == v[key]) {
        obj = v[idx];
      }      
    });

    return obj;
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
      PARENT = target;
      CLIENT = browser;

      msg = type;
      log();

      CLIENT
        .url(WIDGET_URL, function (r) {
          if (IS_MOBILE === false) {
            this
              .setWindowPosition(0,0)
              .resizeWindow(DATA.BROWSEWIDTH, DATA.BROWSERHEIGHT);
          }

          if (IS_MOBILE === true && ORIENTATION !== undefined) {
            this.setOrientation(ORIENTATION);
          }
        })
        .pause(2*SECOND);

      if (PARENT !== "") {
        CLIENT.waitForElementVisible(widgetHolder + " iframe[gesture=media]", DATA.SLA);
      }

      if (DATA.SKIP_INIT_COUNT !== true) {
        // CI check for Initial Widget Load
        this.analytics(TARGET_IFRAME, ['ci'], {
          LOGIN_ID: DATA.LOGIN_ID,
          CHANNEL_ID: DATA.CHANNEL_ID,
          COUNTS: {"ci": DATA.WIDGET_CI},
          RESET: true
        });
      }

      return CLIENT;
    },

    widgetTitle: function (target, title, expected) {
      var THAT = this;

      CLIENT
        .frameParent()
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

      CLIENT
        .frameParent()
        .frame(TARGET_IFRAME)
        .element(SELECTOR_TYPE)
        .waitForElementVisible(target + " " + widgetNavHolder, DATA.SLA);

      CLIENT.element(SELECTOR_TYPE)
        .waitForElementVisible(target + " " + widgetNavPrev, DATA.SLA)
        .waitForElementVisible(target + " " + widgetNavNext, DATA.SLA);

      for (i=0;i < count;i++) {
        CLIENT.element(SELECTOR_TYPE)
        .click(target +  " " + widgetNavNext)
        .pause(SECOND);

        index++;
        CLIENT.expect.element("div[data-slick-index='" + i + "']").to.have.attribute('aria-hidden').which.equals('true');
      }

      for (i=0;i < count;i++) {
        CLIENT.element(SELECTOR_TYPE)
        .click(target + " " + widgetNavPrev)
        .pause(SECOND);

        CLIENT.expect.element("div[data-slick-index='" + index-- + "']").to.have.attribute('aria-hidden').which.equals('false');
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
        CLIENT
          .frameParent()
          .frame(TARGET_IFRAME)
          .element(SELECTOR_TYPE)
          .waitForElementVisible(target, DATA.SLA)
          .moveToElement(target, x, y)
          .mouseButtonClick(button);
      } else {
        CLIENT
          .frameParent()
          .frame(TARGET_IFRAME)
          .element(SELECTOR_TYPE)
          .waitForElementPresent(target, DATA.SLA)
          .moveToElement(target, x, y)
          .mouseButtonClick(button);
      }

      return this;
    },
    modalLoad: function (target, x, y) {
      var elementModalOpen = target + " " + ELEMENT_MODAL_OPEN;

      x = (x === undefined ? 10 : x);
      y = (y === undefined ? 10 : y);

      if (IS_FF !== true && IS_EDGE !== true && IS_IE !== true) {
        CLIENT
          .frameParent()
          .frame(TARGET_IFRAME)
          .waitForElementPresent(elementModalOpen, DATA.SLA)
          .moveToElement(elementModalOpen, x, y)
          .mouseButtonClick('left');
      } else {
        CLIENT
          .frameParent()
          .frame(TARGET_IFRAME)
          .waitForElementPresent(elementModalOpen, DATA.SLA)
          .click(elementModalOpen);
      }

      return this;
    },
    modalSanity: function (target, video, videoTitle, targetIframe, skip, hasHeadline) {
      this.modalLoad(video),
      this.pause();

      CLIENT
        .frameParent()
        .waitForElementVisible(target, DATA.SLA)
        .waitForElementVisible(target + " " + ELEMENT_MODAL_TITLE, DATA.SLA)
        .waitForElementVisible(target + " " + ELEMENT_MODAL_CLOSE_BUTTON, DATA.SLA)
        .pause(SECOND);

      CLIENT.expect.element(target + " " + ELEMENT_MODAL_TITLE).text.to.equal(videoTitle),
      CLIENT.expect.element(target + " " + ELEMENT_MODAL_CLOSE_BUTTON).to.be.present;

      if (targetIframe !== undefined) {
        TARGET_IFRAME = targetIframe;
      }

      CLIENT
        .frameParent()
        .frame(TARGET_IFRAME)

      if (hasHeadline === true) {
        if (IS_MOBILE === false) {
          CLIENT.waitForElementVisible(target + ' div.tvp-products-headline', DATA.SLA),
          CLIENT.expect.element(target + ' div.tvp-products-headline').text.to.equal(DATA.PRODUCT_HEADLINE);
        } else {
          CLIENT
            .frame(2)
            .waitForElementVisible('p.tvp-products-text', DATA.SLA),
          CLIENT.expect.element('p.tvp-products-text').text.to.equal(DATA.PRODUCT_HEADLINE);
        }
      }

      if(!skip){
        this.modalClose(target);        
      }

      return this;
    },
    modalLoadPerformance: function (target, video, target, targetIframe, skip) {
      if(!skip){
        CLIENT
          .frameParent()
          .pause(SECOND),
        this.modalLoad(video, 160, 100),
        this.pause();
      }

      TARGET_IFRAME = targetIframe;

      if (IS_SAFARI === true) {
        CLIENT
          .waitForElementPresent(target, DATA.SLA)
          .frame(TARGET_IFRAME);
      } else {
        CLIENT
          .waitForElementVisible(target, DATA.SLA)
          .waitForElementVisible(target + " iframe.tvp-iframe-modal[gesture='media']", DATA.SLA)
          .frame(TARGET_IFRAME);
      }

      this.pause();
    },
    modalClose: function (target) {
      CLIENT.frameParent(),
      this.pause();

      this.moveAndClick(target + " " + ELEMENT_MODAL_CLOSE, DATA.SLA, 10, 10, 'left', true);

      CLIENT.expect.element(ELEMENT_MODAL_OVERLAY).to.have.css('display', 'hidden');
      CLIENT.expect.element(target).to.have.css('display', 'none');

      this.pause();
    },

    products: function (featuredId, product) {
      if (product === undefined) {
        product = {
          ID: 83102610,
          URL: "http://www.ninjakitchen.com/products/0/all/67/ninja-coffee-bar-with-glass-carafe/",
          SECURE_URL: "https://www.ninjakitchen.com/products/0/all/67/ninja-coffee-bar-with-glass-carafe/",
          TITLE_REGEX: /Ninja\ Coffee\ Bar®\ with\ Glass\ Carafe/i,
          IMG: "http://www.ninjakitchen.com/include/images/products/hero-CF080.jpg",
          PRICE: ""
        }
      }

      CLIENT.waitForElementVisible(featuredId, DATA.SLA);

      CLIENT.expect.element(featuredId + " a[data-id='" + product.ID + "']").to.be.visible;
      CLIENT.expect.element(featuredId + " a[data-id='" + product.ID + "']").to.have.attribute('href', product.URL);

      CLIENT.click(featuredId + " a[data-id='" + product.ID + "']");
    },

    productSanity: function (product, productTarget, productClick, iframe, isPopup) {
      var THAT = this;

      if (product === undefined) {
        product = {
          ID: 83102610,
          URL: "http://www.ninjakitchen.com/products/0/all/67/ninja-coffee-bar-with-glass-carafe/",
          SECURE_URL: "https://www.ninjakitchen.com/products/0/all/67/ninja-coffee-bar-with-glass-carafe/",
          TITLE_REGEX: /Ninja\ Coffee\ Bar®\ with\ Glass\ Carafe/i,
          IMG: "http://www.ninjakitchen.com/include/images/products/hero-CF080.jpg",
          PRICE: ""
        }
      }

      if (productTarget === undefined) {
        productTarget = "a#tvp-product-" + product.ID;
      }

      if (productClick === undefined) {
        productClick = '';
      }

      if (iframe === undefined) {
        iframe = TARGET_IFRAME;
      }

      var regex = (product.TITLE_REGEX !== undefined ? product.TITLE_REGEX : /\ /i),
          doNotCloseWindow = false;

      if (IS_SAFARI !== true) {
        CLIENT
          .frameParent()
          .frame(iframe)
          .waitForElementVisible(PARENT, DATA.SLA),
        CLIENT.expect.element(PARENT + " " + productTarget).to.be.visible,
        CLIENT.expect.element(PARENT + " " + productTarget).to.have.attribute('href', product.URL),
        CLIENT.click(PARENT + " " + productTarget + " " + productClick, function(rc) {
          this.pause(2*SECOND);
        });
      } else {
        CLIENT
          .frameParent()
          .frame(iframe)
          .waitForElementPresent(PARENT + " " + productTarget, DATA.SLA)
          .click(PARENT + " " + productTarget + " " + productClick, function(r) {
            this.pause(2*SECOND);
          });

          doNotCloseWindow = true;
      }

      if (isPopup === false) {
        return this.windowHandles(0, 1, doNotCloseWindow);
      }

      // Product pop-up
      CLIENT
        .moveToElement(PARENT + " " + productTarget, 70, 70, function(r) {
          this.pause(2*SECOND, function(rp) {
          // if (IS_MOBILE === false) {
          //   CLIENT.expect.element(PARENT + " a#tvp-product-" + product.ID).to.have.attribute('class', 'tvp-product active');
          //   CLIENT.expect.element(PARENT + " a#tvp-product-popup-" + product.ID).to.be.present;
          //   CLIENT.expect.element(PARENT + " a#tvp-product-popup-" + product.ID).to.have.attribute('href', product.URL);
          //   CLIENT.expect.element(PARENT + " a#tvp-product-popup-" + product.ID + " > div.tvp-product-popup-image").to.have.css("background-image", "url(" + product.IMG + ");");
          //   CLIENT.expect.element(PARENT + " a#tvp-product-popup-" + product.ID + " > p.tvp-product-title").text.to.match(regex);
          //   CLIENT.expect.element(PARENT + " a#tvp-product-popup-" + product.ID + " > p.tvp-product-price").text.to.equal(product.PRICE);
          //   CLIENT.expect.element(PARENT + " a#tvp-product-popup-" + product.ID + " > button.tvp-product-cta").to.be.present;
          //   CLIENT.expect.element(PARENT + " div.tvp-inner-arrow-indicator").to.be.present;
          // }
          });
        });

      return this.windowHandles(0, 1);
    },
    windowHandles: function (current, target, noClose) {
      CLIENT
        .frameParent()
        .windowHandles(function(r) {
          if (noClose !== true) {
            this
              .switchWindow(r.value[target], function(r) {
                if (IS_IE === true) {
                  this
                    .setWindowPosition(0,0)
                    .resizeWindow(DATA.BROWSEWIDTH, DATA.BROWSERHEIGHT)
                    .closeWindow();
                } else {
                  this.closeWindow();
                }
              })
              .pause(2*SECOND)
              .switchWindow(r.value[current]);
          }
        });

      return this;
    },
    productSanityLink: function (skip, product) {
      if (product === undefined) {
        product = {
          ID: 83102610,
          URL: "http://www.ninjakitchen.com/products/0/all/67/ninja-coffee-bar-with-glass-carafe/",
          SECURE_URL: "https://www.ninjakitchen.com/products/0/all/67/ninja-coffee-bar-with-glass-carafe/",
          TITLE_REGEX: /Ninja\ Coffee\ Bar®\ with\ Glass\ Carafe/i,
          IMG: "http://www.ninjakitchen.com/include/images/products/hero-CF080.jpg"
        }
      }

      // Click on product from modal
      if (IS_MOBILE === true) {
        CLIENT
          .click(PARENT + " a#tvp-product-" + product.ID)
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
        if (DATA.IS_FF) {
          return;
        }
        CLIENT
          .waitForElementVisible(PARENT + " a#tvp-product-" + product.ID, DATA.SLA)
          .moveToElement(PARENT + " a#tvp-product-" + product.ID, 70, 70)
          .waitForElementVisible(PARENT + "  a#tvp-product-popup-" + product.ID, DATA.SLA)
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
        CLIENT
          .waitForElementVisible(PARENT + " a#tvp-product-" + product.ID, DATA.SLA)
          .moveToElement(PARENT + " a#tvp-product-" + product.ID, 70, 70)
          .waitForElementVisible(PARENT + " a#tvp-product-popup-" + product.ID + " div.tvp-product-popup-image", DATA.SLA)
          .moveToElement(PARENT + " a#tvp-product-popup-" + product.ID + " div.tvp-product-popup-image", 105, 105)
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
        CLIENT
          .waitForElementVisible(PARENT + " a#tvp-product-" + product.ID, DATA.SLA)
          .moveToElement(PARENT + " a#tvp-product-" + product.ID, 70, 70)
          .waitForElementVisible(PARENT + " a#tvp-product-popup-" + product.ID + " p.tvp-product-title", DATA.SLA)
          .moveToElement(PARENT + " a#tvp-product-popup-" + product.ID + " p.tvp-product-title", 40, 20)
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
        CLIENT
          .waitForElementVisible(PARENT + " a#tvp-product-" + product.ID, DATA.SLA)
          .moveToElement(PARENT + " a#tvp-product-" + product.ID, 70, 70)
          .waitForElementVisible(PARENT + " a#tvp-product-popup-" + product.ID + " button.tvp-product-cta", DATA.SLA)
          .moveToElement(PARENT + " a#tvp-product-popup-" + product.ID + " button.tvp-product-cta", 40, 20)
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
        CLIENT.frame(TARGET_IFRAME);

      CLIENT.element(SELECTOR_TYPE)
        .waitForElementVisible(PARENT + " div#tvplayer-playbutton", DATA.SLA)
        .waitForElementPresent(PARENT + " div#ControlBarFloater", DATA.SLA);

      // // sanity check
      // CLIENT.expect.element(PARENT + " div#ControlBarFloater > div.tvp-control-volume-container").to.be.present;
      // CLIENT.expect.element(PARENT + " div#ControlBarFloater > div.tvp-control-volume-container > div.tvp-control-volume-selector-container").to.be.present;
      // CLIENT.expect.element(PARENT + " div#ControlBarFloater > div.tvp-control-volume-container").to.be.present;
      // CLIENT.expect.element(PARENT + " div#CtrlClosedCaptionImage").to.be.present;

      // tvplayer icon check
      // CLIENT.expect.element(PARENT + " #tvplayer-playbutton-icon").to.be.present;
    },

    playerStartPause: function (iframe, parent, isStart, x, y) {
      if (iframe === undefined)
        iframe = TARGET_IFRAME;

      if (parent !== undefined)
        PARENT = parent;

      if (isStart === undefined)
        isStart = true;

      CLIENT
        .frameParent()
        .frame(iframe);

      if (isStart === false) {
        CLIENT.waitForElementPresent(PARENT + ' div.tvp-control-overlay', DATA.SLA);

        if (IS_FF === true || IS_EDGE === true || IS_IE === true) {
          CLIENT.click(PARENT + ' div.tvp-control-overlay');
        } else {
          this.moveAndClick(PARENT + ' div.tvp-control-overlay', 5, 5);
        }
      } else {
        if (IS_FF === true) {
          CLIENT.waitForElementPresent(PARENT + ' div#tvplayer-playbutton-icon', DATA.SLA),
          CLIENT.expect.element(PARENT + " div#tvplayer-playbutton-icon").to.be.present;
        } else {
          CLIENT.waitForElementVisible(PARENT + ' div#tvplayer-playbutton-icon', DATA.SLA),
          CLIENT.expect.element(PARENT + " div#tvplayer-playbutton-icon").to.be.present;
        }

        if (IS_FF === true || IS_EDGE === true || IS_IE === true) {
          CLIENT.click(PARENT + ' div#tvplayer-playbutton-icon');
        } else {
          this.moveAndClick(PARENT + ' div#tvplayer-playbutton-icon', 12, 15);        
        }

        CLIENT.waitForElementPresent(PARENT + " div#tvp-spinner", DATA.SLA),
        CLIENT.waitForElementNotVisible(PARENT + ' div#tvp-spinner', DATA.SLA);

        if (IS_FF !== true && IS_EDGE !== true && IS_IE !== true) {
          CLIENT.waitForElementNotPresent(PARENT + ' div#tvplayer-playbutton', DATA.SLA),
          CLIENT.waitForElementNotPresent(PARENT + ' div#tvplayer-playbutton-icon', DATA.SLA);
        }
      }

      return this.pause(3);
    },

    playerSanity: function () {
      this.playerStartPause(),
      this.playerShowControl('div#ControlBarFloater > div.tvp-parent-seekbar'),
      this.playerTime();
    },

    playerClickPause: function () {
      this.moveAndClick(PARENT + ' div#ControlBarFloater > div.tvp-control-playpause', 15, 15);

      if (isStart === false) {
        CLIENT.expect.element(PARENT + ' div#ControlBarFloater > div.tvp-control-playpause path').to.have.attribute("d", this.ICON_PLAYING);
        isStart = true;
      } else {
        CLIENT.expect.element(PARENT + ' div#ControlBarFloater > div.tvp-control-playpause path').to.have.attribute("d", this.ICON_PAUSE);
        isStart = false;
      }

      this.pause(1);
    },
    playerClickOverlay: function () {
      CLIENT.element(SELECTOR_TYPE)
        .waitForElementPresent(paernt + ' div.tvp-control-overlay', DATA.SLA)
        .click(PARENT + ' div.tvp-control-overlay');
    },
    playerPauseAndPlay: function () {
      this.playerClickPause(),
      this.playerTime(),
      this.playerClickPause();
    },
    playerCheckFullScreen: function (keys) {
      if (keys === undefined) {
        if (IS_MOBILE === true) {
          this.playerShowControl("div#ControlBarFloater > div.tvp-control-fullscreen.tvp-controlbar-icon");
          CLIENT.click(PARENT + " div#ControlBarFloater > div.tvp-control-fullscreen.tvp-controlbar-icon");
        } else if (IS_MOBILE === false) {
          this.playerShowControl("div#ControlBarFloater > div.tvp-control-fullscreen.tvp-controlbar-icon"),
          CLIENT.click(PARENT + " div#ControlBarFloater > div.tvp-control-fullscreen.tvp-controlbar-icon");
        }
      } else {
        return false;
      }

      if (IS_FULLSCREEN === false) {
        CLIENT.expect.element(PARENT + ' div.tvp-control-fullscreen.tvp-controlbar-icon > svg.tvp-controlbar-svg path:nth-child(2)').to.have.attribute('d', this.ICON_DEFAULT_SCREEN);
        IS_FULLSCREEN = true;
      } else {
        CLIENT.expect.element(PARENT + ' div.tvp-control-fullscreen.tvp-controlbar-icon > svg.tvp-controlbar-svg path:nth-child(2)').to.have.attribute('d', this.ICON_FULL_SCREEN);
        IS_FULLSCREEN = false;
      }
    },
    playerShowControl: function (target, x, y) {
      if (IS_MOBILE === true) {
        if (x === undefined) {
          x = 20;
        }

        if (y === undefined) {
          y = 20;
        }

        CLIENT
          .element(SELECTOR_TYPE)
          .moveToElement(PARENT + ' div.tvp-control-overlay', x, y)
          .mouseButtonDown("left")
          .pause(SECOND)
          .moveToElement(PARENT + " " + target, x, y)
          .mouseButtonUp("left");

        if (IS_FULLSCREEN === false) {
          CLIENT.waitForElementVisible(PARENT + " " + target, DATA.SLA);
        }
      } else {
        CLIENT
          .element(SELECTOR_TYPE)
          .moveToElement(PARENT + ' div.tvp-control-overlay', x, y)
          .waitForElementPresent(PARENT + " " + target, DATA.SLA)
          .pause(SECOND);
      }
    },
    playerSkip: function (x) {
      var seekbar = 'div#ControlBarFloater > div.tvp-parent-seekbar',
          y = 20;

      if (IS_MOBILE === true) {
        if (ORIENTATION === 'PORTRAIT') {
          y = 4;
        } else if (ORIENTATION === 'LANDSCAPE') {
          y = 16;
        }
      }

      this.playerShowControl(seekbar, x, y),
      this.moveAndClick(PARENT + " " + seekbar, x, y, "left", true),
      this.playerTime();
      
      CLIENT.expect.element(PARENT + ' div#ControlBarFloater > div.tvp-control-playpause').to.have.css('display').which.not.equals('none');
      CLIENT.expect.element(PARENT + ' div#ControlBarFloater > div.tvp-control-fullscreen').to.have.css('display').which.not.equals('none');

      this.pause();
    },
    playerCheckPlaying: function (isFinished) {
      if (isFinished === undefined)
        isFinished = false;

      CLIENT.expect.element(PARENT + ' div#tvp-spinner').to.have.css('display').which.equals('none');

      if (isFinished === false) {
        CLIENT.expect.element(PARENT + ' div#tvplayer-playbutton-icon').to.not.be.present;
        CLIENT.expect.element(PARENT + ' div#tvplayer-playbutton').to.not.be.present;
      } else {
        CLIENT.expect.element(PARENT + ' div#tvplayer-playbutton-icon').to.be.present;
        CLIENT.expect.element(PARENT + ' div#tvplayer-playbutton').to.be.present;

        if (IS_FULLSCREEN === true) {
          //CLIENT.expect.element(PARENT + " div#tvplayer-overlay").not.to.have.css('z-index', '2147483');
        }
      }
    },
    playerTime: function () {
      this.playerShowControl("div#CtrlTime")

      CLIENT
        .element(SELECTOR_TYPE)
        .pause(2*SECOND)
        .waitForElementPresent(PARENT + ' div#CtrlTime', DATA.SLA)
        .getText(PARENT + " div#CtrlTime", function (result) {
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
      CLIENT
        .element(SELECTOR_TYPE)
        .getText(selector, function (result) {
            this.assert.equal(typeof result, "object");
            this.assert.equal(result.status, 0);
            this.assert.equal(result.value, expected);
        });
    },
    iframe: function (count) {
      TARGET_IFRAME = count;
      CLIENT.frame(TARGET_IFRAME);
    },
    keys: function (key, callback) {
      CLIENT.keys(key, callback);
    },
    pause: function (count) {
      if (count === undefined) {
        count = 1;
      }

      CLIENT.pause(count * SECOND);

      return this;
    },
    end: function () {
      CLIENT.end();
      return this;
    },
    analyticReset: function () {
      aCounts = {'ci': 0, 'vv': 0, 'vt': 0, 'vtp': 0, 'pi': 0, 'pk': 0};
    },
    analytics: function(iframe, events, config) {
      var widgetTest = this,
          skipCount = (config !== undefined && config.SKIP_COUNT !== undefined ? config.SKIP_COUNT : false),
          skipCID = (config !== undefined && config.SKIP_CID !== undefined ? config.SKIP_CID : false),
          skipElement = (config !== undefined && config.SKIP_CHECK_ELEMENT !== undefined ? config.SKIP_CHECK_ELEMENT : false),
          tests = {
            'ci': function(client, params, videoIndex) {
              console.log(">>> Checking CI <<<");

              if (skipElement !== true) {
                client.waitForElementVisible('p.analtyticsTestCI', 6000);
                client.expect.element('p.analtyticsTestCI').to.be.present;
                this.assert.ok(aCounts['ci'] > 0);
              }

              var li = params.get('li');
              this.assert.equal(li, DATA.LOGIN_ID);

              var url = params.get('url');
              this.assert.equal(url, WIDGET_URL);

              if (skipCID !== true) {
                var cid = params.get('cid');
                this.assert.ok(cid);
              }
            },
            'vv': function(client, params, videoIndex) {
              console.log(">>> Checking VV <<<");

              var li = params.get('li');
              this.assert.equal(li, DATA.LOGIN_ID);

              var url = params.get('url');
              this.assert.equal(url, WIDGET_URL);

              var pg = params.get('pg');
              this.assert.equal(pg, DATA.CHANNEL_ID);

              var vd = params.get('vd');

              // checking if videos already played
              this.assert.equal(false, inArray(config.VIDS[videoIndex], vids));
              this.assert.equal(vd, config.VIDS[videoIndex]);

              vids.push(config.VIDS[videoIndex]);

              if (skipElement !== true) {
                client.waitForElementPresent('p.analtyticsTestVV', 6000);
                client.expect.element('p.analtyticsTestVV').to.be.present;
              }

              var vvs = params.get('vvs');
              this.assert.ok(vvs);

              if (config.VVSS === undefined) {
                config.VVSS = [];
              }

              config.VVSS.push({VID:vd, VVS:vvs});
            },
            'vt': function(client, params, videoIndex) {
              console.log(">>> Checking VT <<<");

              var li = params.get('li');
              this.assert.equal(li, DATA.LOGIN_ID);

              var url = params.get('url');
              this.assert.equal(url, WIDGET_URL);

              var pg = params.get('pg');
              this.assert.equal(pg, DATA.CHANNEL_ID);

              var vd = params.get('vd');
              this.assert.equal(vd, config.VIDS[videoIndex]);

              var cid = params.get('cid');
              this.assert.ok(cid);

              var vvs = params.get('vvs'),
                  VVS = findKeys('VID', 'VVS', vd, config.VVSS);

              this.assert.equal(vvs, VVS);

              var vdr = params.get('vdr'),
                  VDR = findKeys('VID', 'VDR', vd, config.VDRS);

              console.log(">>> Expected VDR: " + vdr + " <<<");
              if (typeof VDR === 'object') {
                this.assert.ok((VDR.MIN <= vdr && VDR.MAX >= vdr));
              } else {
                this.assert.equal(vdr, VDR);
              }

              var vct = params.get('vct');
              this.assert.ok(vct);
              this.assert.ok((vct >= 2 && vct <= VDR));

              var vt = params.get('vt');
              this.assert.ok(vt);
              this.assert.ok((vt >= 1 && vt <= 3));
            },
            'vtp': function(client, params, videoIndex) {
              console.log(">>> Checking VTP <<<");

              var li = params.get('li');
              this.assert.equal(li, DATA.LOGIN_ID);

              var url = params.get('url');
              this.assert.equal(url, WIDGET_URL);

              var pg = params.get('pg');
              this.assert.equal(pg, DATA.CHANNEL_ID);

              var vd = params.get('vd');
              this.assert.equal(vd, config.VIDS[videoIndex]);

              var cid = params.get('cid');
              this.assert.ok(cid);

              var vvs = params.get('vvs'),
                  VVS = findKeys('VID', 'VVS', vd, config.VVSS);

              this.assert.equal(vvs, VVS);

              var vtp = params.get('vtp'),
                  VTP = findKeys('VID', 'VTP', vd, config.VTPS);
            
              this.assert.ok(vtp);
              this.assert.ok((VTP.MIN <= vtp && VTP.MAX >= vtp));
            },
            'pi': function(client, params, videoIndex) {
              var THAT = this;
              console.log(">>> Checking PI ");

              var url = params.get('url');
              this.assert.equal(url, WIDGET_URL);

              var li = params.get('li');
              this.assert.equal(li, DATA.LOGIN_ID);

              var pg = params.get('pg');
              this.assert.equal(pg, DATA.CHANNEL_ID);

              var cid = params.get('cid');
              this.assert.ok(cid !== "");

              var vd = params.get('vd');
              this.assert.equal(vd, config.VIDS[videoIndex]);

              var productId = params.get('ct');
              console.log("Expected Product ID: " + productId);

              var PIDS = findKeys('VID', 'PIDS', vd, config.PIDS),
                  found = inArray(productId, PIDS);

              this.assert.equal(found, true);
            },
            'pk': function(client, params, videoIndex) {
              console.log(">>> Checking PK <<<");

              if (skipElement !== true) {
                client.waitForElementVisible('p.analtyticsTestPK', 6000);
                client.expect.element('p.analtyticsTestPK').to.be.present;
              }

              var url = params.get('url');
              this.assert.equal(url, WIDGET_URL);

              var li = params.get('li');
              this.assert.equal(li, DATA.LOGIN_ID);

              var pg = params.get('pg');
              this.assert.equal(pg, DATA.CHANNEL_ID);

              var cid = params.get('cid');
              this.assert.ok(cid !== "");

              var vd = params.get('vd');
              this.assert.equal(vd, config.VIDS[videoIndex]);

              var ct = params.get('ct'),
                  PKID = findKeys('VID', 'PKID', vd, config.PKIDS);
              this.assert.equal(ct, PKID);
            }
          };

      CLIENT
        .frameParent()
        .frame(iframe)
        .elements("tag name", "script", function(result) {
          console.log(">>> Widget Analytics Testing [" + iframe + "] <<<");

          result.value.forEach(function(script, rIndex) {
            CLIENT.elementIdAttribute(script.ELEMENT, 'src', function(element) {
              try {
                var url = new URL(element.value),
                    params = new URLSearchParams(url.searchParams);
              } catch(e) {
                console.log(">>> Invalid Analytic URL: " + element.value + " <<<");
                var params = new URLSearchParams("");
              }

              var THAT = this;

              events.forEach(function (key, eIndex) {
                if (params.get('rt') == key) {
                  var vd = params.get('vd'),
                      videoIndex = inArray(vd, config.VIDS, true);

                  aCounts[key]++;

                  var test = tests[key].bind(THAT, CLIENT, params, videoIndex);
                  test();
                }

                // Checking counts if loop reaches end of script list and event list
                if (skipCount !== true && eIndex == (events.length - 1) && rIndex == (result.value.length - 1)) {
                  console.log(">>> Analytic Events Count Check <<<");

                  events.forEach(function (event) {
                    console.log("Expected [" + event + "]", config.COUNTS[event]);
                    console.log("Actual [" + event + "] " + aCounts[event]);

                    if (typeof config.COUNTS[event] === 'object') {
                      THAT.assert.ok((config.COUNTS[event].MIN <= aCounts[event] && config.COUNTS[event].MAX >= aCounts[event]));
                    } else {
                      THAT.assert.equal(aCounts[event], config.COUNTS[event]);
                    }
                  });

                  if (config.RESET === true) {
                    widgetTest.analyticReset();
                  }
                }
              });
            });
          });
        });

      return this;
    }
  };
};
