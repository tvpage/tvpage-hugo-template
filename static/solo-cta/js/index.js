(function () {
  var config = window.parent.__TVPage__.config[Utils.attr(document.body, 'data-id')];
  var videoOnly = config.videoOnly;
  var firstVideo;
  var apiBaseUrl = config.api_base_url;
  var loginId = config.loginId;
  var firstResize = true;

  function sendResizeMessage() {
    Utils.sendMessage({
      event: config.events.resize,
      height: Utils.getWidgetHeight()
    });
  }

  function initClickToAction() {

    //load the rest of the videos except the first one we loaded in the external piece
    if(!videoOnly){
      Utils.loadScript({
        base: apiBaseUrl + '/channels/' + config.channelId + '/videos',
        params: Utils.extend({
          p: 0,
          o: config.videos_order_by,
          od: config.videos_order_direction,
          'X-login-id': loginId
        }, config.channel.parameters || {})
      }, function (data) {
        data.shift(); //nuke first video
  
        config.channel.videos = config.channel.videos.concat(data);
      });
    }

    var clickToActionEl = Utils.getById('click-to-action');
    
    function done(){
      Utils.remove(Utils.getById('skeleton').querySelector('.cta-skel-delete'));
      Utils.removeClass(clickToActionEl, 'hide-abs');

      config.profiling['widget_ready'] = Utils.now('parent');

      //send the profile log of the collected metrics
      Utils.sendProfileData(config);
    }

    var thumbnailUrl = firstVideo.asset.thumbnailUrl;
    
    if(thumbnailUrl){
      var img = new Image();
      img.onload = done();
      img.src = thumbnailUrl;  

      clickToActionEl.querySelector('.video-image').style.backgroundImage = 'url(' + thumbnailUrl + ')';
    }else{
      done();
    }

    clickToActionEl.querySelector('.click-to-action-text').innerHTML = firstVideo.title;

    function onClick() {
      if(!config.modalReady){
        return;
      }

      Utils.sendMessage({
        event: config.events.modal.open,
        clicked: firstVideo.id
      });

      config.profiling['modal_ready'] = {
        start: Utils.now('parent')
      }
    }

    if(Utils.isMobile){
      var moved = false;

      function onTouchmove(e){
        moved = true;
      }
  
      function onTouchend(){
        if(!moved){
          onClick();
        }
  
        moved = false;
      }

      clickToActionEl.addEventListener('touchend', onTouchend, false);
      clickToActionEl.addEventListener('touchmove', onTouchmove, false);
    }else{
      clickToActionEl.removeEventListener('click', onClick, false);
      clickToActionEl.addEventListener('click', onClick, false);
    }
  }

  function initAnalytics() {
    analytics = new Analytics({
      ciTrack: true,
      domain: location.hostname
    }, config);

    analytics.initialize();
  }

  Utils.poll(function () {
    return videoOnly ? config.video : config.channel.videos && config.channel.videos.length;
  }, function () {
    firstVideo = videoOnly ? config.video : config.channel.videos[0];

    Utils.globalPoll(
      ['Analytics'],
      function () {
        initClickToAction();
        initAnalytics();

        //since solo-cta has no resizing scenarios (is all handled w/css), we still need to send the new size. We also
        //ignore the 1st resize that is fired, as it has no relation with the initialization.
        window.addEventListener('resize', sendResizeMessage);
      })
  })

}());
