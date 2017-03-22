//The selfs loader, so far it takes care of the aspect ratio of the iframes,
//it can also optionaly fetch the content from a self url, it also permits
//to load the iframe scripts asynchronouse, this hides the browser spinner.
//Loader is the delegator of iframe messages.
(function(window, document) {

    if (window.DEBUG) {
        console.debug("startTime = " + performance.now());
    }

    var cssExt = !window.DEBUG ? '.css' : '.min.css',
        isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        mobilePath = isMobile  ? 'mobile/' : '',
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
        'window.DEBUG=' + (window.DEBUG || 0) + ';';

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

        self.id = spot.getAttribute('data-id');

        //http://stackoverflow.com/questions/7589853/how-is-insertadjacenthtml-so-much-faster-than-innerhtml
        spot.insertAdjacentHTML('beforebegin', '<div id="' + self.id + '-holder" class="tvp-iframe-holder">'+
        '<iframe class="tvp-iframe" src="about:blank" allowfullscreen frameborder="0" scrolling="no"></iframe></div>');

        self.holder = document.getElementById(self.id + '-holder') || null;
        self.type = spot.className.replace('tvp-', '') || '';
        self.holder.classList.add(self.type);
        self.data = {};
        self.data[self.id] = {};
        self.dataMethod = 'static';
        self.domain = spot.getAttribute('data-domain');
        self.senderId = 'tvp_' + self.type.replace(/-/g,'_');

        spot.parentNode.removeChild(spot);

        self.static = self.domain + '/' + self.type;

        self.config = {};

        if (isset(window, '__TVPage__') && isset(__TVPage__, 'config') && isset(__TVPage__.config, self.id)) {
            self.config = __TVPage__.config[self.id];
        }

        if (isset(self.config, 'channel') && isset(self.config.channel, 'id')) {
            self.dataMethod = 'dynamic';
        }

        self.initialize = function() {

            //Add target/host page css for our self
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = self.static + (!window.DEBUG ? '/' : '/dist/') + 'css/' + mobilePath + 'host' + cssExt;
            document.getElementsByTagName('head')[0].appendChild(link);

            var iframe = self.holder.querySelector('iframe');


            //Central point for cross-domain messaging between iframes, we always us the host page window.
            window.addEventListener('message', function(e) {  
                if (!e || !isset(e, 'data') || !isset(e.data, 'event')) return;
                var eventName = e.data.event;
                var data = e.data;
                
                if (self.senderId + ':render' === eventName || self.senderId + ':resize' === eventName) {
                    self.holder.style.height = e.data.height;
                }
            });

            //Because iframes are loaded first before the host page loading, we load them empties, making this load time
            //reduced as its minimum, we start then creating the content of the iframe dynamically.
            //Reference: http://www.aaronpeters.nl/blog/iframe-loading-techniques-performance?%3E
            if ('dynamic' === self.dataMethod) {

                var iframeDoc = iframe.contentWindow.document;

                iframeDoc.open().write(getIframeHtml({
                    js: function () {
                        if (window.DEBUG) {
                            return [
                                self.static + '/dist/js/scripts.js'
                            ]
                        }
                        else{
                            return [
                                self.static + '/dist/js/scripts.min.js'
                            ]
                        }
                    }(),
                    css: function () {
                        if (window.DEBUG) {
                            return [
                                self.static + '/css/styles.css'
                            ]
                        }
                        else{
                            return [
                                self.static + '/dist/css/styles.min.css'
                            ]
                        }
                    },
                    className: self.dataMethod,
                    domain: self.domain,
                    id: self.id
                }));

                iframeDoc.close();
            }

            //Handling the static iframe scenario, not much to do, just delay the src addition.
            else {
                setTimeout(function () {
                    var src = spot.href;
                    (-1 == navigator.userAgent.indexOf("MSIE")) ? iframe.src = src: iframe.location = src;
                },5);
            }
        }

        return self;
    }

    function load () {
        var spots = document.querySelectorAll('.tvp-inline');
        for (var i = 0; i < spots.length; i++) {            
            var widget  = Widget(spots[i]);
            widget.initialize();
        }
    }

    window.addEventListener('load', load);

}(window, document));