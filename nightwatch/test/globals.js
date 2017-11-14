'use strict'

module.exports = {
  beforeEach: function (browser, done) {
    require('nightwatch-video-recorder').start(browser, done)
    browser.maxmizeWindow(done);
  },
  afterEach: function (browser, done) {
    require('nightwatch-video-recorder').stop(browser, done)
  }
}
