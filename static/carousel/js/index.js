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
        main.innerHTML =  '<div class="tvp-carousel-title">' + (d.title || '') +
        '</div><div class="tvp-carousel-content"></div>';
        frag.appendChild(main);
        target.appendChild(frag);
    };

    var body = document.body;

    var initialize = function(){
        if (body.classList.contains('dynamic')) {
            (function(settings){
                var name = settings.name;

                render(body,{
                    id: name,
                    title: settings.title || 'Recommended Videos'
                });

                Carousel(name, JSON.parse(JSON.stringify(settings)));

            }(getSettings('dynamic')));
        } else {
            (function(settings){

                Carousel(settings.name, JSON.parse(JSON.stringify(settings)));

            }(getSettings('static')));
        }
    };

    var not = function(obj){return 'undefined' === typeof obj};
    if (not(window.jQuery) || not(window.Carousel)) {
        var libsCheck = 0;
        (function libsReady() {
            setTimeout(function(){
                if (not(window.jQuery) || not(window.Carousel)) {
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