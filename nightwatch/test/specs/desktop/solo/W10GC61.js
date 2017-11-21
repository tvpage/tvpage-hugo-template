/*==============================================================================*/
/* Nightwatch Recorder generated Mon Oct 23 2017 18:49:04 GMT-0700 (PDT) */
/*==============================================================================*/
var DATA = {
  URL: "https://widgets.goodlookingbean.com/test/solo/",
  SLA: 10000
};

var guiTest = {
  init: function (client, frameId) {
    client
      .url(DATA.URL)
      .pause(1000);

    if (frameId !== undefined)
      client.frame(frameId);

    return client
  },
  playVideo: function (client, loadTime) {
    client.click('#tvplayer-playbutton').pause(loadTime);
  },
  getParameterByName: function(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);

    if (!results) return null;
    if (!results[2]) return '';

    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },
  analytics: function(client, frame, events, aData) {
      var counts = {
        'ci': 0,
        'vv': 0,
        'pi': 0,
        'pk': 0
      };
  
      var tests = {
        'ci': function(client, src) {
          console.log(">>> Checking CI <<<");

          client.waitForElementVisible('p#analtyticsTestCI', 6000);
          client.expect.element('p#analtyticsTestCI').to.be.present;
          this.assert.equal(counts['ci'], 1);
          var li = guiTest.getParameterByName('li', src);
          this.assert.equal(li, aData.LOGIN_ID);
          var url = guiTest.getParameterByName('url', src);
          this.assert.equal(url, DATA.URL);
          // TODO: Need to check CID
          //var cid = getParameterByName('cid', src);
          //this.assert.ok(cid);
        },
        'vv': function(client, src) {
          console.log(">>> Checking VV <<<");

          client.waitForElementVisible('p#analtyticsTestVV', 6000);
          client.expect.element('p#analtyticsTestVV').to.be.present;
          var li = guiTest.getParameterByName('li', src);
          this.assert.equal(li, aData.LOGIN_ID);
          var url = guiTest.getParameterByName('url', src);
          this.assert.equal(url, DATA.URL);
          var pg = guiTest.getParameterByName('pg', src);
          this.assert.equal(pg, aData.CHANNEL_ID);
          var vd = guiTest.getParameterByName('vd', src);
          this.assert.equal(vd, aData.VIDEO_ID);
          var vvs = guiTest.getParameterByName('vvs', src);
          this.assert.ok(vvs);
          DATA.vvs = vvs;
        },
        'pi': function(client, src) {
          console.log(">>> Checking PI <<<");

          var url = guiTest.getParameterByName('url', src);
          this.assert.equal(url, DATA.URL);
          var li = guiTest.getParameterByName('li', src);
          this.assert.equal(li, aData.LOGIN_ID);
          var pg = guiTest.getParameterByName('pg', src);
          this.assert.equal(pg, aData.CHANNEL_ID);
          var vd = guiTest.getParameterByName('vd', src);
          this.assert.equal(vd, aData.VIDEO_ID);
          var vd = guiTest.getParameterByName('vd', src);
          this.assert.equal(vd, aData.VIDEO_ID);
          // TODO: Need to check CID
          //var cid = getParameterByName('cid', src);
          //this.assert.ok(cid);
        },
        'pk': function(client, src) {
          console.log(">>> Checking PK <<<");

          client.waitForElementVisible('p.analtyticsTestPK', 6000);
          client.expect.element('p.analtyticsTestPK').to.be.present;
          var url = guiTest.getParameterByName('url', src);
          this.assert.equal(url, DATA.URL);
          var li = guiTest.getParameterByName('li', src);
          this.assert.equal(li, aData.LOGIN_ID);
          var pg = guiTest.getParameterByName('pg', src);
          this.assert.equal(pg, aData.CHANNEL_ID);
          var vd = guiTest.getParameterByName('vd', src);
          this.assert.equal(vd, aData.VIDEO_ID);
          var ct = guiTest.getParameterByName('ct', src);
          this.assert.equal(ct, aData.product.ID);
          // TODO: Need to check CID
          //var cid = getParameterByName('cid', src);
          //this.assert.ok(cid);
          client.elements("class name", "analtyticsTestPK", function(result) {
            this.assert.ok(counts['pk'] <= result.value.length);
          });
        }
      };

      client.frame(frame).elements("tag name", "script", function(result) {
        result.value.forEach(function(script) {
          client.elementIdAttribute(script.ELEMENT, 'src', function(res) {
            var src = res.value,
                THAT = this;

            events.forEach(function (key, i) {
              if (src.indexOf('rt=' + key) >= 0) {
                counts[key]++;
                var test = tests[key].bind(THAT, client, src);
                test();
              }
            });
          });
        });
      });
    }

};

module.exports = {
  before : function (client) {
    client.windowMaximize();
  },
  'solo-desktop-youtube': function(client) {

    guiTest.init(client, 0);

    guiTest.playVideo(client, DATA.SLA);

    guiTest.analytics(client, 1,['ci','vv'], {LOGIN_ID:'1758799', CHANNEL_ID: '66133904', 'VIDEO_ID': '65981962' });

    client.pause(4000);

    // TODO: once solo auto next issue is fixed, then enable following

    // guiTest.playVideo(client, DATA.SLA);

    // guiTest.analytics(client, 1,['ci','vv'], {LOGIN_ID:'1758799', CHANNEL_ID: '66133904', 'VIDEO_ID': '83106081' });

    client.end();
  }
};


