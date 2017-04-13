(function(window, document) {

    var analytics = null;
    var channelId = null;
    var hasData = false;
    var eventPrefix = "tvp_" + (document.body.getAttribute("data-id") || "").replace(/-/g,'_');

    var pkTrack = function() {
        analytics.track('pk', {
            vd: this.getAttribute('data-vd'),
            ct: this.id.split('-').pop(),
            pg: channelId
        });
    };

    var loadProducts = function(videoId, settings, fn) {
        if (!videoId) return;
        var src = settings.api_base_url + '/videos/' + videoId + '/products?X-login-id=' + settings.loginId;
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

        hasData = data && data.length ? 1 : 0;

        var notifyState = function() {
            setTimeout(function() {
                if (window.parent) {
                    window.parent.postMessage({
                        event: eventPrefix + ':modal' + (hasData ? '' : '_no') + '_products'
                    }, '*');
                }
            }, 0);
        };

        if (hasData) {
            container.classList.add('enabled');
            el.classList.remove('tvp-no-products');
            notifyState();
        } else {
            container.classList.remove('enabled');
            el.classList.add('tvp-no-products');
            notifyState();
            return;
        }

        var frag = document.createDocumentFragment();

        for (var i = 0; i < data.length; i++) {
            var product = data[i];
            var productId = product.id;
            var productVideoId = product.entityIdParent;
            var fixedPrice = '';
            var prodTitle = product.title || '';

            analytics.track('pi', {
                vd: product.entityIdParent,
                ct: productId,
                pg: channelId
            });

            //we want to remove all special character, so they don't duplicate
            //also we shorten the lenght of long titles and add 3 point at the end
            if (prodTitle || product.price) {
                prodTitle = prodTitle.length > 50 ? prodTitle.substring(0, 50) + "..." : prodTitle;
                var price = product.price.toString().replace(/[^0-9.]+/g, '');
                price = parseFloat(price).toFixed(2);
                fixedPrice = price > 0 ? ('$' + price) : '';
            }

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

        if (hasData && !container.querySelector(".tvp-products-headline")) {
            var headline = document.createElement('p');
            headline.className = "tvp-products-headline";
            headline.innerHTML = config.products_headline_text;
            container.appendChild(headline);
        } else {
            var existingHeadline = container.querySelector(".tvp-products-headline");
            existingHeadline.parentNode.removeChild(existingHeadline);
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

                data.runTime.loginid = data.runTime.loginId || data.runTime.loginid;

                if (Utils.isset(next, 'products')) {
                    render(next.products);
                } else {
                    loadProducts(
                        next.assetId,
                        data.runTime,
                        function(products) {
                            setTimeout(function() {
                                render(products,data.runTime);
                            }, 0);
                        });
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
                settings.loginId = settings.loginId || settings.loginid;

                channelId = Utils.isset(settings.channel) && Utils.isset(settings.channel.id) ? settings.channel.id : (settings.channelId || settings.channelid);

                analytics = new Analytics();
                analytics.initConfig({
                    logUrl: settings.api_base_url + '/__tvpa.gif',
                    domain: Utils.isset(location, 'hostname') ? location.hostname : '',
                    loginId: settings.loginId
                });

                var selectedVideo = data.selectedVideo;
                if (Utils.isset(selectedVideo, 'products')) {
                    render(selectedVideo.products);
                } else {
                    loadProducts(
                        selectedVideo.id,
                        settings,
                        function(products) {
                            setTimeout(function() {
                                render(products, settings);
                            }, 0);
                        });
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
