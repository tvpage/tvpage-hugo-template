;(function(doc,$, utils) {

  var videos = [],
      videosObj = Widget.videosObj;
  
  for (var key in videosObj) {
    videos.push(videosObj[key]);
  }
  
  var settings = Widget.settings;
  settings.data = videos;
  var name = settings.name;

  var grid = new Grid(name, settings);
  
  window['_tvp_'+name] = grid;
  
  //Each time a grid item is clicked.
  doc.getElementById(name).addEventListener('click', function(e){
    
    var target = e.target;
    if (!target.classList.contains('tvp-video')) return;
    
    var selectedId = target.id.split('-').pop(),
        selectedVideo = {};
    for (var i = 0; i < videos.length; i++) {
      if (videos[i].id === selectedId) {
        selectedVideo = videos[i];
      }
    }
    
    var overlay = doc.createElement('div');
    overlay.classList.add('tvp-modal-overlay');

    var modalFrag = doc.createDocumentFragment();
    modalFrag.appendChild(overlay);

    var modal = doc.createElement('div');
    modal.classList.add('tvp-modal');
    modal.innerHTML = utils.tmpl(doc.getElementById('modalTemplate').innerHTML, {
      src: Widget.baseUrl + '/tvpwidget/' + name + '-modal' + (utils.isMobile ? '-mobile' : ''),
      title: selectedVideo.title || ''
    });

    modalFrag.appendChild(modal);
    
    var close = function(){
      overlay.removeEventListener('click',close,false);
      overlay.remove();
      modal.remove();
    };
    
    modalFrag.querySelector('.tvp-modal-close').addEventListener('click',close);
    overlay.addEventListener('click',close);
    
    var iframe = modalFrag.querySelector('.tvp-iframe-modal');
    iframe.onload = function(){
      var ifr = this;
      var ifrWindow = ifr.contentWindow;
      var ifrDoc = ifr.contentWindow.document;

      ifrWindow.postMessage({
        selected: selectedId,
        videos: videos,
        page: 0
      }, Widget.baseUrl);

      var content = ifrDoc.body.querySelector('.iframe-content');
      var checks = 0;
      (function contentReady() {
        setTimeout(function() {
          if (!content.querySelector('.tvp-products').classList.contains('first-render')) {
            (++checks < 20) ? contentReady() : console.log('limit reached');
          } else {
            var ifrBodyStyle = window.getComputedStyle(ifrDoc.body,null);
            ifr.style.height = content.clientHeight + parseFloat(ifrBodyStyle.paddingTop) + parseFloat(ifrBodyStyle.paddingBottom) + 'px';
          }
        },200);
      })();
    };

    parent.document.body.appendChild(modalFrag);

  });

}(document, jQuery, Utils));