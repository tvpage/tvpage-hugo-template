;(function(window, document) {

    var $carousel = null;

    var itemTemplate = '<div data-id="{id}" class="tvp-video{className}">' +
        '<div class="tvp-video-image" style="background-image:url({asset.thumbnailUrl})">' +
        '<svg class="tvp-video-play" viewBox="0 0 200 200" alt="Play video"><polygon points="70, 55 70, 145 145, 100"></polygon></svg>' +
        '<div class="tvp-video-image-overlay"></div></div>' +
        '<div class="tvp-video-metadata tvp-clearfix"><div>Length: {mediaDuration}</div><div>Published: {publishedDate}</div></div>' +
        '<p class="tvp-video-title">{title}</p></div>'

    var hasClass = function(obj,c) {
        if (!obj || !c) return;
        return obj.classList.contains(c);
    };

    function Carousel(el, options) {
        this.windowSize = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) <= 200 ? 'small' : 'medium';
        this.initialResize = true;
        this.itemsPerPage = 1000;
        this.loginId = (options.loginId || options.loginid) || 0;
        this.channel = options.channel || {};
        this.channelId = options.channelId || null;
        this.loading = false;
        this.page = 0;

        this.el = 'string' === typeof el ? document.getElementById(el) : el;
        this.container = this.el.getElementsByClassName('tvp-carousel-content')[0];

        this.itemMetaData = Utils.isset(options.item_meta_data) ? options.item_meta_data : null;
        this.onClick = Utils.isset(options.onClick) && Utils.isFunction(options.onClick) ? options.onClick : null;

        var that = this;

        this.render = function(){
            this.container.innerHTML = '';

            var all = this.data.slice(0);
            var carouselFrag = document.createDocumentFragment();

            for (var i = 0; i < all.length; i++) {
                var item = all[i];
                var rowEl = document.createElement('div');
                var className = '';

                item.title = Utils.trimText(item.title,50);
                if ('undefined' !== typeof item.entity) {
                    className += ' tvp-exchange';
                }

                item.mediaDuration = Utils.formatDuration(item.duration);
                item.publishedDate = Utils.formatDate(item.date_created);

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

            if (this.itemMetaData) {
                this.el.classList.add("metadata");
            }

            var startSlick = function () {
                $carousel = $(that.el.querySelector('.tvp-carousel-content'));

                $carousel.on('setPosition', Utils.debounce(function () {

                    //Center the arrows using the icon as reference
                    setTimeout(function () {
                        var playButtonRect = that.el.querySelector('.tvp-video-play').getBoundingClientRect();
                        var playButtonCenter = Math.ceil(playButtonRect.top + (playButtonRect.height / 2));
                        var arrows = document.querySelectorAll(".tvp-carousel-arrow");
                        for (var i = 0; i < arrows.length; i++) {
                            var arrow = arrows[i];
                            var arrowSvg = arrow.querySelector("svg");
                            arrow.style.top = Math.floor( playButtonCenter - ( (arrowSvg.clientHeight || arrowSvg.getBoundingClientRect().height) / 2) ) + "px";
                        }
                    },10);

                    that.el.querySelector('.slick-list').style.margin = "0 -" + ( parseInt(options.item_padding_right) + 1 ) + "px";
                    
                    if (window.parent) {
                        window.parent.postMessage({
                            event: 'tvp_' + options.id.replace(/-/g,'_') + ':resize',
                            height: that.el.offsetHeight + 'px'
                        }, '*');
                    }
                },100));

                $carousel.slick({
                    slidesToShow: options.items_to_show,
                    arrows: false,
                    responsive: [
                        {
                            breakpoint: 480,
                            settings: {
                                arrows: false,
                                slidesToShow: 1
                            }
                        }
                    ]
                });
            };

            if ('undefined' === typeof $.fn.slick) {
                $.ajax({
                    dataType: 'script',
                    cache: true,
                    url: document.body.getAttribute('data-domain') + '/carousel/js/vendor/slick-min.js'
                }).done(function () {
                    setTimeout(startSlick,100);
                });
            } else {
                setTimeout(startSlick,100);
            }
        };

        this.load = function(callback){
            that.loading = true;
            if (this.onLoad) {
                this.onLoad();
            }

            var channel = that.channel || {};
            var params = channel.parameters || {};
            var src = '//api.tvpage.com/v1/channels/' + (channel.id || that.channelId) + '/videos?X-login-id=' + that.loginId;
            for (var p in params) { src += '&' + p + '=' + params[p];}
            var cbName = options.callbackName || 'tvp_' + Math.floor(Math.random() * 555);
            src += '&p=' + that.page + '&n=' + that.itemsPerPage + '&callback='+cbName;
            var script = document.createElement('script');
            script.src = src;
            window[cbName || 'callback'] = function(data){
                that.data = data;
                callback(data);
                that.loading = false;
                if (that.onLoadEnd) {
                    that.onLoadEnd();
                }
            };
            document.body.appendChild(script);
        };

        this.el.onclick = function(e) {
            var target = e.target;

            if (hasClass(target,'tvp-video')) {
                var id = target.getAttribute('data-id'),
                    selected = {};
                var data = that.data;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id === id) {
                        selected = data[i];
                    }
                }

                if (that.onClick) {
                    that.onClick(selected,data);
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
            if (data.length) {
                that.render(data);
            }
        });
    }

    window.Carousel = Carousel;

}(window, document));