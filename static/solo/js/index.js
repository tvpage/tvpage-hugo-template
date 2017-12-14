(function () {
  var config = window.parent.__TVPage__.config[Utils.attr(document.body, 'data-id')];
  var eventPrefix = config.events.prefix;
  var playerChangeEvent = eventPrefix + ':widget_player_change';
  var menu;
  var player;
  var playlistEnabled = config.playlist;
  var isFirstVideoPlay = true;
  var isFirstPlayButtonClick = true;

  function initPlayer() {
    function onPlayerReady(){
      if (playlistEnabled) {
        menu = new Menu(player, config);
        menu.initialize();
      }

      Utils.remove(Utils.getById('skeleton'));
      
      Utils.removeClass(player.el.parentNode, 'hide');

      config.profiling['widget_ready'] = Utils.now('parent');
    }

    function onPlayerNext(next) {
      if (next && playlistEnabled) {
        menu.setActiveItem(next.assetId);
        menu.hideMenu();
      }
    }

    function onPlayerFullscreenChange() {
      if (playlistEnabled) {
        menu.hideMenu();
      }
    }

    function onPlayerChange(e, currentAsset){
      Utils.sendMessage({
        event: playerChangeEvent,
        e: e,
        stateData : currentAsset
      });

      if("tvp:media:videoplaying" === e && isFirstVideoPlay){
        isFirstVideoPlay = false;

        config.profiling['video_playing'] = Utils.now('parent') - config.profiling['video_playing'].start;

        //send the profile log of the collected metrics
        var profiling = config.profiling;

        for (var key in profiling) {
          var profile = profiling[key];

          if(Utils.isObject(profile))
            continue;

          Utils.profile(config, {
            metric_type: key,
            metric_value: profile
          });
        }
      }
    }

    function onPlayerClick(e){
      if(e && e.target){
        var target = Utils.getRealTargetByClass(e.target, 'tvplayer-playbutton');
          
        if(target && isFirstPlayButtonClick){
          isFirstPlayButtonClick = false;

          config.profiling['video_playing'] = {
            start: Utils.now('parent')
          }
        }
      }
    }

    player = new Player('player', {
      ciTrack: true,
      data: config.channel.videos,
      onPlayerReady: onPlayerReady,
      onChange: onPlayerChange,
      onNext: onPlayerNext,
      onFullscreenChange: onPlayerFullscreenChange,
      onClick: onPlayerClick
    }, config);

    player.initialize();

    config.profiling['video_playing'] = {
      start: Utils.now('parent')
    };
  }

  //global deps check before execute
  var globalDeps = ['Utils', 'Player'];

  if (playlistEnabled) {
    globalDeps.push('Ps', 'Menu');
  }

  Utils.globalPoll(globalDeps, initPlayer);
}());
