;(function(window, document) {

    var $carousel = null;

    var itemTemplate = '<div id="tvp-video-{id}" class="tvp-video{className}">' +
        '<div class="tvp-video-image" style="background-image:url({asset.thumbnailUrl})">'+
        '<svg class="tvp-video-play" viewBox="0 0 200 200" alt="Play video"><polygon points="70, 55 70, 145 145, 100"></polygon></svg>'+
        '</div><p class="tvp-video-title">{title}</p></div>';

    var isEmpty = function(obj) {
        for(var key in obj) { if (obj.hasOwnProperty(key)) return false;}
        return true;
    };

    var isFunction = function(obj) {
        return 'function' === typeof obj;
    };

    var hasClass = function(obj,c) {
        if (!obj || !c) return;
        return obj.classList.contains(c);
    };

    function Carousel(el, options) {
        this.xchg = options.xchg || false;
        this.windowSize = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) <= 200 ? 'small' : 'medium';
        this.initialResize = true;

        var isSmall = this.windowSize == 'small';
        this.itemsPerPage = isSmall ? 2 : (options.itemsPerPage || 6);
        this.itemsPerRow = isSmall ? 1 : (options.itemsPerRow || 2);
        this.loginId = (options.loginId || options.loginid) || 0;
        this.channel = options.channel || {};
        this.loading = false;
        this.isLastPage = false;
        this.page = 0;

        this.el = 'string' === typeof el ? document.getElementById(el) : el;
        this.container = this.el.getElementsByClassName('tvp-carousel-content')[0];
        this.onLoad = options.onLoad && isFunction(options.onLoad) ? options.onLoad : null;
        this.onLoadEnd = options.onLoadEnd && isFunction(options.onLoadEnd) ? options.onLoadEnd : null;

        this.render = function(){
            this.container.innerHTML = '';

            var all = this.data.slice(0);
            var carouselFrag = document.createDocumentFragment();

            for (var i = 0; i < all.length; i++) {
                var item = all[i];
                var rowEl = document.createElement('div');
                var className = '';

                if ('undefined' !== typeof item.entity) {
                    className += ' tvp-exchange';
                }

                item.className = className;

                var templateScript = document.getElementById('gridItemTemplate');
                var template = itemTemplate;
                if (templateScript) {
                    template = templateScript.innerHTML;
                }
                rowEl.innerHTML += Utils.tmpl(template, item);

                carouselFrag.appendChild(rowEl);
            }

            this.container.appendChild(carouselFrag);

            var startSlick = function () {
                setTimeout(function () {

                    $carousel = $(that.el.querySelector('.tvp-carousel-content'));
                    var slickInitialized = false;

                    $carousel.on('init', function(){
                        slickInitialized = true;
                        if (window.parent) {
                            window.parent.postMessage({
                                event: 'tvp_carousel:render',
                                height: that.el.offsetHeight + 'px'
                            }, '*');
                        }
                    });

                    $carousel.on('setPosition', Utils.debounce(function () {
                        if (window.parent && slickInitialized) {
                            window.parent.postMessage({
                                event: 'tvp_carousel:resize',
                                height: that.el.offsetHeight + 'px'
                            }, '*');
                        }
                    },50));

                    $carousel.slick({
                        slidesToShow: 3,
                        arrows: false,
                        responsive: [
                            {
                                breakpoint: 768,
                                settings: {
                                    arrows: false,
                                    centerMode: true,
                                    centerPadding: '40px',
                                    slidesToShow: 3
                                }
                            },
                            {
                                breakpoint: 480,
                                settings: {
                                    arrows: false,
                                    centerMode: true,
                                    centerPadding: '40px',
                                    slidesToShow: 1
                                }
                            }
                        ]
                    });
                },10);
            };

            if ('undefined' === typeof $.fn.slick) {
                $.ajax({
                    dataType: 'script',
                    cache: true,
                    url: document.body.getAttribute('data-domain') + '/carousel/js/vendor/slick-min.js'
                }).done(startSlick);
            } else {
                startSlick();
            }
        };

        var that = this;
        this.load = function(callback){
            that.loading = true;
            if (this.onLoad) {
                this.onLoad();
            }

            var getChannelVideos = function(callback){
                var channel = that.channel || {};
                if (isEmpty(channel) || !channel.id) return console.log('bad channel');
                var params = channel.parameters || {};
                var src = '//api.tvpage.com/v1/channels/' + channel.id + '/videos?X-login-id=' + that.loginId;
                for (var p in params) { src += '&' + p + '=' + params[p];}
                var cbName = options.callbackName || 'tvp_' + Math.floor(Math.random() * 555);
                src += '&p=' + that.page + '&n=' + that.itemsPerPage + '&callback='+cbName;
                var script = document.createElement('script');
                script.src = src;
                window[cbName || 'callback'] = callback;
                document.body.appendChild(script);
            };

            if (this.xchg) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', '//api2.tvpage.com/prod/channels?X-login-id=1', true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == XMLHttpRequest.DONE) {
                        getChannelVideos(function(data){
                            var xchg = [];

                            if (xhr.status === 200) {
                                xchg = xhr.responseText;
                                var xchgCount = xchg.length;
                                while(xchgCount > 0) {
                                    var xchgVideo = xchg[xchgCount-1];
                                    xchgVideo = $.extend(xchgVideo, xchgVideo.entity);
                                    xchgCount--;
                                }
                            }

                            if (!data.length) {
                                that.isLastPage = true;
                            }

                            that.data = data;
                            callback(data.concat(xchg));
                            that.loading = false;
                            if (that.onLoadEnd) {
                                that.onLoadEnd();
                            }
                        });
                    }
                };
                xhr.send({p: 0,n: 1000,si: 1,li: 1,'X-login-id': 1});
            } else {
                getChannelVideos(function(data){
                    if ( !data.length || (data.length < that.itemsPerPage) ) {
                        that.isLastPage = true;
                    }

                    that.data = data;
                    callback(data);
                    that.loading = false;
                    if (that.onLoadEnd) {
                        that.onLoadEnd();
                    }
                });
            }
        };

        this.next = function(){
            if (this.isLastPage) {
                this.page = 0;
                this.isLastPage = false;
            } else {
                this.page++;
            }
        };

        this.resize = function(){
            var newSize = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) <= 200 ? 'small' : 'medium';
            var notify = function(){
                if (that.initialResize) return;
                if (window.parent) {
                    window.parent.postMessage({
                        event: 'tvp_carousel:carousel_resize',
                        height: that.el.offsetHeight + 'px'
                    }, '*');
                }
            };
            if (that.windowSize !== newSize) {
                that.windowSize = newSize;
                var isSmall = newSize === 'small';
                that.itemsPerPage = isSmall ? 2 : (options.itemsPerPage || 6);
                that.itemsPerRow = isSmall ? 1 : (options.itemsPerRow || 2);
                that.page = 0;//reset page to 0 if we change the size.
                that.isLastPage = false;
                that.load(function(){
                    that.render();
                    notify();
                });
            } else {
                notify();
            }
            that.initialResize = false;
        };

        this.el.onclick = function(e) {
            var target = e.target;

            if (hasClass(target,'tvp-video')) {
                var id = target.id.split('-').pop(),
                    selected = {};

                var data = that.data;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id === id) {
                        selected = data[i];
                    }
                }

                if (window.parent) {
                    window.parent.postMessage({
                        runTime: 'undefined' !== typeof window.__TVPage__ ? __TVPage__ : null,
                        event: 'tvp_carousel:video_click',
                        selectedVideo: selected,
                        videos: data
                    }, '*');
                }
            } else if (hasClass(target,'tvp-carousel-arrow')) {

                if (hasClass(target,'next')) {
                    $carousel.slick('slickNext');
                } else {
                    $carousel.slick('slickPrev');
                }

            }
        };

        this.load(function(data){
            that.render(data);
        });

        window.addEventListener('resize', Utils.debounce(this.resize,100));
    }

    window.Carousel = Carousel;

}(window, document));