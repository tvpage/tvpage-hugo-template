define(function(require) {

    var $ = require('jquery-private');

    var iOSsmall = /iPhone|iPod/i.test(navigator.userAgent),
      mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      $el = null,
      options = null,
      assetsList = null,
      playerReady = null,
      player = null,
      index = null,
      multiple = true,
      keys = null;

    function resize() {
      if (player && $el.length) {
        player.resize($el.width(), $el.height());
      }
    }

    function putButtonOverlay() {
      $('<div/>').attr('id', 'tvpp-play').insertAfter('#tvpp-holder').on('click', function() {
        $el.find('.video-overlay').hide();
        $(this).off().remove();
        return player ? player.play() : false;
      });
    }

    function play(asset) {
      if (asset) {
        if (asset.type === 'mp4' && iOSsmall) {
          $el.addClass('tvp-controls-mp4');
          $el.find('#ControlBarFloater').parent().addClass('tvp-hide-mp4');
        } else {
          $el.removeClass('tvp-controls-mp4');
          $el.find('#ControlBarFloater').parent().removeClass('tvp-hide-mp4');
        }
        var checks = 0;
        (function readyPoller( ){
          var deferred = setTimeout(function(){
            if (!playerReady) {
              if ( ++checks < 25 ) {
                readyPoller();
              }
            } else {
              if (mobile) {
                player.cueVideo(asset);
                if (!iOSsmall && asset.type == 'mp4') putButtonOverlay();
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
      if (multiple) {
        index = (index == assetsList.length - 1) ? 0 : index + 1;
        if (mobile) {
          player.cueVideo(asset);
          if (!iOSsmall && assetsList[index].type == 'mp4') putButtonOverlay();
        } else {
          player.loadVideo(extractAsset(assetsList[index]));
        }
      }
    }

    return {
      init: function(opts, callback) {

        options = opts || {};

        var html = require('text!tmpl/player.html');
        $el = $(html).appendTo(opts.target);

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

        //assetsList = __TVPage__.config.videos;

        $(window).resize(resize);
      }
    };

});
