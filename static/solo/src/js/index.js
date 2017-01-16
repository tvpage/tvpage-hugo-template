define(function(require) {
  var $ = require('jquery-private');
  var player = require('./player/index');
  var config = __TVPage__.config[0];
  var obj = {};
  obj['X-login-id'] = config.loginid;
  $.map(config.attributes, function(value, index) {
      obj[index] = value;
  });
  $.ajax({
    url: location.protocol+"//app.tvpage.com/api/channels/"+config.channelId+"/videos",
    dataType: 'jsonp',
    data:obj
  }).done(function(res){
    player.init(res,function(){});
  })
});