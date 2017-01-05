define(function(require) {
  
  var $ = require('jquery-private');
  var player = require('./player/index');
	
	$.ajax({
		url: '//localhost:1313/tvpwidget/2/'
	}).done(function(res){
		$('#tvpwidget-2').html(res || '');
		player.init(function(){
			console.log("player is apparentluy ready");
		})
	})

});
