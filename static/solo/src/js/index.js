define(function(require) {
  var $ = require('jquery-private');
  var player = require('./player/index');
  var config = __TVPage__.config[0];

  // var referenceIds = config.attributes.referenceIds;
  // $.ajax({
  //   url: location.protocol + "//app.tvpage.com/api/videos/referenceIds",
  //   dataType: 'jsonp',
  //   data: {'X-login-id': config.loginid, 'ids': referenceIds.toString() }
  // }).done(function(res){
  //   var videos = [];
  //   for(var i in referenceIds){
  //     videos = videos.concat(res[referenceIds[i]]);
  //   }
  //   player.init(videos,function(){});
  // })

  var obj = {};
  var code = config.attributes.category[0].code;
  obj['X-login-id'] = config.loginid;
  obj[code] = config.attributes.category[0].value;

  $.ajax({
    url: location.protocol + "//app.tvpage.com/api/videos/search",
    dataType: 'jsonp',
    data:obj
  }).done(function(res){
    console.log(res);
    player.init(res,function(){});
  })
});