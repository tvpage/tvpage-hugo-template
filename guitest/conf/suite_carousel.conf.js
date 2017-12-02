
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
    default: {
      'resolution': '1920x1080'
    },
    CarouselW10GC: {
      desiredCapabilities: {
        'build': 'CarouselW10GC',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Chrome',
        'browser_version': '61.0'
      },
      filter: "desktop/carousel/test.js"      
    },
    CarouselW10FF: {
      desiredCapabilities: {
        'build': 'CarouselW10FF',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Firefox',
        'browser_version': '57.0'
      },
      filter: "desktop/carousel/test.ff.js"
    },
    CarouselW10IE: {
      desiredCapabilities: {
        'build': 'CarouselW10IE',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'IE',
        'browser_version': '11'
      },
      filter: "desktop/carousel/test.ie.js"
    },
    CarouselW10Edge: {
      desiredCapabilities: {
        'build': 'CarouselW10Edge',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Edge',
        'browser_version': '15.0'
      },
      filter: "desktop/carousel/test.eg.js"
    },
    CarouselW81GC: {
      desiredCapabilities: {
        'build': 'CarouselW81GC',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Chrome',
        'browser_version': '61.0'
      },
      filter: "desktop/carousel/test.js"      
    },
    CarouselW81FF: {
      desiredCapabilities: {
        'build': 'CarouselW81FF',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Firefox',
        'browser_version': '57.0'
      },
      filter: "desktop/carousel/test.ff.js"
    },
    CarouselW81IE: {
      desiredCapabilities: {
        'build': 'CarouselW81IE',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'IE',
        'browser_version': '11'
      },
      filter: "desktop/carousel/test.ie.js"
    },
    CarouselOSXHSSafari: {
      desiredCapabilities: {
        'build': 'CarouselOSXHSSafari',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Safari',
        'browser_version': '11.0'
      },
      filter: "desktop/carousel/test.sf.js"
    },
    CarouselOSXHSGC: {
      desiredCapabilities: {
        'build': 'CarouselOSXHSGC',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0'
      },
      filter: "desktop/carousel/test.js"
    },
    CarouselOSXHSFF: {
      desiredCapabilities: {
        'build': 'CarouselOSXHSFF',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Firefox',
        'browser_version': '56.0'
      },
      filter: "desktop/carousel/test.ff.js"
    },
    CarouselOSXSSafari: {
      desiredCapabilities: {
        'build': 'CarouselOSXSSafari',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Safari',
        'browser_version': '11.0'
      },
      filter: "desktop/carousel/test.sf.js"
    },
    CarouselOSXSGC: {
      desiredCapabilities: {
        'build': 'CarouselOSXSGC',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0'
      },
      filter: "desktop/carousel/test.js"
    },
    CarouselOSXSFF: {
      desiredCapabilities: {
        'build': 'CarouselOSXSFF',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Firefox',
        'browser_version': '56.0'
      },
      filter: "desktop/carousel/test.ff.js"
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
