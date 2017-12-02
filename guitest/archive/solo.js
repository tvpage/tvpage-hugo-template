/*==============================================================================*/
/* Nightwatch Recorder generated Mon Oct 23 2017 18:49:04 GMT-0700 (PDT) */
/*==============================================================================*/
var URL = 'https://www.goodlookingbean.com/test/solo/',
    SLA = 10000; //1sec

var guiTest = {
  init: function (client, frameId) {
    client
      .url(URL)
      .waitForElementVisible('iframe[gesture=media]', SLA)
      .pause(1000);

    if (frameId !== undefined)
      client.frame(frameId);

    return client
  },
  loadPerformance: function (client, loadTime) {
    client.waitForElementPresent("#tvplayer-playbutton", loadTime);
    client.waitForElementPresent('#ControlBarFloater', loadTime);

    // sanity check
    client.expect.element('#ControlBarFloater > div.tvp-control-volume-container').to.be.present;
    client.expect.element('#ControlBarFloater > div.tvp-control-volume-container > div.tvp-control-volume-selector-container').to.be.present;
    client.expect.element('#ControlBarFloater > div.tvp-control-volume-container').to.be.present;
    client.expect.element('#CtrlClosedCaptionImage').to.be.present;

    // tvplayer icon check
    client.expect.element('#tvplayer-playbutton-icon').to.be.present;
  },
  playVideo: function (client, loadTime) {
    client.click('#tvplayer-playbutton').waitForElementPresent("#tvp-spinner", loadTime).pause(loadTime);

    client.expect.element('#tvp-spinner').to.have.css('display').which.equals('none');
    client.expect.element('#tvplayer-playbutton-icon').to.not.be.present;

    client.click('#ControlBarFloater > div.tvp-control-playpause').pause(loadTime);
    client.moveToElement('#CtrlTime', 10, 10).pause(loadTime);

    // this.playTime(client);
  },
  // playTime: function (client, expect) {
  //   client.expect.element('#CtrlTime').to.have.css('display').which.not.equals('none');
  //   client.getText("#CtrlTime", function (result) {
  //     this.assert.equal(typeof result, "object");
  //     this.assert.equal(result.status, 0);

  //     if (expect === undefined)
  //       return this.assert.notEqual(result.value, "00:00 / 01:23");

  //     return this.assert.equal(result.value, expect + " / 01:23");
  //   });
  // },
  playFullScreen: function (client) {
    client.moveToElement('#ControlBarFloater > div.tvp-control-fullscreen', 0, 20)
      .mouseButtonClick('left')
      .pause(3000);
  },
  // skipPlay: function (client, skip, time, pauseTime) {
  //   if (pauseTime === undefined)
  //       pauseTime = SLA;

  //   client.moveToElement('#ControlBarFloater > div.tvp-parent-seekbar', 0, 20);
  //   client.expect.element('#ControlBarFloater > div.tvp-parent-seekbar > div.tvp-progress-bar').to.have.css('display').which.not.equals('none');
  //   client.moveToElement('#ControlBarFloater > div.tvp-parent-seekbar', skip, 20)
  //     .mouseButtonClick('left')
  //     .pause(pauseTime);

  //   this.playTime(client, time);

  //   client.expect.element('#ControlBarFloater > div.tvp-control-playpause').to.have.css('display').which.not.equals('none');
  //   client.expect.element('#ControlBarFloater > div.tvp-control-fullscreen').to.have.css('display').which.not.equals('none');
  // }
};

module.exports = {
  before : function (client) {
    client.resizeWindow(1440, 1200);
  },
  'solo-desktop-youtube': function(client) {
    cleint = guiTest.init(client, 0);

    guiTest.loadPerformance(client, SLA);
    guiTest.playVideo(client, SLA)
    // guiTest.skipPlay(client, 200, "00:22");
    // guiTest.skipPlay(client, 600, "01:07");
    // guiTest.skipPlay(client, 730, "01:21");

    client.pause(4000);

    guiTest.loadPerformance(client, SLA);
    guiTest.playVideo(client, SLA);
    guiTest.playFullScreen(client);

    client.end();
  }
};


