define(function(require) {
  
  var $ = require('jquery-private');
  var _ = require("underscore");

  require('./jquery.pubsub-loader');
  require('slick');

  var redefine = function(obj){
    return "undefined" !== typeof obj;
  };
  var onArray = function(arr,val){
    return ( -1 !== arr.indexOf(val || '') );
  };
  
  if (!redefine(window.__TVPage__) || !redefine(__TVPage__.config)) {
    return console.log('need configuration');
  }

  var id = 'widget-1';
  var $target;
  $(function(){
    $target = $('#tvp'+id).html(require('text!tmpl/skeleton.html'));
    $.ajax({
      url: '//localhost:1313/'+id+'/'
    }).done(function(res){

      // insert the page.
      $target.html(res || '');

      var serverConf, clientConf,
          onArray = function(arr,val){
            return ( -1 !== arr.indexOf(val || '') );
          };
      for (var i = 0; i < __TVPage__.config.length; i++) {
        var confItem = __TVPage__.config[i];
        if (onArray(confItem, 'tvp'+id+'-client') || onArray(confItem, 'tvp'+id+'-server')) {
          clientConf = confItem[1];
        }
      }
      __TVPage__.config = $.extend(true, require('./defaults'), clientConf, serverConf);
      
      // __TVPage__.config = $.extend(true, require('./defaults'),
      //   (function(){
      //     var client = {};
      //     if (redefine(__TVPage__.config) && __TVPage__.config.length) {
      //       console.log(__TVPage__.config );
      //     }
      //     return client;
      // }()), (function(){

      // }()));

      setTimeout(function(){
        
        $target.find('.tvpcarousel').slick(__TVPage__.config.carousel);

        // all the lightbox things
        $target.append(_.template(require('../../text!tmpl/lightbox.html'))(__TVPage__.config.lightbox));
        $.subscribe('player:play-video',function(video){
          $target.find('.tvplightbox-title').html(video.title);
        });
        var $lightboxOverlay = $target.find(__TVPage__.config.lightbox.overlayClassName);
        var hide = function(){
          $lightboxOverlay.hide().end().find('.tvplightbox').addClass('off');
          $.publish('light-box:hiding');
        };
        $(document).on('click', '.tvplightbox-close', hide).on('click', __TVPage__.config.lightbox.overlayClassName, hide);

        var targetClass = __TVPage__.config.lightbox.bodyClassName;
        require('./products/index').init({ target: targetClass });
        require('./player/index').init({ target: targetClass }, function() {
          $(document).on('click', '.tvpvideo', function(e) {
            var index = $(e.currentTarget).attr('data-index');
            if (null === typeof index && 'undefined' === typeof index) {
              return console.log('need video index'); 
            }

            $lightboxOverlay.show().end().find('.tvplightbox').removeClass('off');
            $.publish('player:play', index);
          });

        });

      },0);
      
    });
  });

});
