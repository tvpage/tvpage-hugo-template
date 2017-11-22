/*==============================================================================*/
/* Nightwatch Recorder generated Mon Oct 23 2017 18:49:04 GMT-0700 (PDT) */
/*==============================================================================*/
module.exports = {
 'inline': function(browser) {
    browser
      .url('https://deploy-preview-19--www-goodlookingbean-com.netlify.com/tvpembed/83094487/')
      .waitForElementVisible('#tvplayer-playbutton', 1000)
    browser.click('#tvplayer-playbutton');
    browser.waitForElementPresent('#ControlBarFloater', 1000);
    browser.expect.element('#ControlBarFloater > div.tvp-control-volume-container').to.be.present;
    browser.expect.element('#ControlBarFloater > div.tvp-control-volume-container > div.tvp-control-volume-selector-container').to.be.present;
    browser.expect.element('#ControlBarFloater > div.tvp-control-volume-container').to.be.present;
    browser.expect.element('#CtrlClosedCaptionImage').to.be.present;
    browser.click('#CtrlClosedCaptionImage');
//    browser.waitForElementVisible('#SettingsQuality', 1000)
    browser.end();
 }
};