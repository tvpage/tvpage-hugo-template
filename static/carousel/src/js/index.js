define(function(require) {

  var $ = require('jquery-private');

  $(function(){

    var $carousel = $('#tvp-gallery');
    $carousel.html(require('text!tmpl/skeleton.html'));

    $.ajax({
      url: '//localhost:1313/carousel-1/'
    }).done(function(res){

      $carousel.html(res || '');
      $carousel.find(TVP.config.sliderSelector);
      var settings = require('./carousel/settings');
      // Create the slider.
      
    });

  });

});
