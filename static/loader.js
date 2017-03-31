//The selfs loader, so far it takes care of the aspect ratio of the iframes,
//it can also optionaly fetch the content from a self url, it also permits
//to load the iframe scripts asynchronouse, this hides the browser spinner.
//Loader is the delegator of iframe messages.
(function(window, document) {
    var _startTime = performance.now();
    var debug = window.DEBUG,
        env = debug ? 'dev' : 'prod',
        isset = function(o, p) {
            var val = o;
            if (p) val = o[p];
            return 'undefined' !== typeof val;
        };

    //Dynamically creates an iframe & appends it's required CSS & JS libraries.
    var getIframeHtml = function(options) {
        var html = '<head><base target="_blank" /></head><body class="' + (options.className || '') + '" data-domain="' +
        (options.domain || '') + '" data-id="' + (options.id || '') + '" onload="' +
        'var doc = document, head = doc.getElementsByTagName(\'head\')[0],' +
        'addJS = function(s){ var sc = doc.createElement(\'script\');sc.src=s;doc.body.appendChild(sc);};' +
        'addCSS = function(h){ var l = doc.createElement(\'link\');l.type=\'text/css\';l.rel=\'stylesheet\';l.href=h;head.appendChild(l);};' +
        'window.DEBUG=' + (debug || 0) + ';';

        var js = options.js || [];
        if (js && js.length) {
            for (var i = 0; i < js.length; i++) {
                html += 'addJS(\'' + js[i] + '\');';
            }
        }

        var css = options.css || [];
        if ('function' === typeof css) {
            css = css();
        }

        css = css.filter(Boolean);
        for (var i = 0; i < css.length; i++) {
            html += 'addCSS(\'' + css[i] + '\');';
        }

        html += '">';
        var content = options.html || '';
        if ('function' === typeof content) {
            html += content();
        } else if (content.trim().length) {
            html += content;
        }

        return html;
    };

    //Widget Singleton...
    function Widget(spot) {
        var self = function() {};

        var id = spot.getAttribute('data-id');

        //http://stackoverflow.com/questions/7589853/how-is-insertadjacenthtml-so-much-faster-than-innerhtml
        var holderId = id + "-holder";
        spot.insertAdjacentHTML('beforebegin', '<style>.tvp-play-holder,[class^=tvp-]{box-sizing:border-box}.tvp-iframe-holder{display:none;height:0;position:relative;transition:height ease-out .1ms}.tvp-holder-poster,.tvp-iframe-holder>iframe{width:100%;height:100%}.tvp-holder-poster,.tvp-holder-poster-cover,.tvp-iframe-holder>iframe,.tvp-play-holder{position:absolute;top:0;left:0}.tvp-iframe-holder.solo-click{padding-top:56.25%;background-color:#000}.tvp-holder-poster{background-size:cover;background-position:center center;background-repeat:no-repeat}.tvp-holder-poster-cover{opacity:.7;width:100%;height:100%;background-image:linear-gradient(to bottom right,#fff,#fff)}.tvp-play-holder{height:65px;padding:0;bottom:0;right:0;margin:auto;cursor:pointer;width:135px}.tvp-play-text{font-family:Helvetica;font-size:19px;color:#333;margin-top:10px;text-align:center}</style><div id="' + holderId + '" class="tvp-iframe-holder"><div id="'+holderId+'-poster" class="tvp-holder-poster"></div><div class="tvp-holder-poster-cover"></div>'+
        '<div class="tvp-play-holder"><svg style="box-sizing:border-box;padding:0;margin:auto;cursor:pointer;display:block;width:65px;height:65px;background-color:#eeeeee;border:1px solid #000;border-radius:50%;" viewBox="0 0 200 200"><polygon fill="#273691" points="70, 55 70, 145 145, 100"></polygon></svg><div class="tvp-play-text">Watch Video</div></div><iframe class="tvp-iframe" src="about:blank" allowfullscreen frameborder="0" scrolling="no"></iframe></div>');
        console.debug("first render: " + (performance.now() - _startTime) );

        var config = {};
        if (isset(window, '__TVPage__') && isset(__TVPage__, 'config') && isset(__TVPage__.config, id)) {
            config = __TVPage__.config[id];
        }

        var holder = document.getElementById(holderId) || null;
        
        var channel = isset(config, "channel") ? config.channel : {};
        var jsonpScript = document.createElement('script');
        var srcUrl = '//api.tvpage.com/v1/channels/' + channel.id + '/videos?X-login-id=' + config.loginid;
        var params = isset(channel.parameters) ? channel.parameters : {};
        for (var p in params) { srcUrl += '&' + p + '=' + params[p];}
        jsonpScript.src = srcUrl + "&callback=_tvpcallback_";
        window['_tvpcallback_'] = function(data){
            if (data.length) {
                holder.querySelector("#" + holderId + "-poster").style.backgroundImage = "url("+ data[0].asset.thumbnailUrl +")";
            }
        };
        document.body.appendChild(jsonpScript);

        var type = spot.className.replace('tvp-', '') || '';
        
        holder.classList.add(type);

        var domain = spot.getAttribute('data-domain');
        var senderId = 'tvp_' + type.replace(/-/g,'_');

        spot.parentNode.removeChild(spot);

        var static = domain + '/' + type;
        var paths = {
            dev: [
                '//a.tvpage.com/tvpa.min.js',
                '//cdnjs.tvpage.com/tvplayer/tvp-1.8.6.min.js',
                static + '/js/libs/analytics.js',
                static + '/js/libs/player.js',
                static + '/js/index.js'
            ],
            prod: [
                '//a.tvpage.com/tvpa.min.js',
                '//cdnjs.tvpage.com/tvplayer/tvp-1.8.6.min.js',
                static + '/dist/js/scripts.min.js'
            ]
        }[env];

        self.initialize = function() {

            //Because iframes are loaded first before the host page loading, we load them empties, making this load time
            //reduced as its minimum, we start then creating the content of the iframe dynamically.
            //Reference: http://www.aaronpeters.nl/blog/iframe-loading-techniques-performance?%3E
            var iframeDoc = holder.querySelector('iframe').contentWindow.document;
            iframeDoc.open().write(getIframeHtml({
                js: paths,
                css: [ static + (debug ? '/' : '/dist/') + 'css/styles' + (debug ? '.css' : '.min.css') ],
                className: 'dynamic',
                domain: domain,
                id: id
            }));
            iframeDoc.close();

            window.addEventListener('resize', function() {
                window.postMessage({
                    event: senderId + ':holder_resize',
                    size: [holder.offsetWidth, holder.offsetHeight]
                }, '*');
            });
        }

        return self;
    }

    function load () {
        var spots = document.querySelectorAll('.tvp-solo-click');
        for (var i = 0; i < spots.length; i++) {
            var widget  = Widget(spots[i]);
            widget.initialize(spots);
        }
    }

    window.addEventListener('load', load);

}(window, document));