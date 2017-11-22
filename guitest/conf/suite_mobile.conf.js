nightwatch_config = {
  src_folders : [ "test/specs/mobile" ],

  selenium : {
    "start_process" : false,
    "host" : "hub-cloud.browserstack.com",
    "port" : 80
  },

  test_settings: {
    default: {
      desiredCapabilities: {
        'build': 'Hugo Template Mobile Automation',
        'browserstack.user': process.env.BROWSERSTACK_USERNAME || 'pascualtorres1',
        'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY || '2ATTF6UbzybcwfcideHN',
        'browserstack.debug': true,
        'browserName': 'android',
        'platform': 'ANDROID',
        'device': 'Samsung Galaxy S8 Plus',
        'realMobile': 'true',
        'os_version': '7.0'
        //'device': 'iPhone 7 Plus',
        //'os_version': '10.0'
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
