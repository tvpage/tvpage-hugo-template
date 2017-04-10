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

    var loadProducts = function(videoId, loginId, fn) {
        if (!videoId) return;
        var src = '//api.tvpage.com/v1/videos/' + videoId + '/products?X-login-id=' + loginId;
        var cbName = 'tvp_' + Math.floor(Math.random() * 555);
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
        var frag = document.createDocumentFragment();

        for (var i = 0; i < data.length; i++) {
            var product = data[i];
            var productId = product.id;
            var productVideoId = product.entityIdParent;

            analytics.track('pi', {
                vd: product.entityIdParent,
                ct: productId,
                pg: channelId
            });

            var prodTitle = product.title || '';
            //shorten the lenght of long titles, we need to set a character limit
            prodTitle = Utils.trimText(prodTitle, 50);

            var fixedPrice = product.price || '';
            //remove all special character, so they don't duplicate
            fixedPrice = Utils.trimPrice(fixedPrice);

            var prodNode = document.createElement('div');
            var buttonText = product.actionText.trim().length > 0 ? product.actionText : 'View Details';
            prodNode.innerHTML = '<a id="tvp-product-' + productId + '" class="tvp-product" data-vd="' + productVideoId + '" href="' +
                product.linkUrl + '"><div class="tvp-product-image" style="background-image:url(' + product.imageUrl + ')"></div>' +
                '<div class="tvp-product-data"><p>' + prodTitle + '</p><h2>' + fixedPrice + '</h2><button class="tvp-product-cta">'+buttonText+'</button></div></a>';
            frag.appendChild(prodNode);
        }

        //Remove click listener before cleaning up.
        var toRemove = container.getElementsByClassName('tvp-product');
        for (var j = 0; j < toRemove.length; j++) {
            toRemove[j].removeEventListener('click', pkTrack, false);
        }

        container.innerHTML = '';

        if (hasData) {
            var productsLabel = document.createElement('p');
            productsLabel.classList.add('tvp-products-headline');
            productsLabel.innerHTML = config.products_headline_text;
            container.appendChild(productsLabel);
        }

        var carousel = document.createElement('div');
        carousel.classList.add('tvp-products-carousel');
        carousel.appendChild(frag);

        container.appendChild(carousel);

        var toTrack = container.getElementsByClassName('tvp-product');
        for (var j = 0; j < toTrack.length; j++) {
            toTrack[j].addEventListener('click', pkTrack, false);
        }

        //We start loading our slick dependency here, it was breaking while rendering it dynamicaly.
        var startSlick = function() {
            setTimeout(function() {
                var $el = $(carousel);
                var config = {
                    slidesToSlide: 1,
                    slidesToShow: 1,
                    arrows: false
                };

                if (data.length > 1) {
                    config.centerMode = true;
                    config.centerPadding = '25px';
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

                $el.slick(config);
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
                }, 0);
            }

            s.onNext = function(next) {
                if (!next) return;

                if (Utils.isset(next, 'products')) {
                    render(next.products,data.runTime);
                } else {
                    if (!data.runTime.merchandise) {
                        el.classList.add('tvp-no-products');
                        eventName = eventPrefix + ':modal_no_products';
                        notify();
                    }else{
                        loadProducts(next.assetId,data.runTime.loginid || data.runTime.loginId,function(products) {
                            setTimeout(function() {
                                render(products,data.runTime);
                                checkProducts(products,el);
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

            new Player('tvp-player-el', s, data.selectedVideo.id);
        };

        window.addEventListener('message', function(e) {
            if (!e || !Utils.isset(e, 'data') || !Utils.isset(e.data, 'event')) return;
            var data = e.data;

            if (eventPrefix + ':modal_data' === data.event) {
                initPlayer(data);

                var settings = data.runTime;
                var loginId = settings.loginid || settings.loginId;

                channelId = Utils.isset(settings.channel) && Utils.isset(settings.channel.id) ? settings.channel.id : settings.channelId;

                analytics = new Analytics();
                analytics.initConfig({
                    logUrl: '//api.tvpage.com/v1/__tvpa.gif',
                    domain: Utils.isset(location, 'hostname') ? location.hostname : '',
                    loginId: loginId
                });

                var selectedVideo = data.selectedVideo;
                if (Utils.isset(selectedVideo, 'products')) {
                    render(selectedVideo.products,settings);
                } else {
                    if (!settings.merchandise) {
                        el.classList.add('tvp-no-products');
                        eventName = eventPrefix + ':modal_no_products';
                        notify();
                    }else{
                        loadProducts(selectedVideo.id,loginId,function(products) {
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
                    (++libsCheck < 50) ? libsReady(): console.log('limit reached');
                } else {
                    initialize();
                }
            }, 150);
        })();
    } else {
        initialize();
    }

}(window, document));
