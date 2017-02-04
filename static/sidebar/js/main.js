;(function(doc,$) {

  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  var tmpl = function(template, data) {
    if (template && 'object' == typeof data) {
      return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
        var keys = key.split("."),
          v = data[keys.shift()];
        for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
        return (typeof v !== "undefined" && v !== null) ? v : "";
      });
    }
  };

  $.ajax({
    url: "http://local.tvpage.com/tvad/adx/spot",
    dataType: 'json',
    data: {
      p: this.page,
      n: 1,
      si: 1,
      li: 1,
      'X-login-id': 1
    }
  }).done(function(exchange){
    var settings = Widget.settings,
        videos = [];

    for (var key in Widget.videosObj) {
      videos.push(Widget.videosObj[key]);
    }

    var exchangeCount = exchange.length;
    while(exchangeCount > 0) {
      var xVideo = exchange[exchangeCount-1];
      xVideo = $.extend(xVideo, xVideo.entity);
      exchangeCount--;
    }
    
    videos = $.merge(exchange,videos);
    
    settings.initial = videos;
    new Grid(settings.name, settings);
    
    doc.getElementById(settings.name).addEventListener('click', function(e){
      var target = e.target;
      
      if (target.classList.contains('tvp-video')) {
        var selectdId = target.id.split('-').pop(),
            selectedVideo = {};

        for (var i = 0; i < videos.length; i++) {
          if (videos[i].id === selectdId) {
            selectedVideo = videos[i];
          }
        }
        
        var modalFrag = doc.createDocumentFragment();

        var overlay = doc.createElement('div');
        overlay.classList.add('tvp-modal-overlay');
        modalFrag.appendChild(overlay);

        var modal = doc.createElement('div');
        modal.classList.add('tvp-modal');
        modal.innerHTML = tmpl($('#modalTemplate').html(), {
          src: Widget.baseUrl + '/tvpwidget/' + settings.name + '-modal' + (isMobile ? '-mobile' : ''),
          title: selectedVideo.title || ''
        });
        modalFrag.appendChild(modal);

        var iframe = modalFrag.querySelector('.tvp-iframe-modal'),
            closeBtn = modalFrag.querySelector('.tvp-modal-close');
        
        var close = function(){
          $(modal).off().remove();
          $(overlay).off().remove();
        };
        
        $(modalFrag.querySelector('.tvp-modal-close')).click(close);
        $(overlay).click(close);
        
        iframe.onload = function(){
          this.contentWindow.postMessage({
            page: 0,
            selected: target.id.split('-').pop(),
            videos: videos
          },Widget.baseUrl);

          var that = this,
              ifrBody = this.contentWindow.document.body,
              content = ifrBody.firstChild,
              resize = function() {
                that.style.height = content.offsetHeight + 'px';
              };

          var checks = 0;
          (function contentReady() {
            setTimeout(function() {
              if (!$(content).find('.tvp-products').hasClass('first-render')) {
                (++checks < 20) ? contentReady() : console.log('limit reached');
              } else {
                resize();
              }
            },200);
          })();
        };

        parent.document.body.appendChild(modalFrag);
        
      }
    });

  });

}(document,jQuery));