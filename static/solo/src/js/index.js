define(function(require) {

  var $ = require('jquery-private');
  var player = require('./player/index');
  
  $.ajax({
    url: '//localhost:35831/tvpembed/83094487/'
  }).done(function(res){
    $('#tvpwidget-2').html(res || '');
    player.init(function(){
    })
  })

});