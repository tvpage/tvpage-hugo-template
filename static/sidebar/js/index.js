(function () {
  var config = window.parent.__TVPage__.config[Utils.attr(document.body, 'data-id')];
  var channelVideos;
  var templates = config.templates;
  var grid;

  function sendResizeMessage() {
    Utils.sendMessage({
      event: config.events.resize,
      height: Utils.getWidgetHeight()
    });
  }

  function initVideos() {
    function parseVideos(item) {
      item.title = Utils.trimText(item.title, 25);

      return item;
    }

    function onVideosGridReady() {
      Utils.remove(Utils.getById('skeleton').querySelector('.videos-skel-delete'));

      Utils.removeClass(grid.el, 'hide-abs');

      Utils.addClass(document.body, 'widget-ready');

      config.profiling['widget_ready'] = Utils.now('parent');

      //send the profile log of the collected metrics
      Utils.sendProfileData(config);
    }

    function onVideosGridLoad(data) {
      config.channel.videos = config.channel.videos.concat(data);
    }

    function onVideosGridClick(e) {
      if (!e || !e.target || !config.modalReady) {
        return; 
      }

      Utils.sendMessage({
        event: config.events.modal.open,
        clicked: Utils.attr(Utils.getRealTargetByClass(e.target, 'video'), 'data-id')
      });

      config.profiling['modal_ready'] = {
        start: Utils.now('parent')
      }
    }

    grid = new Grid('videos', {
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
      ciTrack: true,
      domain: location.hostname
    }, config);

    analytics.initialize();
  }

  Utils.poll(function () {
    var videos = config.channel.videos;

    return videos && videos.length;
  }, function () {
    channelVideos = config.channel.videos;

    //global deps check before execute
    Utils.globalPoll(
      ['Utils', 'Analytics', 'Grid'],
      function () {
        initAnalytics();
        initVideos();

        sendResizeMessage();

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

    var widgetTitleEl = Utils.getById('widget-title');
    widgetTitleEl.innerHTML = config.title_text;

    Utils.addClass(widgetTitleEl, 'ready');
  });

}());
