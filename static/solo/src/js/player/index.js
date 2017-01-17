define(function(require) {

    var $ = require('jquery-private');

    var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      autoplay = true,
      autoend = true,
      options = null,
      playerReady = null,
      multiple = false,
      index = null,
      config = __TVPage__.config[0],
      targetId = config.id + "-target",
      player = null;

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

    function play(asset) {
      if(config && config.settings && config.settings.hasOwnProperty("autoplay") ){
        autoplay = config.settings.autoplay;
      }
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
      if(multiple){
        index = (index == assetsList.length - 1) ? 0 : index + 1; 
        if(config && config.settings && config.settings.hasOwnProperty("autoend") ){
          autoend = config.settings.autoend;
        }
        if (mobile || !JSON.parse(autoend)) {
          player.cueVideo(assetsList[index].asset);
          if (assetsList[index].asset.type == 'mp4') putButtonOverlay();
        } else {
          player.loadVideo(extractAsset(assetsList[index]));
        }
      }
    }

    return {
      init: function(opts, callback) {
        _tvpa.push(["config", { li: '{{ .Param "loginid" }}', gaDomain:"www.tvpage.tv", "logUrl": "\/\/api.tvpage.com\/v1\/__tvpa.gif"}]);
        _tvpa.push(["track","ci",{ li: '{{ .Param "loginid" }}'}]);
        index = 0;
        options = opts || {};
        var ready = function(p) {
          player = TVPage.instances[p.options.globalRunId];
          player.on('tvp:media:videoended', handleEnded);
          player.on('tvp:media:ready', function(){
            playerReady = true;
            if(player && settings && settings.hasOwnProperty("controls")){
              $('#'+player.options.DOMContainer.id).find('.tvp-progress-bar').css('background-color', settings.controls.seekBar.progressColor);
            }
            if ($.isFunction(callback)) {
              callback();
            }
          });
          resize();
        };

        // Check for settings is passed or not
        if(config && config.settings){
          if(config.settings.hasOwnProperty('progresscolor')){
            var progresscolor = config.settings.progresscolor;
          }else{
            var progresscolor = '#E57211';
          }
          if(config.settings.hasOwnProperty('removecontrols')){
            var removecontrols = config.settings.removecontrols;
          }else{
            var removecontrols = ["tvplogo","hd"];
          }
          if(config.settings.hasOwnProperty('transcript')){
            var transcript = config.settings.transcript;
          }else{
            var transcript = false;
          }
        }else{
          var progresscolor = '#E57211',
           removecontrols = ["tvplogo","hd"],
           transcript = false;
        }

        var settings = {
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
          swf: "//d2kmhr1caomykv.cloudfront.net/player/assets/tvp/tvp-1.8.3-flash.swf"
        };

        (function poller( ){
          var deferred = setTimeout(function(){
            if ( "undefined" !== typeof window.TVPage ) {
              ready(new TVPage.player(settings)); 
            } else {
              poller();
            }
          },200);
        })();

        multiple = true;
        assetsList = opts;
        var video = assetsList[index];
        if (video) {
          play(extractAsset(video));
        }

        $(window).resize(resize);
      }
    };

});
