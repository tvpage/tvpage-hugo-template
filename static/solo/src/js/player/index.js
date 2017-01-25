define(function(require) {

    var $ = require('jquery-private');

    var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      options = null,
      multiple = false,
      index = 0,
      config = __TVPage__.config[0],
      targetId = config.id + "-target",
      player = null,
      autoplay = true,
      autonext = true,
      progresscolor = '#E57211',
      removecontrols = ["tvplogo","hd"],
      transcript = false;

    function resize() {
      if (player) {
        player.resize($('#'+targetId).width(), $('#'+targetId).height());
      }
    }

    function putButtonOverlay() {
      $('<div/>').attr('class', 'tvpplayer-play').insertAfter('#'+targetId).on('click', function() {
        $(this).off().remove();
        return player ? player.play() : false;
      });
    }

    function play(asset,settings) {
      if (asset) {
        if("undefined" !== typeof player && "undefined" !== typeof settings && settings.hasOwnProperty("controls")){
          $('#'+player.options.DOMContainer.id).find('.tvp-progress-bar').css('background-color', settings.controls.seekBar.progressColor);
        }
        if (mobile || !JSON.parse(autoplay)) {
          player.cueVideo(asset);
          if (asset.type == 'mp4') putButtonOverlay();
        } else {
          player.loadVideo(asset);
        }
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
      if(multiple){
        index = (index == assetsList.length - 1) ? 0 : index + 1; 
        if (mobile || !JSON.parse(autonext)) {
          player.cueVideo(assetsList[index].asset);
          if (assetsList[index].asset.type == 'mp4') putButtonOverlay();
        } else {
          player.loadVideo(extractAsset(assetsList[index]));
        }
      }
    }

    function playbackSettings(){
      if(config && "undefined" !== typeof config.playback.settings){
        if(config.playback.settings.hasOwnProperty("autoplay") ){
          autoplay = config.playback.settings.autoplay;
        }
        if(config.playback.settings.hasOwnProperty("autonext") ){
          autonext = config.playback.settings.autonext;
        }
        if(config.playback.settings.hasOwnProperty('progresscolor')){
          progresscolor = config.playback.settings.progresscolor;
        }
        if(config.playback.settings.hasOwnProperty('removecontrols')){
          removecontrols = config.playback.settings.removecontrols;
        }
        if(config.playback.settings.hasOwnProperty('transcript')){
          transcript = config.playback.settings.transcript;
        }
      }
    }

    function playerSettings(){
      return {
        divId:targetId,
        controls: {
          active: true,
          seekBar: { progressColor: progresscolor
          },
          floater: { removeControls: removecontrols, transcript: transcript  }
        },
        poster: true,
        techOrder: 'html5,flash',
        analytics: { tvpa: false },
        apiBaseUrl: '//app.tvpage.com',
        swf: "//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.3-flash.swf"
      };
    }

    return {
      init: function(opts, callback) {
        var checks = 0;
        (function libsPoller() {
          setTimeout(function() {
            if ("undefined" === typeof window._tvpa || "undefined" === typeof window.TVPage) {
              if (++checks < 10) {
                libsPoller();
              }
            } else {
              _tvpa.push(["config", { li: '{{ .Param "loginid" }}', gaDomain:"www.tvpage.tv", "logUrl": "\/\/api.tvpage.com\/v1\/__tvpa.gif"}]);
              _tvpa.push(["track","ci",{ li: '{{ .Param "loginid" }}'}]);
            }
          }, 300);
        })();

        options = opts || {};
        var ready = function(p) {
          player = TVPage.instances[p.options.globalRunId];
          player.on('tvp:media:videoended', handleEnded);
          player.on('tvp:media:ready', function(){
            multiple = true;
            window.assetsList = opts;
            var video = assetsList[index];
            if (video) {
              play(extractAsset(video),playerSettings());
            }
            if ($.isFunction(callback)) {
              callback();
            }
          });
          resize();
        };

        playbackSettings();

        if ( "undefined" !== typeof window.TVPage ) {
          ready(new TVPage.player(playerSettings())); 
        }

        $(window).resize(resize);
      }
    };

});
