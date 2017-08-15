(function(window,document){
    var analytics,
        channelId,
        eventName,
        body = document.body;

    var eventPrefix = "tvp_" + (body.getAttribute("data-id") || "").replace(/-/g,'_');

    var pkTrack = function(){
        analytics.track('pk',{
            vd: this.getAttribute('data-vd'),
            ct: this.id.split('-').pop(),
            pg: channelId
        });
    };

    var checkProducts = function(data,el){
        if (!data || !data.length) {
            el.classList.add('tvp-no-products');
            eventName = eventPrefix + ':modal_no_products';
            notify();
        }else{
            el.classList.remove('tvp-no-products');
            eventName = eventPrefix + ':modal_products';
            notify();
        }
    };

    var notify = function(argument) {
        setTimeout(function(){
            if (window.parent) {
                window.parent.postMessage({event: eventName}, '*');
            }
        },0);
    };

    var loadProducts = function(videoId,settings,fn){
        if (!videoId) return;
        var src = settings.api_base_url + '/videos/' + videoId + '/products?X-login-id=' + settings.loginId;
        var cbName = 'tvp_' + Math.floor(Math.random() * 555);
        src += '&callback='+cbName;
        var script = document.createElement('script');
        script.src = src;
        window[cbName || 'callback'] = function(data){
            if (data && data.length && 'function' === typeof fn) {
                fn(data);
            } else {
                fn([]);
            }
        };
        body.appendChild(script);
    };

    var render = function(data, config){
        var productsHtml = "";
        var popupsHtml = "";

        for (var i = 0; i < data.length; i++) {
            var product = data[i];
            
            product.title = !Utils.isEmpty(product.title) ? Utils.trimText(product.title, 50) : '';
            product.price = !Utils.isEmpty(product.price) ? Utils.trimPrice(product.price) : '';

            var productRating = Utils.isset(product[config.product_rating_attribute]) ? product[config.product_rating_attribute] : 0;
            if (null !== productRating) {
              productRating = Number(productRating);
            }
            var getStars = function(productRating, product){
                var ratingReviewsHtml = "";
                var fulls = 0;
                var half = false;
                if (productRating % 1 != 0) {
                  half = true;
                  fulls = Math.floor(productRating);
                } else {
                  fulls = productRating;
                }

                var empties = 0;
                if (4 === fulls && half) {
                  empties = 0;
                } else if (1 === fulls && half) {
                  empties = 3;
                } else if (half) {
                  empties = (5 - fulls) - 1;
                } else {
                  empties = 5 - fulls;
                }

                ratingReviewsHtml = '<ul class="tvp-product-rating">';
                for (var j = 0; j < fulls; j++) {
                  ratingReviewsHtml += '<li class="tvp-rate full"></li>';
                }
                if (half) {
                  ratingReviewsHtml += '<li class="tvp-rate half"></li>';
                }
                for (var k = 0; k < empties; k++) {
                  ratingReviewsHtml += '<li class="tvp-rate empty"></li>';
                }

                var productReview = Utils.isset(product[config.product_review_attribute]) ? product[config.product_review_attribute] : 0;
                if (null !== productReview && productReview > 0) {
                  ratingReviewsHtml += '<li class="tvp-reviews">' + productReview + ' Reviews </li>';
                }

                ratingReviewsHtml += '</ul>';
                return ratingReviewsHtml;
            };
            var ratingReviewsHtml = "";
            if (productRating > 0) {
              ratingReviewsHtml = getStars(productRating, product);
            }

            product.ratingReviews = ratingReviewsHtml;

            productsHtml += Utils.tmpl(config.templates["modal-content"].product, product);
            popupsHtml += Utils.tmpl(config.templates["modal-content"].popup, product);

            analytics.track('pi',{
                vd: product.entityIdParent,
                ct: product.id,
                pg: channelId
            });
        }

        var holder = Utils.getByClass('tvp-products-holder');
        var productsContainer = holder.querySelector('.tvp-products');
        var popupsContainer = holder.querySelector('.tvp-popups');

        productsContainer.innerHTML = productsHtml;
        popupsContainer.innerHTML = popupsHtml;

        var willScroll = data.length > 2;
        if("undefined" !== typeof Ps){
            Ps.destroy(productsContainer);
        }

        if (willScroll) {
          Ps.initialize(productsContainer,{
            suppressScrollX: true
          });
        }

        var arrow = Utils.getByClass('tvp-arrow-indicator');
        var showPopup = function(id){
            var scrollerThumb = document.getElementById('tvp-product-'+id);
            var popup = document.getElementById('tvp-product-popup-'+id);
            
            if (!scrollerThumb && !popup) return;

            var popups = document.querySelectorAll('.tvp-product-popup.active');
            for (var i = popups.length - 1; i >= 0; i--) {
                popups[i].classList.remove('active');
            }

            scrollerThumb.classList.add('active');
            popup.classList.add('active');

            //We must first check if it's overflowing. We check the top edge first, this is an easy one.
            //easy one, if it's a negative value then it's overflowing. Otherwise if it's failing in the bottom, we rectify
            //by removing the excess from the top value.
            var bodyPaddingTop = (body.currentStyle || window.getComputedStyle(body)).paddingTop;
            var bodyPaddingBottom = (body.currentStyle || window.getComputedStyle(body)).paddingBottom;
            
            bodyPaddingTop = parseInt(bodyPaddingTop,10);
            bodyPaddingBottom = parseInt(bodyPaddingBottom,10);
            
            var scrollerThumbTop = scrollerThumb.getBoundingClientRect().top;
            var popupTop = scrollerThumbTop - bodyPaddingTop;
            var popupBottom = popupTop + popup.offsetHeight;

            var holderHeight = holder.offsetHeight;

            if (popupTop <= 10) {
                popupTop = - bodyPaddingTop;
            } else if ( popupBottom > holderHeight )  {
                popupTop = popupTop - (popupBottom - holderHeight);
                popupTop = popupTop + bodyPaddingBottom;
            }

            var activate = function(el,top){
                el.classList.add('active');
                el.style.top = top + 'px';
            };

            activate(popup, popupTop);

            var arrowTop = scrollerThumbTop;
            if (arrowTop < 0) {
                arrowTop = - (bodyPaddingBottom + 1);
            } else if ((arrowTop + arrow.offsetHeight) > holderHeight) {
                arrowTop = holderHeight - (arrow.offsetHeight - bodyPaddingBottom) - 1;
            }
            activate(arrow, arrowTop);
        };

        var clearActive = function() {
            arrow.classList.remove('active');
            var actives = ['.tvp-product.active','.tvp-product-popup.active'];
            for (var i = actives.length - 1; i >= 0; i--) {
                var activeElems = document.querySelectorAll(actives[i]);
                for (var j = 0; j < activeElems.length; j++) {
                    activeElems[j].classList.remove('active');
                }
            }
        };

        var mainContent = Utils.getByClass('iframe-content');
        mainContent.addEventListener("mouseleave", clearActive);

        var productElm = holder.querySelectorAll('.tvp-product');
        for (var i = productElm.length - 1; i >= 0; i--) {
            productElm[i].addEventListener('click', pkTrack, false);
            productElm[i].onmouseover = function(e){
                showPopup(this.id.split('-').pop());
            };
        }
        var popupEl = popupsContainer.querySelectorAll('.tvp-product-popup');
        for (var i = popupEl.length - 1; i >= 0; i--) {
            popupEl[i].addEventListener('click', pkTrack, false);
            popupEl[i].onmouseleave = function(){
                clearActive();
            };
        }

    };

    var initialize = function(){
        var el = Utils.getByClass('iframe-content');
        var products = Utils.getByClass('tvp-products-holder');
        var resizeProducts = function(height){
            products.style.height = height + 'px';
        };

        var playerEl = Utils.getByClass('tvp-player-holder');
        resizeProducts(playerEl.offsetHeight);

        var initPlayer = function(data){
            var s = JSON.parse(JSON.stringify(data.runTime));
            var player = null;

            s.data = data.data;

            s.onResize = function(initial, size){
                resizeProducts(size[1]);
                if (window.parent) {
                    window.parent.postMessage({
                        event: eventPrefix + ':modal_resize',
                        height: (el.offsetHeight + 20) + 'px'
                    }, '*');
                }
            };

            s.onNext = function(next){
                if (!next) return;

                data.runTime.loginId = data.runTime.loginId || data.runTime.loginid;

                if (Utils.isset(next,'products')) {
                    render(next.products,data.runTime);
                } else {
                  if (!data.runTime.merchandise) {
                    el.classList.add('tvp-no-products');
                    eventName = eventPrefix + ':modal_no_products';
                    notify();
                  } else {
                    loadProducts(next.assetId,data.runTime,function(products){
                      setTimeout(function(){
                        checkProducts(products,el);
                        render(products,data.runTime);
                        player.resize();
                      },0);
                    });
                  }
                }

                if (window.parent) {
                    window.parent.postMessage({
                        event: eventPrefix + ':player_next',
                        next: next
                    }, '*');
                }
            };

            player = new Player('tvp-player-el',s,data.selectedVideo.id);
            window.addEventListener('resize', Utils.debounce(function(){
                player.resize();
            },85));
        };

        window.addEventListener('message', function(e){
            if (!e || !Utils.isset(e, 'data') || !Utils.isset(e.data, 'event')) return;
            var data = e.data;

            if (eventPrefix + ':modal_data' === data.event) {

                initPlayer(data);

                var settings = data.runTime;
                settings.loginId = settings.loginId || settings.loginid;

                channelId = Utils.isset(settings.channel) && Utils.isset(settings.channel.id) ? settings.channel.id : (settings.channelId || settings.channelid);
                analytics =  new Analytics();
                analytics.initConfig({
                    logUrl: settings.api_base_url + '/__tvpa.gif',
                    domain: Utils.isset(location,'hostname') ?  location.hostname : '',
                    loginId: settings.loginId,
                    firstPartyCookies: settings.firstpartycookies,
                    cookieDomain: settings.cookiedomain
                });
                analytics.track('ci', {
                    li: settings.loginId
                });

                var selectedVideo = data.selectedVideo;
                if (Utils.isset(selectedVideo,'products')) {
                    render(selectedVideo.products,settings);
                } else {
                    if (!settings.merchandise) {
                        el.classList.add('tvp-no-products');
                        eventName = eventPrefix + ':modal_no_products';
                        notify();
                    }else{
                        loadProducts(selectedVideo.id, settings,
                            function(products){
                            setTimeout(function(){
                                checkProducts(products,el);
                                render(products,settings);
                            },0);
                        });
                    }
                }
            }
        });

        setTimeout(function(){
            if (window.parent) {
                window.parent.postMessage({
                    event: eventPrefix + ':modal_initialized',
                    height: (el.offsetHeight + 20) + 'px'
                }, '*');
            }
        },0);
    };

    var not = function(obj){return 'undefined' === typeof obj};
    if (not(window.TVPage) || not(window._tvpa) || not(window.Utils) || not(window.Analytics) || not(window.Player) || not(window.Ps)) {
        var libsCheck = 0;
        (function libsReady() {
            setTimeout(function(){
                if (not(window.TVPage) || not(window._tvpa) || not(window.Utils) || not(window.Analytics) || not(window.Player) || not(window.Ps)) {
                    (++libsCheck < 200) ? libsReady() : console.warn('limit reached');
                } else {
                    initialize();
                }
            },150);
        })();
    } else {
        initialize();
    }

}(window, document));