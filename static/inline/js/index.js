;(function(window,document) {

    var isset = function(o,p){
        var val = o;
        if (p) val = o[p];
        return 'undefined' !== typeof val;
    };

    var jsonpCall = function(opts,callback){
        var s = document.createElement('script');
        s.src = opts.src;
        if (!callback || 'function' !== typeof callback) return;
        window[opts.cbName || 'callback'] = callback;
        var b = opts.body || document.body;
        b.appendChild(s);
    };

    var extend = function(out) {
        out = out || {};
        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i])
                continue;

            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key))
                    out[key] = arguments[i][key];
            }
        }
        return out;
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
        main.innerHTML = '<div class="tvp-content"><div class="tvp-row-titles"><div class="tvp-row-player-title"><h1 id="videoTitle"></h1></div><div class="tvp-row-featured-title"><h2>Featured Products</h2></div><div class="clear"></div></div><div class="tvp-row"><div class="tvp-content"><div class="tvp-player" id="tvpPlayerView"><div class="tvp-content"><div id="tvp-player"></div><div id="tvp-controls" class="tvp-not-active"> <span class="tvp-icon tvp-icon-play"></span> <span class="tvp-icon tvp-icon-play anim"></span></div></div></div><div class="tvp-featured" id="tvpFeaturedProduct"><h2>Featured Products</h2></div><div class="tvp-products-scroller" id="tvpProductsView"></div><div class="tvp-clear"></div></div></div><div class="tvp-videos-scroller" id="tvpVideoScroller"></div></div>';

        frag.appendChild(main);
        target.appendChild(frag);
    };

    var body = document.body;

    var initialize = function(){
        if (body.classList.contains('dynamic')) {
            (function(settings){
                var inlineSettings = JSON.parse(JSON.stringify(settings));
                var name = settings.name;
                
                render(body,{
                    id: name,
                    title: settings.title || 'Recommended Videos'
                });

                jsonpCall({
                    src: settings.domain + '/inline/options.js',
                    cbName: 'tvpcallback'
                },function(data){
                    if (!data) return;
                    var options = data.option;
                    var opts = {};

                    for (var key in options) {
                        var option = options[key];
                        opts[option.code] = option.value;
                    }

                    inlineSettings = extend(inlineSettings, opts);
                    $.when(
                        $.getScript('//a.tvpage.com/tvpa.min.js'),
                        $.getScript('https://cdnjs.tvpage.com/tvplayer/tvp-'+opts.player_version+'.min.js')
                    ).done(function (a, b) {
                        Inline(name, inlineSettings);
                    });
                });

            }(getSettings('dynamic')));
        } else {
            (function(settings){
                var inlineSettings = JSON.parse(JSON.stringify(settings));
                var name = settings.name;

                if(Utils.isMobile) {
                    document.getElementById(name).classList.add('mobile');
                }

                $.when(
                    $.getScript('//a.tvpage.com/tvpa.min.js'),
                    $.getScript('https://cdnjs.tvpage.com/tvplayer/tvp-'+inlineSettings.player_version+'.min.js')
                ).done(function (a, b) {
                    Inline(name, inlineSettings);
                });

            }(getSettings('static')));
        }
    };

    initialize();
}(window, document));