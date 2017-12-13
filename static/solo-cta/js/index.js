(function(){
  var body = document.body;
  var id = body.getAttribute('data-id');
  var config = window.parent.__TVPage__.config[id];
  var firstVideo = config.channel.videos[0];
  var apiBaseUrl = config.api_base_url;
  var eventPrefix = config.events.prefix;
  var resizeEvent = eventPrefix + ':widget_resize';
  var modalOpenEvent = eventPrefix + ':widget_modal_open';
  var loginId = config.loginId;
  var skeletonEl = document.getElementById('skeleton');
  
  function sendResizeMessage(){
    Utils.sendMessage({
      event: resizeEvent,
      height: Utils.getWidgetHeight()
    });
  }

  //we check when critical css has loaded/parsed. At this step, we have data to
  //update the skeleton. We wait until css has really executed in order to send
  //the right measurements.
  var cssLoadedCheck = 0;
  var cssLoadedCheckLimit = 1000;

  (function cssPoll(){
    setTimeout(function(){
      var bsCheckEl = document.getElementById('bscheck');
      
      if ('hidden' === getComputedStyle(bsCheckEl, null).getPropertyValue('visibility')){
        skeletonEl.style.visibility = 'visible';
        skeletonEl.style.opacity = '1';

        sendResizeMessage();

        config.profiling['skeleton_shown'] = Utils.now('parent');
      } else if (++cssLoadedCheck < cssLoadedCheckLimit) {
        cssPoll()
      }
    }, 5);
  })();

  function initClickToAction(){
    Utils.loadScript({
      base: apiBaseUrl + '/channels/' + config.channelId + '/videos',
      params: Utils.extend({
        p: 0,
        o: config.videos_order_by,
        od: config.videos_order_direction,
        'X-login-id': loginId
      }, config.channel.parameters || {})
    }, function(data){
      data.shift();//nuke first video, we already have it

      config.channel.videos = config.channel.videos.concat(data);
    });

    var clickToActionEl = Utils.getById('click-to-action');
    var img = new Image();
    
    img.onload = function(){
      Utils.remove(skeletonEl.querySelector('.cta-skel-delete'));
      
      Utils.removeClass(clickToActionEl, 'hide-abs');
    };

    var firstVideoImage = firstVideo.asset.thumbnailUrl;

    img.src = firstVideoImage;

    clickToActionEl.querySelector('.video-image').style.backgroundImage = 'url(' + firstVideoImage + ')';
    
    clickToActionEl.querySelector('.click-to-action-text').innerHTML = firstVideo.title;

    function onClick(){
      Utils.sendMessage({
        event: modalOpenEvent,
        clicked: firstVideo.id
      });

      config.profiling['modal_ready'] = {
        start: Utils.now('parent')
      }
    }

    clickToActionEl.removeEventListener('click', onClick, false);
    clickToActionEl.addEventListener('click', onClick, false);
  }

  function initAnalytics() {
    var analytics = new Analytics();

    var analyticsConfig = {
      domain: location.hostname,
      logUrl: apiBaseUrl + '/__tvpa.gif',
      li: loginId
    };

    if (config.firstPartyCookies && config.cookieDomain)
      analyticsConfig.firstPartyCookieDomain = config.cookieDomain;

    analytics.initConfig(analyticsConfig);

    analytics.track('ci', {
      li: loginId
    });
  }

  //The global deps of the carousel have to be present before executing its logic.
  var deps = ['Utils', 'Analytics'];
  var depsCheck = 0;
  var depsCheckLimit = 1000;
  var depsLength = deps.length;

  (function initialize(){
    setTimeout(function() {
      var ready = true,
          missing;

      for (var i = 0; i < depsLength; i++){
        var dep = deps[i];

        if (undefined === window[dep]){
          ready = false;

          missing = dep;
        }
      }

      if(ready){
        initClickToAction();
        initAnalytics();

        //since sidebar has no resizing scenarios (is all handled w/css), we still need to send the new size. We also
        //ignore the 1st resize that is fired, as it has no relation with the initialization.
        var firstResize = true;
        window.addEventListener('resize',function(){
          if(firstResize){
            firstResize = false;
            
            return;
          }

          sendResizeMessage();
        });
      } else if (++depsCheck < depsCheckLimit) {
        initialize()
      }
    }, 5);
  })();

}());