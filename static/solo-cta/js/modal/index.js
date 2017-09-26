(function(window, document) {

    var eventPrefix = "tvp_" + (document.body.getAttribute("data-id") || "").replace(/-/g,'_'),
        channelVideosPage = 0,
        itemsPerPage,
        lastPage = false,
        isFetching = false;

    var loadData = function(s,callback){
        var cbName = 'tvp_' + Math.floor(Math.random() * 50005);
        return jsonpCall({
            src: function(){
            var channel = s.channel || {},
                params = channel.parameters || {},
                url = s.api_base_url + '/channels/' + (channel.id || (s.channelid || s.channelId)) + '/videos?X-login-id=' + (s.loginid || s.loginId);

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
                s = JSON.parse(JSON.stringify(data.runTime)),
                menuSettings = JSON.parse(JSON.stringify(data.runTime)),
                playlistOption = Utils.isset(data.runTime,'playlist') ? data.runTime.playlist: null;

            s.data = data.data;
            itemsPerPage= s.items_per_page || 6;

            s.onResize = function() {
               Utils.sendPost(eventPrefix,':modal_resize',{
                    height: el.offsetHeight + 'px'
                });
            }

            if (playlistOption === 'show' && playlistOption) {
                s.onPlayerReady = function(){
                    menu.init();
                };

                s.onNext = function(){
                    var playerAsset = player.assets[player.current];
                    menu.setActiveItem(playerAsset.assetId);
                    menu.hideMenu();
                    Utils.sendPost(eventPrefix,':player_next',{
                        next: playerAsset
                    });
                };

                s.onFullscreenChange = function(){
                    menu.hideMenu();
                };
 
                player = new Player('tvp-player-el', s, data.selectedVideo.id);

                menuSettings.data = data.data || [];
                menu = new Menu(player,menuSettings);
                Menu.prototype.loadMore = function(){
                    if (!lastPage && !isFetching) {
                        channelVideosPage++;
                        isFetching = true;
                        loadData(s,function(newData){
                            isFetching = false;
                            lastPage = (!newData.length || newData.length < itemsPerPage) ? true : false;
                            player.addData(newData);
                            menu.update(newData);
                        });
                    }
                };
            }else{
                s.onNext = function(next) {
                    if (!next) return;
                    Utils.sendPost(eventPrefix,':player_next',{
                        next: next
                    });
                };

                player = new Player('tvp-player-el', s, data.selectedVideo.id);
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
