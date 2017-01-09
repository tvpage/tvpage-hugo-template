define(function(require) {

  var redefine = function(obj){
    return "undefined" !== typeof obj;
  };

  if (!redefine(window.__TVPage__) || !redefine(__TVPage__.config)) {
    return console.log('need configuration');
  }

  var $ = require('jquery-private');
  require('./jquery.pubsub-loader');
  require('slick');

  var apiBase = "//localhost:1313/tvpwidget/";
  $( "div[id^='tvpwidget']" ).attr("id",function(i,id){
    (function(endpoint,el){
      $.ajax({ url: apiBase + endpoint }).done(function(res){
        $(el).html(res);
        $(el).find(".tvpcarousel").slick({
          centerMode: true,
          centerPadding: '40px',
          slidesToShow: 3,
          responsive: [
            {
              breakpoint: 768,
              settings: {
                arrows: false,
                centerMode: true,
                centerPadding: '20px',
                slidesToShow: 3
              }
            },
            {
              breakpoint: 480,
              settings: {
                arrows: false,
                centerMode: true,
                centerPadding: '20px',
                slidesToShow: 1
              }
            }
          ]
        });
      });
    }(id, this));
  });

});