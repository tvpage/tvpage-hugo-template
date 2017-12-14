(function () {
  var config = window.parent.__TVPage__.config[Utils.attr(document.body, 'data-id')];
  var channelVideos = config.channel.videos;
  var channelParams = config.channel.parameters;
  var eventPrefix = config.events.prefix;
  var resizeEvent = eventPrefix + ':widget_resize';
  var modalOpenEvent = eventPrefix + ':widget_modal_open'
  var apiBaseUrl = config.api_base_url;
  var videosEndpoint = apiBaseUrl + '/channels/' + config.channelId + '/videos';
  var templates = config.templates;
  var skeletonEl = Utils.getById('skeleton');

  function sendResizeMessage() {
    Utils.sendMessage({
      event: resizeEvent,
      height: Utils.getWidgetHeight()
    });
  }

  //we check when critical css has loaded/parsed. At this step, we have data to
  //update the skeleton. We wait until css has really executed in order to send
  //the right measurements.
  Utils.poll(function () {
      return 'hidden' === Utils.getStyle(Utils.getById('bscheck'), 'visibility');
    },
    function () {
      var widgetTitleEl = Utils.getById('widget-title');

      widgetTitleEl.innerHTML = config.title_text;

      Utils.addClass(widgetTitleEl, 'ready');
      Utils.addClass(skeletonEl, 'ready');

      sendResizeMessage();
      
      config.profiling['skeleton_shown'] = Utils.now('parent')
    });

  function initVideos() {
    function parseVideos(item) {
      item.title = Utils.trimText(item.title, 25);

      return item;
    }

    function onVideosGridReady() {
      Utils.remove(skeletonEl.querySelector('.videos-skel-delete'));

      config.profiling['widget_ready'] = Utils.now('parent');

      //send the profile log of the collected metrics
      Utils.sendProfileData(config);
    }

    function onVideosGridLoad(data) {
      config.channel.videos = config.channel.videos.concat(data);
    }

    function onVideosGridClick(e) {
      if (e && e.target) {
        Utils.sendMessage({
          event: modalOpenEvent,
          clicked: Utils.attr(Utils.getRealTargetByClass(e.target, 'video'), 'data-id')
        });

        config.profiling['modal_ready'] = {
          start: Utils.now('parent')
        }
      }
    }

    var grid = new Grid('videos', {
      data: channelVideos,
      templates: {
        list: templates.videos.list,
        item: templates.videos.item
      },
      parse: parseVideos,
      onReady: onVideosGridReady,
      onClick: onVideosGridClick,
      onLoad: onVideosGridLoad
    }, config);

    grid.initialize();
    grid.render();
  };

  function initAnalytics() {
    analytics = new Analytics({
      domain: location.hostname
    }, config);

    analytics.initialize();
    analytics.track('ci');
  }

  //global deps check before execute
  Utils.globalPoll(
    ['Utils', 'Analytics', 'Grid'],
    function () {
      initAnalytics();
      initVideos();

      //since sidebar has no resizing scenarios (is all handled w/css), we still need to send the new size. We also
      //ignore the 1st resize that is fired, as it has no relation with the initialization.
      var firstResize = true;
      window.addEventListener('resize', function () {
        if (firstResize) {
          firstResize = false;

          return;
        }

        sendResizeMessage();
      });
    });

}());
