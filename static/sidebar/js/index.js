(function(){
  var body = document.body;
  var id = body.getAttribute('data-id');
  var config = window.parent.__TVPage__.config[id];
  var channelVideos = config.channel.videos;
  var channelParams = config.channel.parameters;
  var eventPrefix = config.events.prefix;
  var apiBaseUrl = config.api_base_url;
  var videosEndpoint = apiBaseUrl + '/channels/' + config.channelId + '/videos';
  var templates = config.templates;
  var skeletonEl = document.getElementById('skeleton');

  function initVideos(){

    function parseVideos(item){
      item.title = Utils.trimText(item.title, 25);
  
      return item;
    }

    function onVideosGridReady(){
      Utils.remove(skeletonEl.querySelector('.videos-skel-delete'));
    }

    function onVideosGridLoad(data){
      config.channel.videos = channelVideos.concat(data);
    }

    function onVideosGridClick(e){
      if(e && e.target){
        var realTarget = Utils.getRealTargetByClass(e.target, 'video');

        if(realTarget){
          Utils.sendMessage({
            event: eventPrefix + ':widget_modal_open',
            clicked: Utils.attr(realTarget, 'data-id')
          });
        }
      }
    }

    var grid = new Grid('videos', {
      data: channelVideos,
      templates:{
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

  function initAnalytics(){
    var analytics = new Analytics();
    var analyticsConfig = {
      domain: location.hostname || '',
      logUrl: apiBaseUrl + '/__tvpa.gif',
      li: config.loginId
    };

    if (config.firstPartyCookies && config.cookieDomain)
        analyticsConfig.firstPartyCookieDomain = config.cookieDomain;

    analytics.initConfig(analyticsConfig);

    analytics.track('ci', {
      li: config.loginId
    });
  }

  //global deps check
  var depsCheck = 0;
  var depsCheckLimit = 1000;
  var deps = ['Utils','Analytics','Grid'];

  (function initSidebar(){
    setTimeout(function() {
      console.log('deps poll...');
      
      var ready = true;
      for (var i = 0; i < deps.length; i++)
        if ('undefined' === typeof window[deps[i]])
          ready = false;

      if(ready){
        if(Utils.isMobile){
          Utils.addClass(body,'mobile');
        }

        initAnalytics();
        initVideos();

        //window will fire a resize event almost immediately, we don't want to handle it as the CSS is yet
        //not ready
        var firstResize = true;

        //since sidebar has no resizing scenarios (is all handled w/css), we still
        //need to send the new size.
        window.addEventListener('resize',function(){
          if(firstResize){
            firstResize = false;
            return;
          }

          Utils.sendMessage({
            event: eventPrefix + ':widget_resize',
            height: Utils.getWidgetHeight() + 10
          });
        });

      }else if(++depsCheck < depsCheckLimit){
        initSidebar()
      }
    },5);
  })();

  //we check when critical css has loaded/parsed. At this step, we have data to
  //update the skeleton. We wait until css has really executed in order to send
  //the right measurements.
  var cssLoadedCheck = 0;
  var cssLoadedCheckLimit = 1000;

  (function sendFirstSize(){
    setTimeout(function() {
      console.log('css loaded poll...');

      if('hidden' === Utils.getStyle(Utils.getById('bs-checker'), 'visibility')){
        //add widget title
        var widgetTitleEl = Utils.getById('widget-title');
        widgetTitleEl.innerHTML = config.title_text;
        Utils.addClass(widgetTitleEl, 'ready');

        Utils.sendMessage({
          event: eventPrefix + ':widget_resize',
          height: Utils.getWidgetHeight() + 10
        });

      }else if(++cssLoadedCheck < cssLoadedCheckLimit){
        sendFirstSize()
      }
    },10);
  })();

}());