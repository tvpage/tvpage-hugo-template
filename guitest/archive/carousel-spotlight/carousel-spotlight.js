/*==============================================================================*/
/* Nightwatch Recorder generated Mon Oct 23 2017 18:49:04 GMT-0700 (PDT) */
/*==============================================================================*/
var DATA = {
  URL: "https://widgets.goodlookingbean.com/test/carousel-spotlight/",
  SLA: 10000
};

var aCounts = {
  'ci': 0,
  'vv': 0
};

var guiTest = {
  init: function (client) {
    client
      .url(DATA.URL)
      .pause(1000);

    return client
  },
  playVideo: function (client, loadTime, nextVideo) {
    if(! nextVideo){
      client.frame(0, function(res){
      // console.log(res);
      }).click('[data-id="65981962"]').pause(loadTime);
    }
    client.frameParent().pause(2000).frame(1, function(res){
      // console.log(res);
    }).click('#tvplayer-playbutton').pause(loadTime);
  },
  getParameterByName: function(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);

    if (!results) return null;
    if (!results[2]) return '';

    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },
  inArray : function(needle, haystack, isIndex) {
    var found = false;

    haystack.forEach(function(value, i) {
      if (needle == value) {
        found = (isIndex === true ? i : true);
      }
    });

    return found;
  },
  analytics: function(client, frame, events, aData) {
    var tests = {
      'ci': function(client, src, current) {
        console.log(">>> Checking CI <<<");

        client.waitForElementVisible('p#analtyticsTestCI', 6000);
        client.expect.element('p#analtyticsTestCI').to.be.present;
        this.assert.equal(aCounts['ci'], 1);

        var li = guiTest.getParameterByName('li', src);
        this.assert.equal(li, aData.LOGIN_ID);

        var url = guiTest.getParameterByName('url', src);
        this.assert.equal(url, DATA.URL);
        // TODO: enable cid when the issue is fixed
        // var cid = guiTest.getParameterByName('cid', src);
        // this.assert.ok(cid);
      },
      'vv': function(client, src, current) {
        console.log(">>> Checking VV <<<");

        var li = guiTest.getParameterByName('li', src);
        this.assert.equal(li, aData.LOGIN_ID);

        var url = guiTest.getParameterByName('url', src);
        this.assert.equal(url, DATA.URL);

        var pg = guiTest.getParameterByName('pg', src);
        this.assert.equal(pg, aData.CHANNEL_ID);

        var vd = guiTest.getParameterByName('vd', src);
        this.assert.equal(vd, aData.VIDS[current]);

        client.waitForElementPresent('p.analtyticsTestVV', 6000);
        client.expect.element('p.analtyticsTestVV').to.be.present;

        var vvs = guiTest.getParameterByName('vvs', src);
        this.assert.ok(vvs);

        var cid = guiTest.getParameterByName('cid', src);
        this.assert.ok(cid);

        DATA.vvs = vvs;
      }

    };

    client.frame(frame).elements("tag name", "script", function(result) {
      console.log(">>> Widget Analytics Testing <<<");

      result.value.forEach(function(script) {
        client.elementIdAttribute(script.ELEMENT, 'src', function(res) {
          var src = res.value,
              THAT = this;
          events.forEach(function (key, index) {
            if (src.indexOf('rt=' + key) >= 0) {
              var vd = guiTest.getParameterByName('vd', src),
                  current = guiTest.inArray(vd, aData.VIDS, true);

              aCounts[key]++;

              var test = tests[key].bind(THAT, client, src, current);
              test();
            }
          });
        });
      });
    });
  },
  getAnalyticCounts: function () {
    return aCounts;
  }

};

module.exports = {
  before : function (client) {
    client.windowMaximize();
  },
  'carousel-spotlight-desktop-youtube': function(client) {

    guiTest.init(client);

    guiTest.playVideo(client, DATA.SLA);

    client.pause(10000);

    guiTest.playVideo(client, DATA.SLA, true);

    guiTest.analytics(client, 1, ['ci', 'vv'], {
      LOGIN_ID: 1758799,
      CHANNEL_ID: 66133904,
      VIDS: [65981962,83106081],
      COUNTS: {"ci": 2, "vv": 2}
    });

    // TODO: PI and PK events

    client.end();
  }
};


