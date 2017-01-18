var video = {{ ($.Scratch.Get "settings").video | jsonify }};

var playerSettings = {
  divId: "{{ .File.BaseFileName }}-target",
  controls: {
    active: true,
    seekBar: { progressColor: '#273691' },
    floater: { removeControls: ['tvplogo', 'hd'], transcript: false }
  },
  poster: true,
  techOrder: 'html5,flash',
  analytics: { tvpa: false },
  apiBaseUrl: '//app.tvpage.com',
  swf: "//d2kmhr1caomykv.cloudfront.net/player/assets/tvp/tvp-1.8.3-flash.swf"
};

var extractAsset = function(video) {
  if (video && video.asset) {
    var asset = video.asset;
    asset.analyticsObj = { vd: video.id, li: video.loginId, pg: video.parentId ? video.parentId : 0 };
    if (!asset.sources) asset.sources = [{ file: asset.videoId }];
    asset.type = asset.type || 'youtube';
    return asset;
  }
};

var ready = function(p) {
  player = TVPage.instances[p.options.globalRunId];
  player.on('tvp:media:ready', function(){
    player.resize(640, 380);
    player.loadVideo(extractAsset(video));
  });
};

//ready( new TVPage.player(playerSettings) );