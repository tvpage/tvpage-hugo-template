
nightwatch_config = {
  src_folders : [ "test/specs/desktop/inline-spotlight"],

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
    InlineSpotlightW10GC: {
      desiredCapabilities: {
        'build': 'InlineSpotlightW10GC',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Chrome',
        'browser_version': '61.0'
      },
      filter: "desktop/inline-spotlight/test.js"      
    },
    InlineSpotlightW10FF: {
      desiredCapabilities: {
        'build': 'InlineSpotlightW10FF',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Firefox',
        'browser_version': '57.0'
      },
      filter: "desktop/inline-spotlight/test.ff.js"
    },
    InlineSpotlightW10IE: {
      desiredCapabilities: {
        'build': 'InlineSpotlightW10IE',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'IE',
        'browser_version': '11'
      },
      filter: "desktop/inline-spotlight/test.ie.js"
    },
    InlineSpotlightW10Edge: {
      desiredCapabilities: {
        'build': 'InlineSpotlightW10Edge',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Edge',
        'browser_version': '15.0'
      },
      filter: "desktop/inline-spotlight/test.eg.js"
    },
    InlineSpotlightW81GC: {
      desiredCapabilities: {
        'build': 'InlineSpotlightW81GC',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Chrome',
        'browser_version': '61.0'
      },
      filter: "desktop/inline-spotlight/test.js"      
    },
    InlineSpotlightW81FF: {
      desiredCapabilities: {
        'build': 'InlineSpotlightW81FF',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Firefox',
        'browser_version': '57.0'
      },
      filter: "desktop/inline-spotlight/test.ff.js"
    },
    InlineSpotlightW81IE: {
      desiredCapabilities: {
        'build': 'InlineSpotlightW81IE',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'IE',
        'browser_version': '11'
      },
      filter: "desktop/inline-spotlight/test.ie.js"
    },
    InlineSpotlightOSXHSSafari: {
      desiredCapabilities: {
        'build': 'InlineSpotlightOSXHSSafari',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Safari',
        'browser_version': '11.0'    },
      filter: "desktop/inline-spotlight/test.sf.js"
    },
    InlineSpotlightOSXHSGC: {
      desiredCapabilities: {
        'build': 'InlineSpotlightOSXHSGC',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0'
      },
      filter: "desktop/inline-spotlight/test.js"
    },
    InlineSpotlightOSXHSFF: {
      desiredCapabilities: {
        'build': 'InlineSpotlightOSXHSFF',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Firefox',
        'browser_version': '56.0'
      },
      filter: "desktop/inline-spotlight/test.ff.js"
    },
    InlineSpotlightOSXSSafari: {
      desiredCapabilities: {
        'build': 'InlineSpotlightOSXSSafari',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Safari',
        'browser_version': '11.0'
      },
      filter: "desktop/inline-spotlight/test.sf.js"
    },
    InlineSpotlightOSXSGC: {
      desiredCapabilities: {
        'build': 'InlineSpotlightOSXSGC',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0'
      },
      filter: "desktop/inline-spotlight/test.js"
    },
    InlineSpotlightOSXSFF: {
      desiredCapabilities: {
        'build': 'InlineSpotlightOSXSFF',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Firefox',
        'browser_version': '56.0'
      },
      filter: "desktop/inline-spotlight/test.ff.js"
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
