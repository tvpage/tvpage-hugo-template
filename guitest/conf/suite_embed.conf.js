
nightwatch_config = {
  src_folders : [ "test/specs/embed" ],

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
    W10GC: {
      desiredCapabilities: {
        'build': 'EmbedW10GC',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Chrome',
        'browser_version': '61.0',
        'resolution': '1920x1080'
      },
      filter: "test.GC.js"      
    },
    W10FF: {
      desiredCapabilities: {
        'build': 'EmbedW10FF',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Firefox',
        'browser_version': '57.0',
        'resolution': '1920x1080'
      },
      filter: "test.FF.js"
    },
    W10IE: {
      desiredCapabilities: {
        'build': 'EmbedW10IE',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'IE',
        'browser_version': '11',
        'resolution': '1920x1080'
      },
      filter: "test.IE.js"
    },
    W10Edge: {
      desiredCapabilities: {
        'build': 'EmbedW10Edge',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Edge',
        'browser_version': '15.0',
        'resolution': '1920x1080'
      },
      filter: "test.EG.js"
    },
    W81GC: {
      desiredCapabilities: {
        'build': 'EmbedW81GC',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Chrome',
        'browser_version': '61.0',
        'resolution': '1920x1080'
      },
      filter: "test.GC.js"      
    },
    W81FF: {
      desiredCapabilities: {
        'build': 'EmbedW81FF',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Firefox',
        'browser_version': '57.0',
        'resolution': '1920x1080'
      },
      filter: "test.FF.js"
    },
    W81IE: {
      desiredCapabilities: {
        'build': 'EmbedW81IE',
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'IE',
        'browser_version': '11',
        'resolution': '1920x1080'
      },
      filter: "test.IE.js"
    },
    OSXHSSafari: {
      desiredCapabilities: {
        'build': 'EmbedOSXHSSafari',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Safari',
        'browser_version': '11.0',
        'resolution': '1920x1080'
      },
      filter: "test.SF.js"
    },
    OSXHSGC: {
      desiredCapabilities: {
        'build': 'EmbedOSXHSGC',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0',
        'resolution': '1920x1080'
      },
      filter: "test.GC.js"
    },
    OSXHSFF: {
      desiredCapabilities: {
        'build': 'EmbedOSXHSFF',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Firefox',
        'browser_version': '56.0',
        'resolution': '1920x1080'
      },
      filter: "test.FF.js"
    },
    OSXSSafari: {
      desiredCapabilities: {
        'build': 'EmbedOSXSSafari',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Safari',
        'browser_version': '11.0',
        'resolution': '1920x1080'
      },
      filter: "test.SF.js"
    },
    OSXSGC: {
      desiredCapabilities: {
        'build': 'EmbedOSXSGC',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0',
        'resolution': '1920x1080'
      },
      filter: "test.GC.js"
    },
    OSXSFF: {
      desiredCapabilities: {
        'build': 'EmbedOSXSFF',
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Firefox',
        'browser_version': '56.0',
        'resolution': '1920x1080'
      },
      filter: "test.FF.js"
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
