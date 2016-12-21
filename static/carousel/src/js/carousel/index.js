define(function(require) {

    var $ = require('jquery-private');
    var _ = require('underscore');

    require('slick');

    var $el = $('#tvp-gallery');
    var settings = require('./settings');
    var skeleton = require('text!tmpl/skeleton.html');

    $el.addClass('tvp-skel');
    $el.html(skeleton);

    var move = function(dir){$('#tvpchg-slider').slick('slick' + ( dir || "" ).charAt(0).toUpperCase() );};
    $(document).on('click', '.tvp-arrow-prev', function(e) {
      move("prev");
    }).on('click', '.tvp-arrow-prev',function(e) {
      move("next")
    });

    console.log( $('#tvpchg-slider') )

    //$('#tvpchg-slider').slick(settings);

    // var templ = '<div><div data-tvp-video-id="<%= id %>" data-index="<%= index %>" class="tvp-video col-3"><div class="tvp-video-image" style="background-image:url(\'<%= asset.thumbnailUrl %>\'); "><div class="video-overlay"></div><div class="tvp-video-play-button"></div></div><p><span class="tittle"><%= title %></span></p></div></div>';
    // $.ajax({
    //   url: "//app.tvpage.com/api/channels/"+_tvp.channelId+"/videos",
    //   dataType: 'jsonp',
    //   data:{
    //     category: _tvp.urlId,
    //     "X-login-id": _tvp.lid
    //   }
    // }).done(function(res) {
    //   var videos = res.slice(0, 8);
    //   var html = '<div id="tvpchg-slider">';
    //   if (res && res.length) {
    //     _tvp.channel = {videos:videos};
    //     for (var i = 0; i < videos.length; i++) {
    //       videos[i].index = i;
    //       html+=_.template( templ )( videos[i] );
    //     }
    //   }
    //   html += "</div>";

    //   $el.html(html).promise().done(function() {
    //     $el.find('#tvpchg-slider').slick(settings);
    //   });

    // });
    
});
