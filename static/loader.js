//The selfs loader, so far it takes care of the aspect ratio of the iframes,
//it can also optionaly fetch the content from a self url, it also permits
//to load the iframe scripts asynchronouse, this hides the browser spinner.
//Loader is the delegator of iframe messages.
(function(window, document) {

    if (window.DEBUG) {
        console.debug("startTime = " + performance.now());
    }

    var env = window.DEBUG ? 'dev' : 'prod',
        cssExt = window.DEBUG ? '.css' : '.min.css',
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

        var css = options.css.filter(Boolean) || [];
        if (css && css.length) {
            for (var i = 0; i < css.length; i++) {
                html += 'addCSS(\'' + css[i] + '\');';
            }
        }

        html += '">';
        var content = options.html || '';
        if (content && content.length) {
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
                    '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
                    self.static + '/js/libs/analytics.js',
                    self.static + '/js/libs/player.js',
                    self.static + '/js/index.js'
                ],
                prod: [
                    '//a.tvpage.com/tvpa.min.js',
                    '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
                    self.static + '/dist/js/scripts.min.js'
                ]
            },
            "solo-cta": {
                player: {
                    dev: [
                        '//a.tvpage.com/tvpa.min.js',
                        '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
                        self.static + '/js/libs/analytics.js',
                        self.static + '/js/libs/player.js',
                        self.static + '/js/index.js'
                    ],
                    prod: [
                        '//a.tvpage.com/tvpa.min.js',
                        '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
                        self.static + '/dist/js/scripts.min.js'
                    ]
                },
                modal: {
                    dev: [
                        '//a.tvpage.com/tvpa.min.js',
                        '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
                        (isMobile ? self.static + '/js/vendor/jquery.js' : ''),
                        self.static + '/js/libs/utils.js',
                        self.static + '/js/libs/analytics.js',
                        self.static + '/js/libs/player.js',
                        self.static + '/js/' + mobilePath + 'modal/index.js'
                    ],
                    prod: [
                        '//a.tvpage.com/tvpa.min.js',
                        '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
                        (isMobile ? self.static + '/js/vendor/jquery.js' : ''),
                        self.static + '/dist/js/' + mobilePath + 'modal/scripts.min.js'
                    ]
                }
            },
            sidebar: {
                gallery: {
                    dev: [
                        self.static + '/js/libs/utils.js',
                        self.static + '/js/carousel.js',
                        self.static + '/js/index.js'
                    ],
                    prod: [
                        self.static + 'js/scripts.min.js'
                    ]
                },
                modal: {
                    dev: [
                        '//a.tvpage.com/tvpa.min.js',
                        '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
                        (isMobile ? self.static + '/js/vendor/jquery.js' : ''),
                        (isMobile ? '' : self.static + '/js/vendor/simple-scrollbar.min.js'),
                        self.static + '/js/libs/utils.js',
                        self.static + '/js/libs/analytics.js',
                        self.static + '/js/libs/player.js',
                        self.static + '/js/' + mobilePath + 'modal/index.js'
                    ],
                    prod: [
                        '//a.tvpage.com/tvpa.min.js',
                        '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
                        (isMobile ? self.static + '/js/vendor/jquery.js' : ''),
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
                        self.static + 'js/scripts.min.js'
                    ]
                },
                modal: {
                    dev: [
                        '//a.tvpage.com/tvpa.min.js',
                        '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
                        (isMobile ? self.static + '/js/vendor/jquery.js' : ''),
                        (isMobile ? '' : self.static + '/js/vendor/simple-scrollbar.min.js'),
                        self.static + '/js/libs/utils.js',
                        self.static + '/js/libs/analytics.js',
                        self.static + '/js/libs/player.js',
                        self.static + '/js/' + mobilePath + 'modal/index.js'
                    ],
                    prod: [
                        '//a.tvpage.com/tvpa.min.js',
                        '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
                        (isMobile ? self.static + '/js/vendor/jquery.js' : ''),
                        self.static + '/dist/js/' + mobilePath + 'modal/scripts.min.js'
                    ]
                }
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
            link.href = self.static + (window.DEBUG ? '/' : '/dist/') + 'css/' + mobilePath + 'host' + cssExt;
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
                        '<h4 class="tvp-modal-title">' + selectedVideo.title + '</h4></div><div class="tvp-modal-body"><div class="tvp-iframe-modal-holder"><iframe id="' + self.iframeModalId + '" src="about:blank"' +
                        'allowfullscreen frameborder="0" scrolling="no" class="tvp-iframe-modal"></iframe></div></div></div></div>';

                    modalFrag.appendChild(modal);

                    var button = modalFrag.querySelector('.tvp-modal-close');
                    var close = function() {
                        button.removeEventListener('click', close, false);
                        [modal, overlay, button].forEach(function(el) {
                            el.parentNode.removeChild(el);
                        });
                    };
                    button.addEventListener('click', close);

                    var iframeModal = modalFrag.querySelector('.tvp-iframe-modal');

                    document.body.appendChild(modalFrag);

                    var iframeModalDoc = iframeModal.contentWindow.document;

                    var html = '<div id="' + id + '" class="tvp-clearfix iframe-content">';
                    if (isMobile) {
                        html += '<div class="tvp-player"><div id="tvp-player-el"></div></div>' +
                        '<div class="tvp-products"><div class="tvp-products-carousel"></div></div>';
                    } else {
                        html += '<div class="tvp-player-holder"><div class="tvp-player"><div id="tvp-player-el"></div></div></div>';
                        if ("solo-cta" !== self.type) {
                            html += '<div class="tvp-products-holder"><div class="tvp-products"></div></div>';
                        }
                    }
                    html += '</div>';

                    iframeModalDoc.open().write(getIframeHtml({
                        domain: self.domain,
                        id: id,
                        html: html,
                        js: self.paths[self.type].modal[env].filter(Boolean),
                        css: [
                            self.static + (window.DEBUG ? '/' : '/dist/') + 'css/' + mobilePath + 'modal/styles' + cssExt,
                            (isMobile ? self.domain + '/' + self.type + '/css/vendor/slick.css' : ''),
                            (self.domain + '/' + self.type + '/css/vendor/simple-scrollbar.css')
                        ].filter(Boolean)
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

                    var send = function () {
                        var iframeModal = document.getElementById(self.iframeModalId);

                        if (!iframeModal) return;

                        var size = [];
                        if (isMobile){
                            var widthRef = document.getElementById(self.iframeModalId).parentNode.offsetWidth;
                            size =  [widthRef, Math.floor(widthRef * (9 / 16))];
                        }

                        iframeModal.contentWindow.postMessage({
                            event: self.senderId + ':modal_holder_resize',
                            size: size
                        },'*');
                    };

                    window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize',function () {
                        if (isMobile) {
                            setTimeout(send,35);
                        } else {
                            debounce(function(){ setTimeout(send,50); },150);
                        }
                    }, false);
                }

                if (self.senderId + ':modal_resized' === eventName) {
                    document.getElementById(self.iframeModalId).style.height = e.data.height;
                }

                if (self.senderId + ':player_next' === eventName) {
                    document.querySelector('.tvp-modal-title').innerHTML = e.data.next.assetTitle;
                }

                if (!isMobile){
                    var iframeModalHolder = document.querySelector('.tvp-iframe-modal-holder');
                    if (self.senderId + ':modal_no_products' === eventName) {
                        var pLabel = document.querySelector('.tvp-products-headline');
                        if(pLabel) {
                            pLabel.remove();
                        }
                        iframeModalHolder.classList.add('extended');
                    }

                    if (self.senderId + ':modal_products' === eventName) {
                        iframeModalHolder.classList.remove('extended');
                        var productsLabel = document.createElement('p');
                        productsLabel.classList.add('tvp-products-headline');
                        productsLabel.innerHTML = 'Related Products';
                        document.querySelector('.tvp-modal-header').appendChild(productsLabel);
                    }
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
                    css: [self.static + (window.DEBUG ? '/' : '/dist/') + 'css/styles' + cssExt],
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
        var spots = document.querySelectorAll('.tvp-sidebar, .tvp-carousel, .tvp-solo, .tvp-solo-cta, .tvp-solo-append');
        for (var i = 0; i < spots.length; i++) {
            var widget  = Widget(spots[i]);
            widget.initialize();
        }
    }

    window.addEventListener('load', load);

}(window, document));