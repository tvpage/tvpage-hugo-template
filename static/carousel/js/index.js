(function() {

  //We did all the possible checks in the widget's index.js file, no need to check more here.
  var body = document.body;
  var id = body.getAttribute('data-id');
  var config = window.parent.__TVPage__.config[id];
  var channelVideos = config.channel.videos;
  var skeleton = true;

  //Render image and title for preloaded elements
  if(skeleton){
    var skeletonEl = document.getElementById('skeleton');
    var itemsLength = channelVideos.length;
    
    for (var i = 0; i < itemsLength; i++) {
      var video = channelVideos[i];
      var videoEl = skeletonEl.querySelector('.video-' + (i + 1));

      if(!videoEl)
        continue;

      videoEl.querySelector('.video-image').style.backgroundImage = "url('" + video.asset.thumbnailUrl + "')";

      var videoTitleEl = videoEl.querySelector('.video-title');
      videoTitleEl.classList.add('ready');
      videoTitleEl.innerHTML = video.title;

      if (i + 1 === config.toPreload)
        break;
    }

    skeletonEl.classList.add('updated');
  }

  //The global deps of the carousel have to be present before executing its logic.
  var depsCheck = 0;
  var deps = ['jQuery','Carousel','Utils','Analytics'];

  (function initCarousel() {
    setTimeout(function() {
      console.log('deps poll...');
      
      var ready = true;
      for (var i = 0; i < deps.length; i++)
        if ('undefined' === typeof window[deps[i]])
          ready = false;

      if(ready){

        //Now we build the carousel in the background.
        (new Carousel('carousel', config)).initialize();

      }else if(++depsCheck < 200){
        initCarousel()
      }
    },5);
  })();

}());