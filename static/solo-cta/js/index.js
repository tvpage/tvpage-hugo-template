(function () {
  var config = window.parent.__TVPage__.config[Utils.attr(document.body, 'data-id')];
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
    Utils.loadScript({
      base: apiBaseUrl + '/channels/' + config.channelId + '/videos',
      params: Utils.extend({
        p: 0,
        o: config.videos_order_by,
        od: config.videos_order_direction,
        'X-login-id': loginId
      }, config.channel.parameters || {})
    }, function (data) {
      data.shift(); //nuke first video, we already have it

      config.channel.videos = config.channel.videos.concat(data);
    });

    var clickToActionEl = Utils.getById('click-to-action');
    var img = new Image();

    img.onload = function () {
      Utils.remove(Utils.getById('skeleton').querySelector('.cta-skel-delete'));

      Utils.removeClass(clickToActionEl, 'hide-abs');

      config.profiling['widget_ready'] = Utils.now('parent');

      //send the profile log of the collected metrics
      Utils.sendProfileData(config);
    };

    var firstVideoImage = firstVideo.asset.thumbnailUrl;

    img.src = firstVideoImage;

    clickToActionEl.querySelector('.video-image').style.backgroundImage = 'url(' + firstVideoImage + ')';

    clickToActionEl.querySelector('.click-to-action-text').innerHTML = firstVideo.title;

    function onClick() {
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
      domain: location.hostname
    }, config);

    analytics.initialize();
    analytics.track('ci');
  }

  Utils.poll(function () {
    var videos = config.channel.videos;

    return videos && videos.length;
  }, function () {
    channelVideos = config.channel.videos;

    firstVideo = channelVideos[0];

    Utils.globalPoll(
      ['Utils', 'Analytics'],
      function () {
        initClickToAction();
        initAnalytics();

        //since solo-cta has no resizing scenarios (is all handled w/css), we still need to send the new size. We also
        //ignore the 1st resize that is fired, as it has no relation with the initialization.
        window.addEventListener('resize', function () {
          if (firstResize) {
            firstResize = false;

            return;
          }

          sendResizeMessage();
        });
      })
  })

}());
