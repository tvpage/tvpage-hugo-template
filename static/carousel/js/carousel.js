;(function(window, document) {

    var startSlick = null,
        $carousel = null;

    var hasClass = function(obj,c) {
        if (!obj || !c) return;
        return obj.classList.contains(c);
    };

    function Carousel(el, options) {
        this.windowSize = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) <= 200 ? 'small' : 'medium';
        this.initialResize = true;
        this.itemsPerPage = Utils.isset(options.items_per_page) ? options.items_per_page : null;

        this.loginId = (options.loginId || options.loginid) || 0;
        this.channel = options.channel || {};
        this.channelId = options.channelid || null;
        this.loading = false;
        this.page = 0;

        this.el = 'string' === typeof el ? document.getElementById(el) : el;
        this.el.querySelector(".tvp-carousel-title").innerHTML = options.title_text || "Watch Videos";

        this.container = this.el.getElementsByClassName('tvp-carousel-content')[0];

        this.itemMetaData = Utils.isset(options.item_meta_data) ? options.item_meta_data : null;
        this.onClick = Utils.isset(options.onClick) && Utils.isFunction(options.onClick) ? options.onClick : null;
        this.options = options;

        var that = this;

        this.emitMessage = function(evt, message) {
          if ( window.parent ) {
            message = message || {};
            message.event = 'tvp_' + options.id.replace(/-/g,'_') + ":" + evt;
            window.parent.postMessage(message, '*');
          }
        }

        this.render = function(){
            this.container.innerHTML = '';

            if (this.options.item_play_button_show_on_hover) {
                this.container.classList.add("show-on-hover");
            }

            var all = this.data.slice(0);
            var carouselFrag = document.createDocumentFragment();

            for (var i = 0; i < all.length; i++) {
                var item = all[i];
                var rowEl = document.createElement('div');
                var className = '';
                item.title = Utils.trimText(item.title,Number(this.options.video_item_max_chars));
                if ('undefined' !== typeof item.entity) {
                    className += ' tvp-exchange';
                }

                item.mediaDuration = Utils.formatDuration(item.duration);
                item.publishedDate = Utils.formatDate(item.date_created);

                item.className = className;

                var templateScript = document.getElementById('gridItemTemplate');
                var template = options.templates["carousel-item"];
                if (templateScript) {
                    template = templateScript.innerHTML;
                }

                rowEl.innerHTML += Utils.tmpl(template, item);
                carouselFrag.appendChild(rowEl);
            }

            this.container.appendChild(carouselFrag);
            Utils.isset(options, 'background') ? this.container.style.cssText += 'background-color:'+ options.background +';' : null;

            if (this.itemMetaData) {
                this.el.classList.add("metadata");
            }

                startSlick = function () {
                $carousel = $(that.el.querySelector('.tvp-carousel-content'));

                $carousel.on('setPosition', Utils.debounce(function (event, slick) {

                    //Center the arrows using the icon as reference
                    setTimeout(function () {
                        var playButtonRect = that.el.querySelector('.tvp-video-play').getBoundingClientRect();
                        var playButtonCenter = Math.ceil(playButtonRect.top + (playButtonRect.height / 2));
                        var arrows = document.querySelectorAll(".tvp-carousel-arrow");
                        for (var i = 0; i < arrows.length; i++) {
                            var arrow = arrows[i];
                            if (i === 0) {
                                if (slick.currentSlide === 0) {
                                    arrow.classList.add('inactive');
                                } else {
                                    arrow.classList.remove('inactive');
                                }

                            } else if (i === 1) {
                                if ((Number(slick.currentSlide) + Number(options.items_to_scroll)) - (Number(options.items_to_scroll) - 1) === Number(that.itemsPerPage)) {
                                    arrow.classList.add('inactive');
                                } else {
                                    arrow.classList.remove('inactive');
                                }
                            }

                            var arrowSvg = arrow.querySelector("svg");
                            arrow.style.top = Math.floor( playButtonCenter - ( (arrowSvg.clientHeight || arrowSvg.getBoundingClientRect().height) / 2) ) + "px";
                        }
                    },10);

                    that.el.querySelector('.slick-list').style.margin = "0 -" + ( parseInt(options.item_padding_right) + 1 ) + "px";
                    
                    var navBulletsHeight = 0;
                    if (options.navigation_bullets || options.mobile_navigation_bullets) {
                        navBulletsHeight = parseInt(options.navigation_bullets_margin_bottom,10);
                    }

                    var heightOffset = 0;
                    if (Utils.isset(options.height_offset)) {
                        heightOffset = parseInt(options.height_offset,10);
                    }

                    that.emitMessage('resize', {
                      height: (that.el.offsetHeight + navBulletsHeight + heightOffset) + 'px'
                    });
                },100));

                var carouselCenterPadding = options.carousel_center_padding,
                    dotsDTop = Number(options.carousel_max_bullets) < Object.keys(all).length ? false : options.navigation_bullets,
                    dots480 = Number(options.carousel_max_bullets) < Object.keys(all).length ? false : options.navigation_bullets_480,
                    dots667 = Number(options.carousel_max_bullets) < Object.keys(all).length ? false : options.navigation_bullets_667,
                    slickConfig = {
                    slidesToShow: Number(options.items_to_show),
                    slidesToScroll: Number(options.items_to_scroll),
                    dots: dotsDTop,
                    infinite: options.infinite,
                    arrows: false,
                    responsive: [
                        {
                            breakpoint: 480,
                            settings: {
                                arrows: false,
                                slidesToShow: Number(options.items_to_show_480),
                                slidesToScroll: Number(options.items_to_scroll_480),
                                dots: dots480,
                                centerMode: options.carousel_center_mode_480,
                                centerPadding: carouselCenterPadding
                            }
                        },
                        {
                            breakpoint: 667,
                            settings:{
                                slidesToShow: Number(options.items_to_show_667),
                                slidesToScroll: Number(options.items_to_scroll_667),
                                dots: dots667,
                                arrows: false,
                                centerMode: options.carousel_center_mode_667,
                                centerPadding: carouselCenterPadding
                            }
                        }
                    ]
                };

                if (this.options.navigation_bullets_append_to) {
                    slickConfig.appendDots = this.options.navigation_bullets_append_to;
                }
                $carousel.slick(slickConfig);
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
            console.log(options)
            var src = this.options.api_base_url + '/channels/' + (channel.id || that.channelId) + '/videos?X-login-id=' + that.loginId;
            for (var p in params) { src += '&' + p + '=' + params[p];}
            var cbName = options.callbackName || 'tvp_' + Math.floor(Math.random() * 555);
            src += '&p=' + that.page + '&n=' + that.itemsPerPage + '&o=' + options.videos_order_by + '&od=' + options.videos_order_direction + '&callback='+cbName;
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

                if (Utils.isIOS) {
                   $carousel.slick('getSlick').options.tvpModalopened = true;
                   window.modalOpened = true;
                }
            } else if (hasClass(target,'tvp-carousel-arrow')) {
                if (hasClass(target,'next')) {
                    $carousel.slick('slickNext');
                } else {
                    $carousel.slick('slickPrev');
                }

            }
        };

        this.dynamicSort =function(property) {
            var sortOrder = 1;
            if(property[0] === "-") {
                sortOrder = -1;
                property = property.substr(1);
            }
            return function (a,b) {
                var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                return result * sortOrder;
            }
        };

        this.load(function(data){
          var postEvent = '';
          if (data.length) {
            that.render(data);
            postEvent = 'render';
          } else {
            postEvent = 'norender';
          }
          
          that.emitMessage(postEvent, {});
        });


        window.parent.addEventListener("message", function(e){
            if (!e || !Utils.isset(e, 'data') || !Utils.isset(e.data, 'event') || 'tvp_' + options.id.replace(/-/g,'_') + ':modal_close' !== e.data.event || !Utils.isIOS) return;
            $carousel.slick('getSlick').options.tvpModalopened = false;
            window.modalOpened = false;
        });
    }

    window.Carousel = Carousel;

}(window, document));