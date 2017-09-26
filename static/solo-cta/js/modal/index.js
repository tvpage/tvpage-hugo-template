(function(window, document) {

    var eventPrefix = "tvp_" + (document.body.getAttribute("data-id") || "").replace(/-/g,'_'),
        channelVideosPage = 0,
        itemsPerPage,
        lastPage = false,
        isFetching = false;

    var loadData = function(settings,callback){
        var cbName = 'tvp_' + Math.floor(Math.random() * 50005);
        return jsonpCall({
            src: function(){
            var channel = settings.channel || {},
                params = channel.parameters || {},
                url = settings.api_base_url + '/channels/' + (channel.id || (settings.channelid || settings.channelId)) + '/videos?X-login-id=' + (settings.loginid || settings.loginId);

            for (var p in params) { url += '&' + p + '=' + params[p];}
            url += '&n=' + itemsPerPage + '&p=' + channelVideosPage;
            url += '&callback='+cbName;
                return url;
            }(),
            cbName: cbName
        },callback);
    };

    var jsonpCall = function(opts,callback){
        var s = document.createElement('script');
        s.src = opts.src;
        if (!callback || 'function' !== typeof callback) return;
        window[opts.cbName || 'callback'] = callback;
        var b = opts.body || document.body;
        b.appendChild(s);
    };

    var initialize = function() {
        var el = Utils.getByClass('iframe-content');

        var initPlayer = function(data) {
            var player = null,
                menu = null,
                settings = JSON.parse(JSON.stringify(data.runTime)),
                menuSettings = JSON.parse(JSON.stringify(data.runTime)),
                playlistOption = Utils.isset(data.runTime,'playlist') ? data.runTime.playlist: null;

            settings.data = data.data;
            itemsPerPage= settings.items_per_page || 6;

            settings.onResize = function() {
               Utils.sendPost(eventPrefix,':modal_resize',{
                    height: el.offsetHeight + 'px'
                });
            }

            if (playlistOption === 'show' && playlistOption) {
                settings.onPlayerReady = function(){
                    menu.init();
                };

                settings.onNext = function(){
                    var playerAsset = player.assets[player.current];
                    menu.setActiveItem(playerAsset.assetId);
                    menu.hideMenu();
                    Utils.sendPost(eventPrefix,':player_next',{
                        next: playerAsset
                    });
                };

                settings.onFullscreenChange = function(){
                    menu.hideMenu();
                };
 
                player = new Player('tvp-player-el', settings, data.selectedVideo.id);

                menuSettings.data = data.data || [];
                menu = new Menu(player,menuSettings);
                Menu.prototype.loadMore = function(){
                    if (!lastPage && !isFetching) {
                        channelVideosPage++;
                        isFetching = true;
                        loadData(settings,function(newData){
                            isFetching = false;
                            lastPage = (!newData.length || newData.length < itemsPerPage) ? true : false;
                            player.addData(newData);
                            menu.update(newData);
                        });
                    }
                };
            }else{
                settings.onNext = function(next) {
                    if (!next) return;
                    Utils.sendPost(eventPrefix,':player_next',{
                        next: next
                    });
                };

                player = new Player('tvp-player-el', settings, data.selectedVideo.id);
            }
        };

        window.addEventListener('message', function(e) {
            if (!e || !Utils.isset(e, 'data') || !Utils.isset(e.data, 'event')) return;
            
            var data = e.data;

            if (eventPrefix + ':modal_data' === data.event) {
                initPlayer(data);
            }
        });

        //Notify when the widget has been initialized.
        Utils.sendPost(eventPrefix,':modal_initialized',{
            height: (el.offsetHeight + 20) + 'px'
        });
    };

    var not = function(obj) {
        return 'undefined' === typeof obj
    };
    if (not(window.TVPage) || not(window._tvpa) || not(window.Utils) || not(window.Analytics) || not(window.Player) || not(window.Menu) || not(window.SimpleScrollbar)) {
        var libsCheck = 0;
        (function libsReady() {
            setTimeout(function() {
                if (not(window.TVPage) || not(window._tvpa) || not(window.Utils) || not(window.Analytics) || not(window.Player) || not(window.Menu) || not(window.SimpleScrollbar)) {
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

}(window, document));
