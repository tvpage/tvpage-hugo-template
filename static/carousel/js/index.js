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

        Carousel(name, carouselSettings);
    };

    var not = function(obj){return 'undefined' === typeof obj};
    if (not(window.jQuery) || not(window.Carousel) || not(window.Utils)) {
        var libsCheck = 0;
        (function libsReady() {
            setTimeout(function(){
                if (not(window.jQuery) || not(window.Carousel) || not(window.Utils)) {
                    (++libsCheck < 50) ? libsReady() : console.log('limit reached');
                } else {
                    initialize();
                }
            },150);
        })();
    } else {
        initialize();
    }

}(window, document));