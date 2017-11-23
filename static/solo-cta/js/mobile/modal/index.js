
  var depsCheck = 0;
  var deps = ['TVPage','Utils','Analytics','Player'];

  (function initSoloCTA() {
    setTimeout(function() {
      console.log('deps poll...');
      
      var ready = true;
      for (var i = 0; i < deps.length; i++)
        if ('undefined' === typeof window[deps[i]])
          ready = false;

      if(ready){
        console.log('si')
        var el = Utils.getByClass('iframe-content');

        var initPlayer = function(data) {
            var s = JSON.parse(JSON.stringify(data.runTime));

            s.data = data.data;

            s.onResize = function() {
                setTimeout(function() {
                    if (window.parent && !hasData) {
                        window.parent.postMessage({
                            event: eventPrefix + ':modal_resize',
                            height: (el.offsetHeight + parseInt(data.runTime.iframe_modal_body_padding || '0')) + 'px'
                        }, '*');
                    }
                }, 0);
            }

            s.onNext = function(next) {
                if (!next) return;

                data.runTime.loginId = data.runTime.loginId || data.runTime.loginid;

                if (Utils.isset(next, 'products')) {
                    render(next.products,data.runTime);
                } else {
                    if (!data.runTime.merchandise) {
                        el.classList.add('tvp-no-products');
                        eventName = eventPrefix + ':modal_no_products';
                        notify();
                    }else{
                        loadProducts(
                            next.assetId,
                            data.runTime,
                            function(products) {
                                setTimeout(function() {
                                    checkProducts(products,el);
                                    render(products,data.runTime);
                                }, 0);
                            });
                    }
                }
                setTimeout(function() {
                    if (window.parent) {
                        window.parent.postMessage({
                            event: eventPrefix + ':player_next',
                            next: next
                        }, '*');
                    }
                }, 0);
            };
            var player = new Player('tvp-player-el', s, data.selectedVideo.id);
            player.initialize();
        };

        window.addEventListener('message', function(e) {
            if (!e || !Utils.isset(e, 'data') || !Utils.isset(e.data, 'event')) return;
            var data = e.data;

            if (eventPrefix + ':modal_data' === data.event) {
                initPlayer(data);

                var settings = data.runTime;
                var loginId = settings.loginId || settings.loginid;
                
                settings.loginId = loginId;

                channelId = Utils.isset(settings.channel) && Utils.isset(settings.channel.id) ? settings.channel.id : (settings.channelId || settings.channelid);

                analytics = new Analytics();
                analytics.initConfig({
                    logUrl: settings.api_base_url + '/__tvpa.gif',
                    domain: Utils.isset(location, 'hostname') ? location.hostname : '',
                    loginId: loginId,
                    firstPartyCookies: settings.firstpartycookies,
                    cookieDomain: settings.cookiedomain
                });
                analytics.track('ci', {li: loginId});

                var selectedVideo = data.selectedVideo;
                if (Utils.isset(selectedVideo, 'products')) {
                    render(selectedVideo.products,settings);
                } else {
                    if (!settings.merchandise) {
                        el.classList.add('tvp-no-products');
                        eventName = eventPrefix + ':modal_no_products';
                        notify();
                    }else{
                        loadProducts(selectedVideo.id,settings,function(products) {
                            setTimeout(function() {
                                checkProducts(products,el);
                                render(products,settings);
                            }, 0);
                        });
                    }
                    
                }
            }
        });
     
        // var mainEl = Utils.getById(id);
        // var playerConfig = Utils.copy(config);
        
        // playerConfig.data = config.channel.videos;

        // playerConfig.onResize = function() {
        //   Utils.sendMessage({
        //     event: eventPrefix + ':modal_resize',
        //     height: mainEl.offsetHeight + 'px'
        //   });
        // }

        // playerConfig.onNext = function(next) {
        //   Utils.sendMessage({
        //     event: eventPrefix + ':player_next',
        //     next: next || {}
        //   });
        // };

        // var player = new Player('tvp-player-el', playerConfig, config.channel.firstVideo.id);
        
        // player.initialize();

        // Utils.sendMessage({
        //   event: eventPrefix + ':widget_modal_initialized',
        //   height: (mainEl.offsetHeight + 20) + 'px'
        // });

      }else if(++depsCheck < 200){
        initSoloCTA()
      }
    },5);
  })();