var nightwatch_config = {
  src_folders : [ "test/specs/desktop/carousel/OSXHighSierraGC61.js" ],

  selenium : {
    "start_process" : false,
    "host" : "hub-cloud.browserstack.com",
    "port" : 80
  },

  test_settings: {
    default: {
      desiredCapabilities: {
        'build': 'Hugo Template OSXHighSierraGC61',
        'browserstack.user': process.env.BROWSERSTACK_USERNAME || 'pascualtorres1',
        'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY || '2ATTF6UbzybcwfcideHN',
        'browserstack.debug': true,
        'os': 'OS X',
        'os_version': 'High Sierra',
        'browser': 'Chrome',
        'browser_version': '61.0',
        'resolution': '1920x1080'
      }
    }
  },

  "test_workers": {
    "enabled": true,
    "workers": 10
  }   
};

// Code to copy seleniumhost/port into test settings
for(var i in nightwatch_config.test_settings){
  var config = nightwatch_config.test_settings[i];
  config['selenium_host'] = nightwatch_config.selenium.host;
  config['selenium_port'] = nightwatch_config.selenium.port;
}

module.exports = nightwatch_config;
