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
    SidebarW10GC61: {
      desiredCapabilities: {
        'build': 'SidebarW10GC61',
        'os': 'Windows',
        'os_version': '10',
        'browser': 'Chrome',
        'browser_version': '61.0',
        'resolution': '1920x1080'
      },
      filter: "desktop/sidebar/test.js"      
    }
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
