;(function(window,document) {

var initialize = function(){
    var settings = {};
    var body = document.body;

    if (Utils.isset(parent) && Utils.isset(parent,'__TVPage__') && Utils.isset(parent.__TVPage__, 'config')) {
        settings = parent.__TVPage__.config[body.getAttribute('data-id')];
    }

    var carouselSettings = JSON.parse(JSON.stringify(settings));
    var name = carouselSettings.name;
    var main = document.createElement('div');

    main.id = name;
    main.className = 'iframe-content' + (Utils.isMobile ? " mobile" : "");
    main.innerHTML = carouselSettings.templates.carousel;
    body.appendChild(main);

    carouselSettings.onClick = function (clicked,videos) {
        window.parent.postMessage({
            runTime: 'undefined' !== typeof window.__TVPage__ ? __TVPage__ : null,
            event: "tvp_" + (carouselSettings.id || "").replace(/-/g,'_') + ":video_click",
            selectedVideo: clicked,
            videos: videos
        }, '*');
    };

    var analytics = new Analytics();
    analytics.initConfig({
        logUrl: settings.api_base_url + '/__tvpa.gif',
        domain: Utils.isset(location, 'hostname') ? location.hostname : '',
        firstPartyCookies: settings.firstpartycookies,
        cookieDomain: settings.cookiedomain,
        loginId: settings.loginid,
    });
    analytics.track('ci', {li: settings.loginid});

    Carousel(name, carouselSettings);
};

var not = function(obj){return 'undefined' === typeof obj};
if (not(window.jQuery) || not(window.Carousel) || not(window.Utils) || not(window._tvpa) || not(window.Analytics)) {
    var libsCheck = 0;
    (function libsReady() {
        setTimeout(function(){
            if (not(window.jQuery) || not(window.Carousel) || not(window.Utils) || not(window._tvpa) || not(window.Analytics)) {
                (++libsCheck < 50) ? libsReady() : console.warn('limit reached');
            } else {
                initialize();
            }
        },150);
    })();
} else {
    initialize();
}

}(window, document));