;(function(window,document,utils) {

  var videos = [],
      videosObj = Widget.videosObj;
  
  for (var key in videosObj) {
    videos.push(videosObj[key]);
  }
  
  var settings = Widget.settings;
  settings.data = videos;
  var name = settings.name;

  var grid = new Grid(name, settings);
  var mainEl = document.getElementById(name);

  var renderCheck = 0;
  (function renderReady() {
    setTimeout(function() {
      if (!mainEl.classList.contains('first-render')) {
        (++renderCheck < 20) ? renderReady() : console.log('limit reached');
      } else if (window.parent && window.parent.parent) {
        window.parent.parent.postMessage({
          event: '_tvp_widget_first_render',
          height: mainEl.offsetHeight + 'px'
        }, '*');
      }
    },200);
  })();
  
  //Each time a grid item is clicked.
  mainEl.addEventListener('click', function(e){
    
    var target = e.target;
    if (!target.classList.contains('tvp-video')) return;
    
    var selectedId = target.id.split('-').pop(),
        selectedVideo = {};
    for (var i = 0; i < videos.length; i++) {
      if (videos[i].id === selectedId) {
        selectedVideo = videos[i];
      }
    }

    if (window.parent && window.parent.parent) {
      window.parent.parent.postMessage({
        event: '_tvp_sidebar_video_click',
        selectedVideo: selectedVideo,
        videos: videos
      }, '*');
    }

  });

}(window, document, Utils));