define(function(require) {
  var $ = require('jquery-private');
  var player = require('./player/index');
  var config = __TVPage__.config[0];
  var obj = {};
  obj['X-login-id'] = config.loginid;
  $.map(config.channel.parameters, function(value, index) {
      obj[index] = value;
  });
  $.ajax({
    url: location.protocol+"//app.tvpage.com/api/channels/"+config.channel.id+"/videos",
    dataType: 'jsonp',
    data:obj
  }).done(function(res){
    player.init(res,function(){});
  })
});