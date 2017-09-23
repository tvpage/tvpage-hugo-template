(function() {

    var body = document.body;
    var id = body.getAttribute('data-id');
    var config = {};

    var initialize = function() {

        if (!Utils.hasKey(window, 'parent') || !Utils.hasKey(parent, '__TVPage__'))
            throw new Error("Can't access window parent");

        if (!Utils.hasKey(parent.__TVPage__, 'config') || !Utils.hasKey(parent.__TVPage__.config, id))
            throw new Error("Missing widget configuration");

        config = parent.__TVPage__.config[id];

        var mainEl = document.createElement('div');
        mainEl.id = id;
        mainEl.className = 'iframe-content' + (Utils.isMobile ? " mobile" : "");

        if(Utils.hasKey(config,'templates'))
            mainEl.innerHTML = config.templates.carousel;

        body.appendChild(mainEl);

        var configCopy = Utils.copy(config);
        configCopy.onClick = function(clicked, videos) {
            window.parent.postMessage({
                runTime: 'undefined' !== typeof window.__TVPage__ ? __TVPage__ : null,
                event: "tvp_" + (id || "").replace(/-/g, '_') + ":video_click",
                selectedVideo: clicked,
                videos: videos
            }, '*');
        };

        var analytics = new Analytics();

        analytics.initConfig({
            logUrl: config.api_base_url + '/__tvpa.gif',
            domain: Utils.isset(location, 'hostname') ? location.hostname : '',
            firstPartyCookies: config.firstpartycookies,
            cookieDomain: config.cookiedomain,
            loginId: config.loginid,
        });

        analytics.track('ci', {
            li: config.loginid
        });

        Carousel(id, configCopy);
    };

    var isLoadingLibs = function(){
        var not = function(obj) {
            return 'undefined' === typeof obj
        };

        return not(window.jQuery) || not(window.Carousel) || not(window.Utils) || not(window._tvpa) || not(window.Analytics);
    };

    if (isLoadingLibs()) {
        var libsLoadingCheck = 0;
        (function libsLoadingPoll() {
            setTimeout(function() {
                if (isLoadingLibs()) {
                    (++libsLoadingCheck < 200) ? libsLoadingPoll(): console.warn('limit reached');
                } else {
                    initialize();
                }
            },150);
        })();
    } else {
        initialize();
    }

}());
