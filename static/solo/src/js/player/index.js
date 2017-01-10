define(function(require) {

    var $ = require('jquery-private');

    var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      autoplay = true,
      autoend = true,
      options = null,
      playerReady = null,
      player = null;

    function resize() {
      if (player) {
        player.resize($('#tvplayerholder').width(), $('#tvplayerholder').height());
      }
    }

    function putButtonOverlay() {
      $('<div/>').attr('id', 'tvpp-play').insertAfter('#tvplayerholder').on('click', function() {
        $(this).off().remove();
        return player ? player.play() : false;
      });
    }

    function play(asset) {
      // if(__TVPage__.config[0] && __TVPage__.config[0].settings.hasOwnProperty("autoplay") ){
      //   autoplay = __TVPage__.config[0].settings.autoplay;
      // }
      console.log(asset);
      if (asset) {
        var checks = 0;
        (function readyPoller( ){
          var deferred = setTimeout(function(){
            if (!playerReady) {
              if ( ++checks < 25 ) {
                readyPoller();
              }
            } else {
              if (mobile || !JSON.parse(autoplay)) {
                player.cueVideo(asset);
                if (asset.type == 'mp4') putButtonOverlay();
              } else {
                player.loadVideo(asset);
              }
            }
          }, 200);
        })();
      }
    }

    function extractAsset(video) {
      if (video && video.asset) {
        var asset = video.asset;
        asset.analyticsObj = { vd: video.id, li: video.loginId, pg: video.parentId ? video.parentId : 0 };
        if (!asset.sources) asset.sources = [{ file: asset.videoId }];
        asset.type = asset.type || 'youtube';
        return asset;
      }
    }

    function handleEnded() {
      var video = videos.videos.video;
      if(__TVPage__.config[0] && __TVPage__.config[0].settings.hasOwnProperty("autoend") ){
        autoend = __TVPage__.config[0].settings.autoend;
      }
      if (mobile || !JSON.parse(autoend)) {
        player.cueVideo(video.asset);
        if (video.asset.type == 'mp4') putButtonOverlay();
      } else {
        player.loadVideo(extractAsset(video));
      }
    }

    return {
      init: function(videos, opts, callback) {

        options = opts || {};
        var settings = require('./settings');
        var ready = function(p) {
          player = TVPage.instances[p.options.globalRunId];
          player.on('tvp:media:videoended', handleEnded);
          player.on('tvp:media:ready', function(){
            playerReady = true;
            if ($.isFunction(callback)) {
              callback();
            }
          });
          resize();
        };

        if (!window.TVPage) {
          $.ajax({ dataType: 'script', cache: true, url: settings.jsLib })
            .done(function() {
              if (window.TVPage) {
                ready(new TVPage.player(settings));
              }
            });
        } else {
          ready(new TVPage.player(settings));
        }
        var video = videos.videos.video;
        if (video) {
          play(extractAsset(video));
        }
        $(window).resize(resize);
      }
    };

});
