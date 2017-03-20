//The selfs loader, so far it takes care of the aspect ratio of the iframes,
//it can also optionaly fetch the content from a self url, it also permits
//to load the iframe scripts asynchronouse, this hides the browser spinner.
//Loader is the delegator of iframe messages.
(function(window, document) {

    if (window.DEBUG) {
        console.debug("startTime = " + performance.now());
    }

    var env = window.DEBUG ? 'dev' : 'prod',
        playerLib = '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
        cssExt = !window.DEBUG ? '.css' : '.min.css',
        isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        mobilePath = isMobile  ? 'mobile/' : '',
        isset = function(o, p) {
            var val = o;
            if (p) val = o[p];
            return 'undefined' !== typeof val;
        },
        debounce = function(func, wait, immediate) {
            var timeout = null;
            return function() {
                var context = this,
                    args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
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
        self.paths = {
            solo: {
                dev: [
                    '//a.tvpage.com/tvpa.min.js',
                    playerLib,
                    self.static + '/js/libs/analytics.js',
                    self.static + '/js/libs/player.js',
                    self.static + '/js/index.js'
                ],
                prod: [
                    '//a.tvpage.com/tvpa.min.js',
                    playerLib,
                    self.static + '/dist/js/scripts.min.js'
                ]
            },
            "solo-cta": {
                player: {
                    dev: [
                        '//a.tvpage.com/tvpa.min.js',
                        playerLib,
                        self.static + '/js/libs/analytics.js',
                        self.static + '/js/libs/player.js',
                        self.static + '/js/index.js'
                    ],
                    prod: [
                        '//a.tvpage.com/tvpa.min.js',
                        playerLib,
                        self.static + '/dist/js/scripts.min.js'
                    ]
                },
                modal: {
                    dev: [
                        '//a.tvpage.com/tvpa.min.js',
                        playerLib,
                        (isMobile ? self.static + '/js/vendor/jquery.js' : ''),
                        self.static + '/js/libs/utils.js',
                        self.static + '/js/libs/analytics.js',
                        self.static + '/js/libs/player.js',
                        self.static + '/js/' + mobilePath + 'modal/index.js'
                    ],
                    prod: [
                        '//a.tvpage.com/tvpa.min.js',
                        playerLib,
                        (isMobile ? self.static + '/js/vendor/jquery.js' : ''),
                        self.static + '/dist/js/' + mobilePath + 'modal/scripts.min.js'
                    ]
                }
            },
            sidebar: {
                gallery: {
                    dev: [
                        self.static + '/js/libs/utils.js',
                        self.static + '/js/grid.js',
                        self.static + '/js/index.js'
                    ],
                    prod: [
                        self.static + '/dist/js/scripts.min.js'
                    ]
                },
                modal: {
                    dev: [
                        '//a.tvpage.com/tvpa.min.js',
                        playerLib,
                        (isMobile ? self.static + '/js/vendor/jquery.js' : ''),
                        (isMobile ? '' : self.static + '/js/vendor/simple-scrollbar.min.js'),
                        self.static + '/js/libs/utils.js',
                        self.static + '/js/libs/analytics.js',
                        self.static + '/js/libs/player.js',
                        self.static + '/js/' + mobilePath + 'modal/index.js'
                    ],
                    prod: [
                        '//a.tvpage.com/tvpa.min.js',
                        playerLib,
                        self.static + '/dist/js/' + mobilePath + 'modal/scripts.min.js'
                    ]
                }
            },
            carousel: {
                gallery: {
                    dev: [
                        self.static + '/js/vendor/jquery.js',
                        self.static + '/js/libs/utils.js',
                        self.static + '/js/carousel.js',
                        self.static + '/js/index.js'
                    ],
                    prod: [
                        self.static + '/dist/js/scripts.min.js'
                    ]
                },
                modal: {
                    dev: [
                        '//a.tvpage.com/tvpa.min.js',
                        playerLib,
                        (isMobile ? self.static + '/js/vendor/jquery.js' : ''),
                        (isMobile ? '' : self.static + '/js/vendor/simple-scrollbar.min.js'),
                        self.static + '/js/libs/utils.js',
                        self.static + '/js/libs/analytics.js',
                        self.static + '/js/libs/player.js',
                        self.static + '/js/' + mobilePath + 'modal/index.js'
                    ],
                    prod: [
                        '//a.tvpage.com/tvpa.min.js',
                        playerLib,
                        self.static + '/dist/js/' + mobilePath + 'modal/scripts.min.js'
                    ]
                }
            },
            inline : {
                dev: [
                    '//a.tvpage.com/tvpa.min.js',
                    playerLib,
                    self.static + '/js/vendor/jquery.js',
                    self.static + '/js/libs/analytics.js',
                    self.static + '/js/vendor/slick-min.js',
                    self.static + '/js/vendor/simple-scrollbar.min.js',
                    self.static + '/js/libs/utils.js',
                    self.static + '/js/libs/player.js',
                    self.static + '/js/index.js',
                    self.static + '/js/inline.js'                    
                ],
                prod: [
                    '//a.tvpage.com/tvpa.min.js',
                    playerLib,
                    self.static + '/dist/js/scripts.min.js'
                ]
            }
        };

        self.paths['solo-click'] = self.paths.solo;
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

            window.addEventListener('resize', debounce(function() {
                window.postMessage({
                    event: self.senderId + ':holder_resize',
                    size: [self.holder.offsetWidth, self.holder.offsetHeight]
                }, '*');
            }, 50));

            //Central point for cross-domain messaging between iframes, we always us the host page window.
            window.addEventListener('message', function(e) {  
                if (!e || !isset(e, 'data') || !isset(e.data, 'event')) return;
                var eventName = e.data.event;
                var data = e.data;
                var id = self.id;

                self.iframeModalId = 'tvp-iframe-modal-' + id;

                if (self.senderId + ':render' === eventName || self.senderId + ':resize' === eventName) {
                    self.holder.style.height = e.data.height;
                }
                
                if (self.senderId + ':video_click' === eventName) {
                    var runTime = (data.runTime || (isset(window, '__TVPage__') ? __TVPage__ : {}) ).config[id];
                    var selectedVideo = data.selectedVideo || {};

                    self.data[id] = self[id] || {};
                    self[id] = {
                        data: data.videos || [],
                        selectedVideo: selectedVideo,
                        runTime: runTime
                    };

                    var modalFrag = document.createDocumentFragment();
                    var overlay = document.createElement('div');
                    overlay.classList.add('tvp-modal-overlay');
                    modalFrag.appendChild(overlay);
                    var modal = document.createElement('div');
                    modal.classList.add('tvp-modal');
                    modal.innerHTML = '<div class="tvp-modal-wrapper"><div class="tvp-modal-content"><div class="tvp-modal-header">' +
                        '<svg class="tvp-modal-close" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
                        '<path fill="#ffffff" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>' +
                        '<h4 class="tvp-modal-title">' + selectedVideo.title + '</h4></div><div class="tvp-modal-body"><div class="tvp-modal-iframe-holder"><iframe id="' + self.iframeModalId + '" src="about:blank"' +
                        'allowfullscreen frameborder="0" scrolling="no" class="tvp-iframe-modal"></iframe></div></div></div></div>';

                    modalFrag.appendChild(modal);

                    var button = modalFrag.querySelector('.tvp-modal-close');
                    var close = function() {
                        document.body.classList.remove('tvp-modal-open');
                        button.removeEventListener('click', close, false);
                        [modal, overlay, button].forEach(function(el) {
                            el.parentNode.removeChild(el);
                        });
                    };
                    button.addEventListener('click', close);

                    var iframeModal = modalFrag.querySelector('.tvp-iframe-modal');

                    var body = document.body;

                    body.classList.add('tvp-modal-open');
                    body.appendChild(modalFrag);

                    var iframeModalDoc = iframeModal.contentWindow.document;

                    iframeModalDoc.open().write(getIframeHtml({
                        domain: self.domain,
                        id: id,
                        html: function () {
                            var html = '<div id="' + id + '" class="tvp-clearfix iframe-content">';

                            if (isMobile) {
                                html += '<div class="tvp-player"><div id="tvp-player-el"></div></div><div class="tvp-products"><div class="tvp-products-carousel"></div></div>';
                            } else {
                                html += '<div class="tvp-player-holder"><div class="tvp-player"><div id="tvp-player-el"></div></div></div>';

                                if ("solo-cta" !== self.type) {
                                    html += '<div class="tvp-products-holder"><div class="tvp-products"></div></div>';
                                }
                            }

                            return (html + '</div>');
                        },
                        js: self.paths[self.type].modal[env].filter(Boolean),
                        css: function () {
                            var files = [self.static + (window.DEBUG ? '/' : '/dist/') + 'css/' + mobilePath + 'modal/styles' + cssExt];
                            if (window.DEBUG) {
                                if (isMobile) {
                                    files.push(self.static + '/css/vendor/slick.css');
                                } else {
                                    files.push(self.static + '/css/vendor/simple-scrollbar.css');
                                }
                            }
                            return files;
                        }
                    }));
                    iframeModalDoc.close();
                }

                if (self.senderId + ':modal_initialized' === eventName) {
                    var widgetData = self[id];
                    var iframeModal = document.getElementById(self.iframeModalId);

                    if (iframeModal.contentWindow) {
                        iframeModal.contentWindow.postMessage({
                            event: self.senderId + ':modal_data',
                            data: widgetData.data,
                            selectedVideo: widgetData.selectedVideo,
                            runTime: widgetData.runTime
                        }, '*');
                    }

                    if (/iPad|iPhone|iPod|iPhone Simulator|iPad Simulator/.test(navigator.userAgent) && !window.MSStream) {
                        var onOrientationChange = debounce(function () {
                            var iframeModal = document.getElementById(self.iframeModalId);
                            if (iframeModal && iframeModal.contentWindow) {
                                var widthRef = iframeModal.parentNode.offsetWidth;
                                iframeModal.contentWindow.window.postMessage({
                                    event: self.senderId + ':modal_holder_resize',
                                    size: [widthRef, Math.floor(widthRef * (9 / 16))]
                                },'*');
                            }
                        },30);
                        var orientationChangeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize';
                        window.removeEventListener(orientationChangeEvent,onOrientationChange, false);
                        window.addEventListener(orientationChangeEvent,onOrientationChange, false);
                    }
                }

                if (self.senderId + ':modal_resized' === eventName) {
                    document.getElementById(self.iframeModalId).style.height = e.data.height;
                }

                if (self.senderId + ':player_next' === eventName) {
                    document.querySelector('.tvp-modal-title').innerHTML = e.data.next.assetTitle;
                }

                var iframeModalHolder = document.querySelector('.tvp-modal-iframe-holder');

                if (self.senderId + ':modal_no_products' === eventName) {
                    if (!isMobile) {
                        var pLabel = document.querySelector('.tvp-products-headline');
                        if (pLabel) {
                            pLabel.remove();
                        }
                    }

                    iframeModalHolder.classList.remove('products');
                    iframeModalHolder.classList.add('no-products');
                }

                if (self.senderId + ':modal_products' === eventName) {
                    if (!isMobile) {
                        var productsLabel = document.createElement('p');
                        productsLabel.classList.add('tvp-products-headline');
                        productsLabel.innerHTML = 'Related Products';
                        document.querySelector('.tvp-modal-header').appendChild(productsLabel);
                    }
                    iframeModalHolder.classList.remove('no-products');
                    iframeModalHolder.classList.add('products');
                }
            });

            //Because iframes are loaded first before the host page loading, we load them empties, making this load time
            //reduced as its minimum, we start then creating the content of the iframe dynamically.
            //Reference: http://www.aaronpeters.nl/blog/iframe-loading-techniques-performance?%3E
            if ('dynamic' === self.dataMethod) {

                var iframeDoc = iframe.contentWindow.document;

                iframeDoc.open().write(getIframeHtml({
                    js: function () {                        
                        var jsFiles = self.paths[self.type];
                        if ('sidebar' === self.type || 'carousel' === self.type) {
                            jsFiles = jsFiles.gallery;
                        } else if ('solo-cta' === self.type) {
                            jsFiles = jsFiles.player;
                        }                        
                        return jsFiles[env];
                    }(),
                    css: function () {
                        var cssFiles = [self.static + (!window.DEBUG ? '/' : '/dist/') + 'css/styles' + cssExt]
                        if ('carousel' === self.type && window.DEBUG) {
                            cssFiles = cssFiles.concat([self.static + '/css/vendor/slick.css']);
                        }
                        return cssFiles;
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
        var spots = document.querySelectorAll('.tvp-sidebar, .tvp-carousel, .tvp-solo, .tvp-solo-cta, .tvp-solo-append, .tvp-inline');
        for (var i = 0; i < spots.length; i++) {            
            var widget  = Widget(spots[i]);
            widget.initialize();
        }
    }

    window.addEventListener('load', load);

}(window, document));