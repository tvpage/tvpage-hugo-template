define(function(require) {

  var $ = require('jquery-private');
  require('./jquery.pubsub-loader');
  require('slick');

  console.log( "HAHAH" );

  // var redefine = function(obj, prop){
  //   return "undefined" !== typeof obj[ prop ];
  // };

  // var apiBase = "//localhost:1313/tvpwidget/";
  // $( "div[id^='tvpwidget']" ).attr("id",function(i,id){
  //   (function(endpoint,el){
  //     $.ajax({ url: apiBase + endpoint }).done(function(res){
  //       $(el).html(res);
        
  //       var config = {};
  //       if ( redefine(window, "__TVPage__") && redefine(__TVPage__, "config") ) {
  //         for (var i = 0; i < __TVPage__.config.length; i++) {
  //           if (endpoint === __TVPage__.config[i].id) {
  //             config = __TVPage__.config[i];
  //           }
  //         }
  //       }
  //       if (redefine(config, "settings") && redefine(config.settings, "carousel")) {
  //         console.log(config.settings.carousel);
  //       }
  //       $(el).find(".tvpcarousel").slick(function(){
  //         var sets = {};
  //         if (redefine(config, "settings") && redefine(config.settings, "carousel")) {
  //           sets = config.settings.carousel;
  //         }
  //         return sets;
  //       }());

  //     });
  //   }(id, this));
  // });

});