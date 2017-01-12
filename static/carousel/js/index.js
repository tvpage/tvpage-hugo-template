define(function(require) {

  var $ = require('jquery-private');
  require('./jquery.pubsub-loader');
  require('slick');
  
  var 
  redefine = function(obj, prop){
    return 'undefined' !== typeof obj[ prop ];
  };

  //For each widget present in the page.
  $( 'div[id^="tvpwidget"]' ).attr('id',function(i,id){

    //Dynamic retrieval of configuration object.
    var config = {};
    if ( redefine(window,'__TVPage__') && redefine(__TVPage__,'config') ) {
      for (var i = 0; i < __TVPage__.config.length; i++) {
        if (id === __TVPage__.config[i].id) config = __TVPage__.config[i];
      }
    }

    //Need to parse config to check if we need to load the data with AJAX or if content is already within the 
    //code-snippet


    // if ($.isEmpty(config) || !redefine(config,'attributes') || $.isEmptyObject(config.attributes) || !redefine(config.attributes,'search') || ) {

    // }

    // console.log( !redefine(config,'attributes') || $.isEmptyObject(config.attributes) );
    // console.log( !redefine(config.attributes,'search') || !config.attributes.search )

    //console.log( !redefine(config,'attributes') || $.isEmptyObject(config.attributes) );

    // if ($.isEmpty(config) || ( redefine(config,'attributes') &&  $.isEmpty(config.attributes)) ) {

    // } else {

    // }

    //  else if (redefine(config, 'attributes')) {

    // }

  });

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