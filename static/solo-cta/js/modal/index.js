(function() {
    
    var eventPrefix = "tvp_" + (document.body.getAttribute("data-id") || "").replace(/-/g, '_');
  
    var initialize = function() {
      var el = Utils.getByClass('iframe-content');
  
      window.addEventListener('message', function(e) {
        if (!e || !Utils.isset(e, 'data') || !Utils.isset(e.data, 'event'))
          return;
  
        var data = e.data;
  
        if (eventPrefix + ':modal_data' === data.event) {
          var config = data.runTime;
          var playerConfig = Utils.copy(config);
          
          playerConfig.data = data.data;
    
          playerConfig.onResize = function() {
            Utils.sendMessage({
              event: eventPrefix + ':modal_resize',
              height: el.offsetHeight + 'px'
            });
          }
    
          playerConfig.onNext = function(next) {
            Utils.sendMessage({
              event: eventPrefix + ':player_next',
              next: next || {}
            });
          };
    
          var player = new Player('tvp-player-el', playerConfig, data.selectedVideo.id);
          player.initialize();
        }
      });
  
      Utils.sendMessage({
        event: eventPrefix + ':modal_initialized',
        height: (el.offsetHeight + 20) + 'px'
      });
    };
  
    var not = function(obj) {
      return 'undefined' === typeof obj;
    };
    if (not(window.TVPage) || not(window._tvpa) || not(window.Utils) || not(window.Analytics) || not(window.Player)) {
      var libsCheck = 0;
      (function libsReady() {
        setTimeout(function() {
          if (not(window.TVPage) || not(window._tvpa) || not(window.Utils) || not(window.Analytics) || not(window.Player)) {
            if (++libsCheck < 50) {
              libsReady();
            }
          } else {
            initialize();
          }
        }, 150);
      })();
    } else {
      initialize();
    }
  
  }());
