(function(window, document) {

    var channelId = null;
    var eventPrefix = "tvp_" + (document.body.getAttribute("data-id") || "").replace(/-/g,'_');

    var initialize = function() {
        var el = Utils.getByClass('iframe-content');

        var initPlayer = function(data) {
            var s = JSON.parse(JSON.stringify(data.runTime));

            s.data = data.data;

            s.onResize = function() {
                setTimeout(function() {
                    if (window.parent) {
                        window.parent.postMessage({
                            event: eventPrefix + ':modal_resize',
                            height: el.offsetHeight + 'px'
                        }, '*');
                    }
                }, 0);
            }

            s.onNext = function(next) {
                if (!next) return;
                setTimeout(function() {
                    if (window.parent) {
                        window.parent.postMessage({
                            event: eventPrefix + ':player_next',
                            next: next
                        }, '*');
                    }
                }, 0);
            };

            new Player('tvp-player-el', s, data.selectedVideo.id);
        };

        window.addEventListener('message', function(e) {
            if (!e || !Utils.isset(e, 'data') || !Utils.isset(e.data, 'event')) return;
            
            var data = e.data;

            if (eventPrefix + ':modal_data' === data.event) {
                initPlayer(data);

                var settings = data.runTime;
                var loginId = settings.loginid || settings.loginId;

                channelId = Utils.isset(settings.channel) && Utils.isset(settings.channel.id) ? settings.channel.id : settings.channelId;
            }
        });

        //Notify when the widget has been initialized.
        setTimeout(function() {
            if (window.parent) {
                window.parent.postMessage({
                    event: eventPrefix + ':modal_initialized',
                    height: (el.offsetHeight + 20) + 'px'
                }, '*');
            }
        }, 0);
    };

    var not = function(obj) {
        return 'undefined' === typeof obj
    };
    if (not(window.TVPage) || not(window._tvpa) || not(window.Utils) || not(window.Analytics) || not(window.Player)) {
        var libsCheck = 0;
        (function libsReady() {
            setTimeout(function() {
                if (not(window.TVPage) || not(window._tvpa) || not(window.Utils) || not(window.Analytics) || not(window.Player)) {
                    (++libsCheck < 50) ? libsReady(): console.log('limit reached');
                } else {
                    initialize();
                }
            }, 150);
        })();
    } else {
        initialize();
    }

}(window, document));
