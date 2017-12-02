
nightwatch_config = {
  src_folders : [ "test/specs/inline/" ],

  selenium : {
    "start_process" : false,
    "host" : "hub-cloud.browserstack.com",
    "port" : 80
  },

  common_capabilities: {
    'browserstack.user': process.env.BROWSERSTACK_USERNAME || 'pascualtorres1',
    'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY || '2ATTF6UbzybcwfcideHN',
    'browserstack.debug': true,
    'resolution': '1920x1080'
  },

  test_settings: {
    default: {},
    InlineW10GC: {
      desiredCapabilities: {
        'build': 'InlineW10GC',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Chrome',
        'browser_version': '61.0'
      },
      filter: "desktop/inline/test.GC.js"      
    },
    InlineW10FF: {
      desiredCapabilities: {
        'build': 'InlineW10FF',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Firefox',
        'browser_version': '57.0'
      },
      filter: "desktop/inline/test.FF.js"
    },
    InlineW10IE: {
      desiredCapabilities: {
        'build': 'InlineW10IE',
        'os': 'Windows',
        'os_version': '10',
        'platform': 'Windows 10',
        'browser': 'IE',
        'browser_version': '11'
      },
      filter: "desktop/inline/test.IE.js"
    },
    InlineW10Edge: {
      desiredCapabilities: {
        'build': 'InlineW10Edge',
        'os': 'Windows',
        'os_version': '10',
        'platform': 'Windows 10',
        'browser': 'Edge',
        'browser_version': '15.0'
      },
      filter: "desktop/inline/test.EG.js"
    },
    InlineW81GC: {
      desiredCapabilities: {
        'build': 'InlineW81GC',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Chrome',
        'browser_version': '61.0'
      },
      filter: "desktop/inline/test.GC.js"      
    },
    InlineW81FF: {
      desiredCapabilities: {
        'build': 'InlineW81FF',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Firefox',
        'browser_version': '57.0'
      },
      filter: "desktop/inline/test.FF.js"
    },
    InlineW81IE: {
      desiredCapabilities: {
        'build': 'InlineW81IE',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'IE',
        'browser_version': '11'
      },
      filter: "desktop/inline/test.IE.js"
    },
    InlineOSXHSSafari: {
      desiredCapabilities: {
        'build': 'InlineOSXHSSafari',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Safari',
        'browser_version': '11.0'
    },
      filter: "desktop/inline/test.SF.js"
    },
    InlineOSXHSGC: {
      desiredCapabilities: {
        'build': 'InlineOSXHSGC',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0'
      },
      filter: "desktop/inline/test.GC.js"
    },
    InlineOSXHSFF: {
      desiredCapabilities: {
        'build': 'InlineOSXHSFF',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Firefox',
        'browser_version': '56.0'
      },
      filter: "desktop/inline/test.FF.js"
    },
    InlineOSXSSafari: {
      desiredCapabilities: {
        'build': 'InlineOSXSSafari',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Safari',
        'browser_version': '11.0'
      },
      filter: "desktop/inline/test.SF.js"
    },
    InlineOSXSGC: {
      desiredCapabilities: {
        'build': 'InlineOSXSGC',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0'
      },
      filter: "desktop/inline/test.GC.js"
    },
    InlineOSXSFF: {
      desiredCapabilities: {
        'build': 'InlineOSXSFF',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Firefox',
        'browser_version': '56.0'
      },
      filter: "desktop/inline/test.FF.js"
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

  console.log(config);
}

module.exports = nightwatch_config;
