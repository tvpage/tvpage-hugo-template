(function() {
  var body = document.body;
  var id = body.getAttribute('data-id');
  var config = window.parent.__TVPage__.config[id];

  function renderCta(){  
    var videos = config.channel.videos;
    var firstVideo = videos[0];
    
    config.channel.firstVideo = firstVideo;

    var overlayEl = Utils.getByClass('tvp-cta-overlay');
    overlayEl.style.backgroundImage = "url(" + firstVideo.asset.thumbnailUrl + ")";
    // overlayEl.innerHTML = config.templates.base + "<div class='tvp-cta-text'>" + firstVideo.title + "</div>";

    
    function onClick(e){
      window.postMessage({
        event: eventPrefix + ':widget_click',
        clicked: firstVideo.id
      }, '*');
    }
    
    overlayEl.removeEventListener("click", onClick, false);
    overlayEl.addEventListener("click", onClick, false);
  }
 
  var deps = ['Utils', 'Analytics'],
      depsCheck = 0,
      depsCheckLimit = 1000;

  (function initSolo() {
    setTimeout(function() {
      console.log('deps poll...');
      
      var ready = true;
      for (var i = 0; i < deps.length; i++)
        
        if ('undefined' === typeof window[deps[i]]){
          var dep = deps[i];
          if(config.debug){
            console.log(dep + ' is undefined');
          }
          ready = false;
        }

      if(ready){

        renderCta();
        
      }else if(++depsCheck < 200){
        initSolo()
      }
    },5);
  })();
}());