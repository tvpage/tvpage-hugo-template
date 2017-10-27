(function() {
    var body = document.body;
    var id = body.getAttribute('data-id');
    var config = {};

    var initialRender = function(){
        var el = document.createElement('div');
        el.id = id;
        el.className = 'iframe-content' + (Utils.isMobile ? " mobile" : "");
        el.innerHTML = config.templates.carousel;
        body.appendChild(el);
        
        console.log('iframe renders initial html for carousel', performance.now() - startTime);
    };

    var startCarousel = function(){
        var carouselConfig = Utils.copy(config);
        carouselConfig.onClick = function(video, videos) {
            Utils.sendMessage({
                event: "tvp_" + (id || "").replace(/-/g, '_') + ":video_click",
                video: video,
                videos: videos
            });
        };

        (new Carousel(id, carouselConfig)).initialize();
    };

    var startAnalytics = function(){
        var analytics = new Analytics();
        analytics.initConfig({
            logUrl: config.api_base_url + '/__tvpa.gif',
            domain: location.hostname || '',
            firstPartyCookies: config.firstpartycookies,
            cookieDomain: config.cookiedomain,
            loginId: config.loginid,
        });

        analytics.track('ci', {
            li: config.loginid
        });
    };

    var initialize = function() {
        config = Utils.getParentConfig(id);

        initialRender();
        startCarousel();
        startAnalytics();
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
                console.log('carouse/index.js dependencies poll...');
                if (isLoadingLibs()) {
                    (++libsLoadingCheck < 200) ? libsLoadingPoll(): console.warn('limit reached');
                } else {
                    initialize();
                }
            },5);
        })();
    } else {
        initialize();
    }

}());