(function(window, document) {
    var analytics = null;
    var channelId = null;
    var hasData = false;
    var eventName;
    var eventPrefix = "tvp_" + (document.body.getAttribute("data-id") || "").replace(/-/g,'_');

    var pkTrack = function() {
        analytics.track('pk', {
            vd: this.getAttribute('data-vd'),
            ct: this.id.split('-').pop(),
            pg: channelId
        });
    };

    var checkProducts = function(data,el){
        if (!data || !data.length) {
            hasData = false;
            Utils.getByClass('tvp-products').classList.remove('enabled');
            el.classList.add('tvp-no-products');
            eventName = eventPrefix + ':modal_no_products';
            notify();
        }else{
            hasData = true;
            Utils.getByClass('tvp-products').classList.add('enabled');
            el.classList.remove('tvp-no-products');
            eventName = eventPrefix + ':modal_products';
            notify();
        }
    };

    var notify = function(){
        setTimeout(function(){
            if (window.parent) {
                window.parent.postMessage({event: eventName}, '*');
            }
        },0);
    };

    var loadProducts = function(videoId, settings, fn) {
        if (!videoId) return;
        var src = settings.api_base_url + '/videos/' + videoId + '/products?X-login-id=' + settings.loginId;
        var cbName = 'tvp_' + Math.floor(Math.random() * 555);
        src += '&o=' + settings.products_order_by + '&od=' + settings.products_order_direction;
        src += '&callback=' + cbName;
        var script = document.createElement('script');
        script.src = src;
        window[cbName || 'callback'] = function(data) {
            if (data && data.length && 'function' === typeof fn) {
                fn(data);
            } else {
                fn([]);
            }
        };
        document.body.appendChild(script);
    };

    var render = function(data,config) {
        var container = Utils.getByClass('tvp-products');
        var el = Utils.getByClass('iframe-content');
        
        var carousel = container.querySelector('.tvp-products-carousel');
        if (carousel) {
            carousel.parentNode.removeChild(carousel);
        }

        carousel = document.createElement("div");
        carousel.className = 'tvp-products-carousel';
        container.appendChild(carousel);

        var toRemove = container.getElementsByClassName('tvp-product');
        for (var j = 0; j < toRemove.length; j++) {
            toRemove[j].removeEventListener('click', pkTrack, false);
        }

        var productsHtml = "";
        for (var i = 0; i < data.length; i++) {
            var product = data[i];
            var productId = product.id;

            analytics.track('pi', {
                vd: product.entityIdParent,
                ct: productId,
                pg: channelId
            });

            product.title = !Utils.isEmpty(product.title) ? Utils.trimText(product.title, 50) : '';
            product.price = !Utils.isEmpty(product.price) ? Utils.trimPrice(product.price) : '';
            productsHtml += Utils.tmpl(config.templates['modal-content-mobile'].products,product);
        }

        carousel.innerHTML = productsHtml;

        if (data.length == 1) {
            container.getElementsByClassName('tvp-product')[0].style.margin = '1px';
        }

        var productsTitle = Utils.getByClass('tvp-products-text');
        productsTitle.innerHTML = "";
        if (hasData) {
            var tooltipHtml = "";
            if (config.products_info_tooltip && config.products_message.trim().length) {
              tooltipHtml = config.templates['modal'].tooltip + 
              '<span class="tvp-products-message">' + config.products_message + '</span>';
            }  
            productsTitle.innerHTML += config.products_headline_text + tooltipHtml;  
        }   

        productsTitle.onclick = function(){
            this.classList.contains('active') ? this.classList.remove('active') : this.classList.add('active');
        };     

        if (window.parent) {
            window.parent.postMessage({
                event: eventPrefix + ':modal_resize',
                height: (el.offsetHeight + parseInt(config.iframe_modal_body_padding || '0')) + 'px'
            }, '*');
        }

        var toTrack = container.getElementsByClassName('tvp-product');
        for (var j = 0; j < toTrack.length; j++) {
            toTrack[j].addEventListener('click', pkTrack, false);
        }

        //We start loading our slick dependency here, it was breaking while rendering it dynamicaly.
        var startSlick = function() {
            if (!data.length || 1 > data.length) return;
            setTimeout(function() {
                var $el = $(carousel);
                var centerMode = data.length > 1 ? true : false;
                var centerPadding = Utils.isset(config, 'mobile_modal_products_slider_center_padding') ? config.mobile_modal_products_slider_center_padding : '0px';
                var slickConfig = {
                    slidesToSlide: 1,
                    slidesToShow: 3,
                    arrows: false,
                    responsive: [
                      {
                        breakpoint: 768,
                        settings: {
                          arrows: false,
                          centerMode: centerMode,
                          centerPadding: centerPadding,
                          slidesToShow: 2
                        }
                      },
                      {
                        breakpoint: 480,
                        settings: {
                          arrows: false,
                          centerMode: centerMode,
                          centerPadding: centerPadding,
                          slidesToShow: 1
                        }
                      }
                    ]
                };

                slickConfig.centerMode = centerMode;
                slickConfig.centerPadding = centerPadding;

                if (data.length <= config.mobile_products_max_navigation_bullets && data.length > 1) {
                    var dotsHolderClass = "tvp-slider-dots-holder";
                    var dotsHolderElement = container.querySelector("." + dotsHolderClass);
                    if (dotsHolderElement) {
                        dotsHolderElement.parentNode.removeChild(dotsHolderElement);
                    }

                    dotsHolderElement = document.createElement("div");
                    dotsHolderElement.className = dotsHolderClass;
                    container.querySelector(".tvp-products-headline").appendChild(dotsHolderElement);

                    slickConfig.appendDots = dotsHolderElement;
                    slickConfig.dots = config.mobile_products_navigation_bullets;
                    slickConfig.dotsClass = "tvp-slider-dots";
                }

                $el.on('init', function() {
                    container.classList.add('enabled');
                });

                $el.on('setPosition', function() {
                    setTimeout(function() {
                        if (window.parent) {
                            window.parent.postMessage({
                                event: eventPrefix + ':modal_resize',
                                height: (el.offsetHeight + parseInt(config.iframe_modal_body_padding || '0')) + 'px'
                            }, '*');
                        }
                    }, 0);
                });
                
                $el.slick(slickConfig);

            }, 10);
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

    var initialize = function() {
        var el = Utils.getByClass('iframe-content');

        var initPlayer = function(data) {
            var s = JSON.parse(JSON.stringify(data.runTime));

            s.data = data.data;

            s.onResize = function() {
                setTimeout(function() {
                    if (window.parent && !hasData) {
                        window.parent.postMessage({
                            event: eventPrefix + ':modal_resize',
                            height: (el.offsetHeight + parseInt(data.runTime.iframe_modal_body_padding || '0')) + 'px'
                        }, '*');
                    }
                }, 300);
            }

            s.onNext = function(next) {
                if (!next) return;

                data.runTime.loginId = data.runTime.loginId || data.runTime.loginid;

                if (Utils.isset(next, 'products')) {
                    render(next.products,data.runTime);
                } else {
                    if (!data.runTime.merchandise) {
                        el.classList.add('tvp-no-products');
                        eventName = eventPrefix + ':modal_no_products';
                        notify();
                    }else{
                        loadProducts(
                            next.assetId,
                            data.runTime,
                            function(products) {
                                setTimeout(function() {
                                    checkProducts(products,el);
                                    render(products,data.runTime);
                                }, 0);
                            });
                    }
                }
                setTimeout(function() {
                    if (window.parent) {
                        window.parent.postMessage({
                            event: eventPrefix + ':player_next',
                            next: next
                        }, '*');
                    }
                }, 0);
            };

            (new Player('tvp-player-el', s, data.video.id)).initialize();
        };

        window.addEventListener('message', function(e) {
            if (!e || !Utils.isset(e, 'data') || !Utils.isset(e.data, 'event')) return;
            var data = e.data;

            if (eventPrefix + ':modal_data' === data.event) {
                initPlayer(data);

                var settings = data.runTime;
                var loginId = settings.loginId || settings.loginid;
                
                settings.loginId = loginId;

                channelId = Utils.isset(settings.channel) && Utils.isset(settings.channel.id) ? settings.channel.id : (settings.channelId || settings.channelid);
                analytics =  new Analytics();
                analytics.initConfig({
                    domain: Utils.isset(location,'hostname') ?  location.hostname : '',
                    logUrl: settings.api_base_url + '/__tvpa.gif',
                    loginId: loginId,
                    firstPartyCookies: settings.firstpartycookies,
                    cookieDomain: settings.cookiedomain
                });
                //analytics for ci was removed here

                var selectedVideo = data.video;
                if (Utils.isset(selectedVideo, 'products')) {
                    render(selectedVideo.products,settings);
                } else {
                    if (!settings.merchandise) {
                        el.classList.add('tvp-no-products');
                        eventName = eventPrefix + ':modal_no_products';
                        notify();
                    }else{
                        loadProducts(selectedVideo.id,settings,function(products) {
                            setTimeout(function() {
                                checkProducts(products,el);
                                render(products,settings);
                            }, 0);
                        });
                    }
                    
                }
            }
        });
        //Notify when the widget has been initialized.
        setTimeout(function() {
            if (window.parent) {
                window.parent.postMessage({
                    event: eventPrefix + ':modal_initialized',
                    height: (el.offsetHeight + 20) + 'px'
                }, '*');
            }
        }, 0);
    };

    var not = function(obj) {
        return 'undefined' === typeof obj
    };
    if (not(window.TVPage) || not(window._tvpa) || not(window.jQuery) || not(window.Utils) || not(window.Analytics) || not(window.Player)) {
        var libsCheck = 0;
        (function libsReady() {
            setTimeout(function() {
                if (not(window.TVPage) || not(window._tvpa) || not(window.jQuery) || not(window.Utils) || not(window.Analytics) || not(window.Player)) {
                    (++libsCheck < 200) ? libsReady(): console.warn('limit reached');
                } else {
                    initialize();
                }
            }, 150);
        })();
    } else {
        initialize();
    }

}(window, document));