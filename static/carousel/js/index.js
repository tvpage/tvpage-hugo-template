;(function(window,document) {

    var isset = function(o,p){
        var val = o;
        if (p) val = o[p];
        return 'undefined' !== typeof val;
    };

    var getSettings = function(type){
        var getConfig = function(g){
            var c = {};
            if (isset(g) && isset(g,'__TVPage__') && isset(g.__TVPage__, 'config')) {
                c = g.__TVPage__.config;
            }
            return c;
        };
        var s = {};
        if ('dynamic' === type) {
            var config = getConfig(parent);
            var id = document.body.getAttribute('data-id');
            if (!isset(config, id)) return;
            s = config[id];
            s.name = id;
            s.domain = document.body.getAttribute('data-domain') || '';
        } else if ('inline' === type && type && type.length) {
            var config = getConfig(parent);
            s = config[type];
            s.name = type;
        } else if ('static' === type) {
            var config = getConfig(window);
            var id = document.body.getAttribute('data-id');
            if (!isset(config, id)) return;
            s = config[id];
            s.name = id;
        }
        return s;
    };

    var render = function(target,data){
        if (!target) return;
        var frag = document.createDocumentFragment();
        var main = document.createElement('div');
        var d = data || {};

        main.id = d.id || '';
        main.classList.add('iframe-content');
        main.innerHTML =  '<div class="tvp-carousel-title">' + (d.title || '') + '</div>'+
            '<div class="tvp-carousel-content"></div>'+
            '<div class="tvp-carousel-arrow prev"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">'+
            '<path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/><path d="M0-.5h24v24H0z" fill="none"/>'+
            '</svg></div>'+
            '<div class="tvp-carousel-arrow next"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">'+
            '<path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/>'+
            '<path d="M0-.25h24v24H0z" fill="none"/>'+
            '</svg></div>';

        frag.appendChild(main);
        target.appendChild(frag);
    };

    var body = document.body;

    var initialize = function(){

        if (body.classList.contains('dynamic')) {
            (function(settings){
                var carouselSettings = JSON.parse(JSON.stringify(settings));
                var name = settings.name;

                render(body,{
                    id: name,
                    title: settings.title_text
                });

                if (Utils.isMobile) {
                    document.getElementById(name).classList.add('mobile');
                }

                carouselSettings.onClick = function (clicked,videos) {
                    if (window.parent) {
                        window.parent.postMessage({
                            runTime: 'undefined' !== typeof window.__TVPage__ ? __TVPage__ : null,
                            event: 'tvp_carousel:video_click',
                            selectedVideo: clicked,
                            videos: videos
                        }, '*');
                    }
                };

                Carousel(name, carouselSettings);

            }(getSettings('dynamic')));
        } else {
            (function(settings){
                var carouselSettings = JSON.parse(JSON.stringify(settings));
                var name = settings.name;

                if (Utils.isMobile) {
                    document.getElementById(name).classList.add('mobile');
                }

                carouselSettings.onClick = function (clicked,videos) {
                    if (window.parent) {
                        window.parent.postMessage({
                            runTime: 'undefined' !== typeof window.__TVPage__ ? __TVPage__ : null,
                            event: 'tvp_carousel:video_click',
                            selectedVideo: clicked,
                            videos: videos
                        }, '*');
                    }
                };
                console.log(settings, carouselSettings);
                Carousel(name, carouselSettings);

            }(getSettings('static')));
        }
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