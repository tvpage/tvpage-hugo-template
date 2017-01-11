// define(function(require) {

//   var $ = require('jquery-private');
//   var player = require('./player/index');
  
//   var apiBase = "//localhost:1313/tvpembed/";
//   $( "div[id^='tvpembed']" ).attr("id",function(i,id){
//     (function(endpoint,el){
//       $.ajax({ url: apiBase + endpoint }).done(function(res){
//         $(el).html(res);
//         for (var i = 0; i < __TVPage__.config.length; i++) {
//           if (id === __TVPage__.config[i].id) {
//             var newId = id.replace("tvpembed", "tvp");
//             $(el).find('.tvplayerholder').attr('id', newId);
//             player.init(__TVPage__.config[i],function(){
//             })
//           }
//         }

//       });
//     }(id, this));
//   });

// });