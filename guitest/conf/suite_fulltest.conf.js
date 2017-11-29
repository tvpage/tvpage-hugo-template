nightwatch_config = {
  src_folders : [ "test/specs/" ],

  selenium : {
    "start_process" : false,
    "host" : "hub-cloud.browserstack.com",
    "port" : 80
  },

  common_capabilities: {
    'browserstack.user': process.env.BROWSERSTACK_USERNAME || 'pascualtorres1',
    'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY || '2ATTF6UbzybcwfcideHN',
    'browserstack.debug': true,
  },

  test_settings: {
    default: {},
    CarouselW10GC61: {
      desiredCapabilities: {
        'build': 'CarouselW10GC61',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Chrome',
        'browser_version': '61.0',
        'resolution': '1920x1080'
        // 'os': 'Windows',
        // 'os_version': '10',
        // 'browser': 'Chrome',
        // 'browser_version': '61.0',
        // 'resolution': '1920x1080'
      },
      filter: "desktop/carousel/test.js"
    },
    CarouselW10FF55: {
      desiredCapabilities: {
        'build': 'CarouselWin10FF55',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Firefox',
        'browser_version': '55.0'
      },
      filter: "desktop/carousel/W10FF55.js"
    },
    CarouselW10IE11: {
      desiredCapabilities: {
        'build': 'CarouselW10IE11',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'IE',
        'browser_version': '11.0',
      },
      filter: "desktop/carousel/W10IE11.js"
    },
    CarouselW10E15: {
      desiredCapabilities: {
        'build': 'CarouselW10E15',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Edge',
        'browser_version': '15.0'
      },
      filter: "desktop/carousel/W10E15.js"
    },
    CarouselW8GC61: {
      desiredCapabilities: {
        'build': 'CarouselW8GC61',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Chrome',
        'browser_version': '61.0',
      },
      filter:  "desktop/carousel/W8GC61.js"
    },
    CarouselW8IE11: {
      desiredCapabilities: {
        'build': 'CarouselW8IE11',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'IE',
        'browser_version': '11.0'
      },
      filter: "desktop/carousel/W8IE11.js"
    },
    CarouselW8FF55: {
      desiredCapabilities: {
        'build': 'CarouselW8FF55',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Firefox',
        'browser_version': '55.0'
      },
      filter: "desktop/carousel/W8FF55.js"
    },
    CarouselOSXSierraS10: {
      desiredCapabilities: {
        'build': 'CarouselOSXSierraS10',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Safari',
        'browser_version': '10.1'
      },
      filter:  "desktop/carousel/OSXSierraS10.js"
    },
    CarouselOSXSierraGC61: {
      desiredCapabilities: {
        'build': 'CarouselOSXSierraGC61',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0',
      },
      filter: "desktop/carousel/OSXSierraGC61.js"
    },
    CarouselOSXSierraFF55: {
      desiredCapabilities: {
        'build': 'CarouselOSXSierraFF55',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Firefox',
        'browser_version': '56.0'
      },
      filter: "desktop/carousel/OSXSierraFF55.js"
    },
    CarouselOSXHighSierraS11: {
      desiredCapabilities: {
        'build': 'CarouselOSXHighSierraS11',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Safari',
        'browser_version': '11.0'
      },
      filter: "desktop/carousel/OSXHighSierraS11.js"
    },
    CarouselOSXHighSierraGC61: {
      desiredCapabilities: {
        'build': 'CarouselOSXHighSierraGC61',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0'
      },
      filter: "desktop/carousel/OSXHighSierraGC61.js"
    },
    CarouselOSXHighSierraFF55: {
      desiredCapabilities: {
        'build': 'CarouselOSXHighSierraFF55',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Firefox',
        'browser_version': '56.0'
      },
      filter: "desktop/carousel/OSXHighSierraFF55.js"
    },
    CarouselGooglepixelAndroid8: {
      desiredCapabilities: {
        'build': 'CarouselGooglepixelAndroid8',
        'device': 'Google Pixel',
        'realMobile': 'true',
        'os_version': '8.0'
      },
      filter: "mobile/carousel/GooglepixelAndroid8.js"
    },
    CarouselNexus6Android6: {
      desiredCapabilities: {
        'build': 'CarouselNexus6Android6',
        'device': 'Google Nexus 6',
        'realMobile': 'true',
        'os_version': '6.0'
      },
      filter: "mobile/carousel/Nexus6Android6.js"
    },
    SoloW10GC61: {
      desiredCapabilities: {
        'build': 'SoloW10GC61',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Chrome',
        'browser_version': '61.0',
      },
      filter: "desktop/solo/solo.js"
    },
    SoloW10FF55: {
      desiredCapabilities: {
        'build': 'SoloWin10FF55',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Firefox',
        'browser_version': '55.0'
      },
      filter: "desktop/solo/solo.js"
    },
    SoloW10IE11: {
      desiredCapabilities: {
        'build': 'SoloW10IE11',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'IE',
        'browser_version': '11.0',
      },
      filter: "desktop/solo/solo.js"
    },
    SoloW10E15: {
      desiredCapabilities: {
        'build': 'SoloW10E15',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Edge',
        'browser_version': '15.0'
      },
      filter: "desktop/solo/solo.js"
    },
    SoloWin8GC61: {
      desiredCapabilities: {
        'build': 'SoloW8GC61',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Chrome',
        'browser_version': '61.0',
      },
      filter: "desktop/solo/solo.js"
    },
    SoloW8IE11: {
      desiredCapabilities: {
        'build': 'SoloW8IE11',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'IE',
        'browser_version': '11.0'
      },
      filter: "desktop/solo/solo.js"
    },
    SoloW8FF55: {
      desiredCapabilities: {
        'build': 'SoloW8FF55',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Firefox',
        'browser_version': '55.0'
      },
      filter: "desktop/solo/solo.js"
    },
    SoloOSXSierraS10: {
      desiredCapabilities: {
        'build': 'SoloOSXSierraS10',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Safari',
        'browser_version': '10.1'
      },
      filter: "desktop/solo/solo.js"
    },
    SoloOSXSierraGC61: {
      desiredCapabilities: {
        'build': 'SoloOSXSierraGC61',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0',
      },
      filter: "desktop/solo/solo.js"
    },
    SoloOSXSierraFF55: {
      desiredCapabilities: {
        'build': 'SoloOSXSierraFF55',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Firefox',
        'browser_version': '55.0'
      },
      filter: "desktop/solo/solo.js"
    },
    SoloOSXHighSierraGC61: {
      desiredCapabilities: {
        'build': 'SoloOSXHighSierraGC61',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0'
      },
      filter: "desktop/solo/solo.js"
    },
    SoloOSXHighSierraFF55: {
      desiredCapabilities: {
        'build': 'SoloOSXHighSierraFF55',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Firefox',
        'browser_version': '55.0'
      },
      filter: "desktop/solo/solo.js"
    },
    SoloGooglepixelAndroid8: {
      desiredCapabilities: {
        'build': 'SoloGooglepixelAndroid8',
        // 'device': 'Google Pixel',
        // 'realMobile': 'true',
        // 'os_version': '8.0'
      },
      filter: "desktop/solo/solo.js"
    },
    SoloNexus6Android6: {
      desiredCapabilities: {
        'build': 'SoloNexus6Android6',
        'browserName': 'android',
        'platform': 'ANDROID',
        'device': 'Google Nexus 5'
        // 'device': 'Google Nexus 6',
        // 'realMobile': 'true',
        // 'os_version': '6.0'
      },
      filter: "desktop/solo/solo.js"
    },
    EmbedW10GC61: {
      desiredCapabilities: {
        'build': 'EmbedW10GC61',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Chrome',
        'browser_version': '61.0',
      },
      filter: "desktop/embed/embed.js"
    },
    EmbedW10FF55: {
      desiredCapabilities: {
        'build': 'EmbedWin10FF55',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Firefox',
        'browser_version': '55.0'
      },
      filter: "desktop/embed/embed.js"
    },
    EmbedW10IE11: {
      desiredCapabilities: {
        'build': 'EmbedW10IE11',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'IE',
        'browser_version': '11.0',
      },
      filter: "desktop/embed/embed.js"
    },
    EmbedW10E15: {
      desiredCapabilities: {
        'build': 'EmbedW10E15',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Edge',
        'browser_version': '15.0'
      },
      filter: "desktop/embed/embed.js"
    },
    EmbedWin8GC61: {
      desiredCapabilities: {
        'build': 'EmbedW8GC61',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Chrome',
        'browser_version': '61.0',
      },
      filter: "desktop/embed/embed.js"
    },
    EmbedW8IE11: {
      desiredCapabilities: {
        'build': 'EmbedW8IE11',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'IE',
        'browser_version': '11.0'
      },
      filter: "desktop/embed/embed.js"
    },
    EmbedW8FF55: {
      desiredCapabilities: {
        'build': 'EmbedW8FF55',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Firefox',
        'browser_version': '55.0'
      },
      filter: "desktop/embed/embed.js"
    },
    EmbedOSXSierraS10: {
      desiredCapabilities: {
        'build': 'EmbedOSXSierraS10',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Safari',
        'browser_version': '10.1'
      },
      filter: "desktop/embed/embed.js"
    },
    EmbedOSXSierraGC61: {
      desiredCapabilities: {
        'build': 'EmbedOSXSierraGC61',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0',
      },
      filter: "desktop/embed/embed.js"
    },
    EmbedOSXSierraFF55: {
      desiredCapabilities: {
        'build': 'EmbedOSXSierraFF55',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Firefox',
        'browser_version': '55.0'
      },
      filter: "desktop/embed/embed.js"
    },
    EmbedOSXHighSierraGC61: {
      desiredCapabilities: {
        'build': 'EmbedOSXHighSierraGC61',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0'
      },
      filter: "desktop/embed/embed.js"
    },
    EmbedOSXHighSierraFF55: {
      desiredCapabilities: {
        'build': 'EmbedOSXHighSierraFF55',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Firefox',
        'browser_version': '55.0'
      },
      filter: "desktop/embed/embed.js"
    },
    EmbedGooglepixelAndroid8: {
      desiredCapabilities: {
        'build': 'EmbedGooglepixelAndroid8',
        'device': 'Google Pixel',
        'realMobile': 'true',
        'os_version': '8.0'
      },
      filter: "desktop/embed/embed.js"
    },
    EmbedNexus6Android6: {
      desiredCapabilities: {
        'build': 'SoloNexus6Android6',
        'device': 'Google Nexus 6',
        'realMobile': 'true',
        'os_version': '6.0'
      },
      filter: "desktop/solo/solo.js"
    },
    SoloCtaW10GC61: {
      desiredCapabilities: {
        'build': 'SoloCtaW10GC61',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Chrome',
        'browser_version': '61.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/solo-cta/test.js"
    },
    SoloCtaW10FF55: {
      desiredCapabilities: {
        'build': 'SoloCtaWin10FF55',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Firefox',
        'browser_version': '55.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/solo-cta/test.ff.js"
    },
    SoloCtaW10IE11: {
      desiredCapabilities: {
        'build': 'SoloCtaW10IE11',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'IE',
        'browser_version': '11.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/solo-cta/test.ie.js"
    },
    SoloCtaW10E15: {
      desiredCapabilities: {
        'build': 'SoloCtaW10E15',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Edge',
        'browser_version': '15.0'
      },
      filter: "desktop/solo-cta/test.eg.js"
    },
    SoloCtaWin8GC61: {
      desiredCapabilities: {
        'build': 'SoloCtaW8GC61',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Chrome',
        'browser_version': '61.0',
      },
      filter: "desktop/solo-cta/solo-cta.js"
    },
    SoloCtaW8IE11: {
      desiredCapabilities: {
        'build': 'SoloCtaW8IE11',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'IE',
        'browser_version': '11.0'
      },
      filter: "desktop/solo-cta/solo-cta.js"
    },
    SoloCtaW8FF55: {
      desiredCapabilities: {
        'build': 'SoloCtaW8FF55',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Firefox',
        'browser_version': '55.0'
      },
      filter: "desktop/solo-cta/solo-cta.js"
    },
    SoloCtaOSXSierraS10: {
      desiredCapabilities: {
        'build': 'SoloCtaOSXSierraS10',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Safari',
        'browser_version': '10.1'
      },
      filter: "desktop/solo-cta/solo-cta.js"
    },
    SoloCtaOSXSierraGC61: {
      desiredCapabilities: {
        'build': 'SoloCtaOSXSierraGC61',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/solo-cta/test.js"
    },
    SoloCtaOSXSierraFF55: {
      desiredCapabilities: {
        'build': 'SoloCtaOSXSierraFF55',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Firefox',
        'browser_version': '55.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/solo-cta/test.ff.js"
    },
    SoloCtaOSXHighSierraGC61: {
      desiredCapabilities: {
        'build': 'SoloCtaOSXHighSierraGC61',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/solo-cta/test.js"
    },
    SoloCtaOSXHighSierraFF57: {
      desiredCapabilities: {
        'build': 'SoloCtaOSXHighSierraFF57',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Firefox',
        'browser_version': '57.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/solo-cta/test.ff.js"
    },
    SoloCtaGooglepixelAndroid8: {
      desiredCapabilities: {
        'build': 'SoloCtaGooglepixelAndroid8',
        'device': 'Google Pixel',
        'realMobile': 'true',
        'os_version': '8.0'
      },
      filter: "desktop/solo-cta/solo-cta.js"
    },
    SoloCtaNexus6Android6: {
      desiredCapabilities: {
        'build': 'SoloCtaNexus6Android6',
        'device': 'Google Nexus 6',
        'realMobile': 'true',
        'os_version': '6.0'
      },
      filter: "desktop/solo-cta/solo-cta.js"
    },
    CarouselSpotlightW10GC61: {
      desiredCapabilities: {
        'build': 'CarouselSpotlightW10GC61',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Chrome',
        'browser_version': '61.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/carousel-spotlight/test.js"
    },
    CarouselSpotlightW10FF55: {
      desiredCapabilities: {
        'build': 'CarouselSpotlightWin10FF55',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Firefox',
        'browser_version': '55.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/carousel-spotlight/test.ff.js"
    },
    CarouselSpotlightW10IE11: {
      desiredCapabilities: {
        'build': 'CarouselSpotlightW10IE11',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'IE',
        'browser_version': '11.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/carousel-spotlight/test.ie.js"
    },
    CarouselSpotlightW10E15: {
      desiredCapabilities: {
        'build': 'CarouselSpotlightW10E15',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Edge',
        'browser_version': '15.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/carousel-spotlight/test.ie.js"
    },
    CarouselSpotlightWin8GC61: {
      desiredCapabilities: {
        'build': 'CarouselSpotlightW8GC61',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Chrome',
        'browser_version': '61.0',
        'resolution': '1920x1080'      },
      filter: "desktop/carousel-spotlight/test.js"
    },
    CarouselSpotlightW8IE11: {
      desiredCapabilities: {
        'build': 'CarouselSpotlightW8IE11',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'IE',
        'browser_version': '11.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/carousel-spotlight/test.ie.js"
    },
    CarouselSpotlightW8FF55: {
      desiredCapabilities: {
        'build': 'CarouselSpotlightW8FF55',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Firefox',
        'browser_version': '55.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/carousel-spotlight/test.ff.js"
    },
    CarouselSpotlightOSXSierraS10: {
      desiredCapabilities: {
        'build': 'CarouselSpotlightOSXSierraS10',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Safari',
        'browser_version': '10.1',
        'browserstack.selenium_version': '2.53.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/carousel-spotlight/test.sf.js"
    },
    CarouselSpotlightOSXSierraGC61: {
      desiredCapabilities: {
        'build': 'CarouselSpotlightOSXSierraGC61',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/carousel-spotlight/test.js"
    },
    CarouselSpotlightOSXSierraFF55: {
      desiredCapabilities: {
        'build': 'CarouselSpotlightOSXSierraFF55',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Firefox',
        'browser_version': '55.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/carousel-spotlight/test.ff.js"
    },
    CarouselSpotlightOSXHighSierraGC61: {
      desiredCapabilities: {
        'build': 'CarouselSpotlightOSXHighSierraGC61',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/carousel-spotlight/test.js"
    },
    CarouselSpotlightOSXHighSierraFF55: {
      desiredCapabilities: {
        'build': 'CarouselSpotlightOSXHighSierraFF55',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Firefox',
        'browser_version': '55.0',
        'resolution': '1920x1080' 
      },
      filter: "desktop/carousel-spotlight/test.ff.js"
    },
    CarouselSpotlightOSXHighSierraS11: {
      desiredCapabilities: {
        'build': 'CarouselSpotlightOSXHighSierraS11',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Safari',
        'browser_version': '11',
        'browserstack.safari.driver': '2.48',
        'browserstack.safari.allowAllCookies': true,
        'resolution': '1920x1080'
      },
      filter: "desktop/carousel-spotlight/test.sf.js"
    },
    CarouselSpotlightGooglepixelAndroid8: {
      desiredCapabilities: {
        'build': 'CarouselSpotlightGooglepixelAndroid8',
        'device': 'Google Pixel',
        'realMobile': 'true',
        'os_version': '8.0'
      },
      filter: "desktop/carousel-spotlight/carousel-spotlight.js"
    },
    CarouselSpotlightNexus6Android6: {
      desiredCapabilities: {
        'build': 'CarouselSpotlightNexus6Android6',
        'device': 'Google Nexus 6',
        'realMobile': 'true',
        'os_version': '6.0'
      },
      filter: "desktop/carousel-spotlight/carousel-spotlight.js"
    },
    InlineW10GC61: {
      desiredCapabilities: {
        'build': 'InlineW10GC61',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Chrome',
        'browser_version': '61.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/inline/test.js"
    },
    InlineW10FF55: {
      desiredCapabilities: {
        'build': 'InlineWin10FF55',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Firefox',
        'browser_version': '55.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/inline/test.ff.js"
    },
    InlineW10IE11: {
      desiredCapabilities: {
        'build': 'InlineW10IE11',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'IE',
        'browser_version': '11.0',
        'resolution': '1920x1080'      },
      filter: "desktop/inline/test.ie.js"
    },
    InlineW10E15: {
      desiredCapabilities: {
        'build': 'InlineW10E15',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Edge',
        'browser_version': '15.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/inline/test.eg.js"
    },
    InlineWin8GC61: {
      desiredCapabilities: {
        'build': 'InlineW8GC61',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Chrome',
        'browser_version': '61.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/inline/test.js"
    },
    InlineW8IE11: {
      desiredCapabilities: {
        'build': 'InlineW8IE11',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'IE',
        'browser_version': '11.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/inline/test.ie.js"
    },
    InlineW8FF55: {
      desiredCapabilities: {
        'build': 'InlineW8FF55',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Firefox',
        'browser_version': '55.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/inline/test.ff.js"
    },
    InlineOSXSierraS10: {
      desiredCapabilities: {
        'build': 'InlineOSXSierraS10',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browserName': 'Safari',
        'browser_version': '10.1',
        'resolution': '1920x1080'
      },
      filter: "desktop/inline/test.sf.js"
    },
    InlineOSXSierraGC61: {
      desiredCapabilities: {
        'build': 'InlineOSXSierraGC61',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/inline/test.js"
    },
    InlineOSXSierraFF55: {
      desiredCapabilities: {
        'build': 'InlineOSXSierraFF55',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Firefox',
        'browser_version': '55.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/inline/test.ff.js"
    },
    InlineOSXHighSierraSafari: {
      desiredCapabilities: {
        'build': 'InlineOSXHighSierraSafari',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Sarafi',
        'browser_version': '11',
        'resolution': '1920x1080'
      },
      filter: "desktop/inline/test.sf.js"
    },
    InlineOSXHighSierraGC61: {
      desiredCapabilities: {
        'build': 'InlineOSXHighSierraGC61',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/inline/test.js"
    },
    InlineOSXHighSierraFF55: {
      desiredCapabilities: {
        'build': 'InlineOSXHighSierraFF55',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Firefox',
        'browser_version': '55.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/inline/test.ff.js"
    },
    InlineGooglepixelAndroid8: {
      desiredCapabilities: {
        'build': 'InlineGooglepixelAndroid8',
        //'device': 'Google Pixel',
        //'realMobile': 'true',
        //'os_version': '8.0'
        'browserName': 'android',
        'platform': 'ANDROID',
        'device': 'Google Nexus 5'
        },
      filter: "mobile/inline/test.js"
    },
    InlineNexus6Android6: {
      desiredCapabilities: {
        'build': 'InlineNexus6Android6',
        'device': 'Google Nexus 6',
        'realMobile': 'true',
        'os_version': '6.0'
      },
      filter: "desktop/inline/inline.js"
    },
    // Inline spotlight
    InlineSpotlightW10GC61: {
      desiredCapabilities: {
        'build': 'InlineSpotlightW10GC61',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Chrome',
        'browser_version': '61.0',
      },
      filter: "desktop/inline-spotlight/inline-spotlight.js"
    },
    InlineSpotlightW10FF55: {
      desiredCapabilities: {
        'build': 'InlineSpotlightWin10FF55',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Firefox',
        'browser_version': '55.0'
      },
      filter: "desktop/inline-spotlight/inline-spotlight.js"
    },
    InlineSpotlightW10IE11: {
      desiredCapabilities: {
        'build': 'InlineSpotlightW10IE11',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'IE',
        'browser_version': '11.0',
      },
      filter: "desktop/inline-spotlight/inline-spotlight.js"
    },
    InlineSpotlightW10E15: {
      desiredCapabilities: {
        'build': 'InlineSpotlightW10E15',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Edge',
        'browser_version': '15.0'
      },
      filter: "desktop/inline-spotlight/inline-spotlight.js"
    },
    InlineSpotlightWin8GC61: {
      desiredCapabilities: {
        'build': 'InlineSpotlightW8GC61',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Chrome',
        'browser_version': '61.0',
      },
      filter: "desktop/inline-spotlight/inline-spotlight.js"
    },
    InlineSpotlightW8IE11: {
      desiredCapabilities: {
        'build': 'InlineSpotlightW8IE11',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'IE',
        'browser_version': '11.0'
      },
      filter: "desktop/inline-spotlight/inline-spotlight.js"
    },
    InlineSpotlightW8FF55: {
      desiredCapabilities: {
        'build': 'InlineSpotlightW8FF55',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Firefox',
        'browser_version': '55.0'
      },
      filter: "desktop/inline-spotlight/inline-spotlight.js"
    },
    InlineSpotlightOSXSierraS10: {
      desiredCapabilities: {
        'build': 'InlineSpotlightOSXSierraS10',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Safari',
        'browser_version': '10.1'
      },
      filter: "desktop/inline-spotlight/inline-spotlight.js"
    },
    InlineSpotlightOSXSierraGC61: {
      desiredCapabilities: {
        'build': 'InlineSpotlightOSXSierraGC61',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0',
      },
      filter: "desktop/inline-spotlight/inline-spotlight.js"
    },
    InlineSpotlightOSXSierraFF55: {
      desiredCapabilities: {
        'build': 'InlineSpotlightOSXSierraFF55',
        'os': 'OS X',
        'os_version': 'Sierra',
        'browser': 'Firefox',
        'browser_version': '55.0'
      },
      filter: "desktop/inline-spotlight/inline-spotlight.js"
    },
    InlineSpotlightOSXHighSierraGC61: {
      desiredCapabilities: {
        'build': 'InlineSpotlightOSXHighSierraGC61',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0'
      },
      filter: "desktop/inline/inline.js"
    },
    InlineSpotlightOSXHighSierraFF55: {
      desiredCapabilities: {
        'build': 'InlineSpotlightOSXHighSierraFF55',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Firefox',
        'browser_version': '55.0'
      },
      filter: "desktop/inline-spotlight/inline-spotlight.js"
    },
    InlineSpotlightGooglepixelAndroid8: {
      desiredCapabilities: {
        'build': 'InlineSpotlightGooglepixelAndroid8',
        'device': 'Google Pixel',
        'realMobile': 'true',
        'os_version': '8.0'
      },
      filter: "desktop/inline-spotlight/inline-spotlight.js"
    },
    InlineSpotlightNexus6Android6: {
      desiredCapabilities: {
        'build': 'InlineSpotlightNexus6Android6',
        'device': 'Google Nexus 6',
        'realMobile': 'true',
        'os_version': '6.0'
      },
      filter: "desktop/inline-spotlight/inline-spotlight.js"
    },
  }
};

// Code to support common capabilites
for(var i in nightwatch_config.test_settings){
  var config = nightwatch_config.test_settings[i];
  config['selenium_host'] = nightwatch_config.selenium.host;
  config['selenium_port'] = nightwatch_config.selenium.port;
  config['desiredCapabilities'] = config['desiredCapabilities'] || {};
  for(var j in nightwatch_config.common_capabilities){
    config['desiredCapabilities'][j] = config['desiredCapabilities'][j] || nightwatch_config.common_capabilities[j];
  }
}

module.exports = nightwatch_config;