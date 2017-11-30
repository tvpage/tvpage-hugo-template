(function(){
    var body = document.body;
    var id = body.getAttribute('data-id');
    var config = window.parent.__TVPage__.config[id];
    var eventPrefix = config.events.prefix;
    var mainEl;
    var productsEl;
    var analytics;

    function getWidgetHeight(){
        var height = Math.floor(mainEl.getBoundingClientRect().height);
        
        var bodyPaddingTop = Utils.getStyle(body, 'padding-top');
        if(bodyPaddingTop){
            bodyPaddingTop = parseInt(bodyPaddingTop);
        }

        var bodyPaddingBottom = Utils.getStyle(body, 'padding-bottom');
        if(bodyPaddingBottom){
            bodyPaddingBottom = parseInt(bodyPaddingBottom);
        }

        return height + bodyPaddingTop + bodyPaddingBottom;
    }

    function pkTrack(){
        analytics.track('pk',{
            vd: Utils.attr(this,'data-vd'),
            ct: this.id.split('-').pop(),
            pg: config.channelId
        });
    }

    function onLoadProducts(data) {
        render(data);
    };

    function loadProducts(vid, cback) {
        if (!vid || !cback) {
            return;
        }
        
        Utils.loadScript({
            base: config.api_base_url + '/videos/' + vid + '/products',
            params: {
                'X-login-id': config.loginId,
                o: config.products_order_by,
                od: config.products_order_direction
            }
        }, cback);
    };

    function getProductRating(product){
        var attr = config.product_rating_attribute;
        var rating = 0;
        
        if (!!product[attr]) {
          rating = Number(product[attr]);
        }

        return rating;
    };

    function getProductReview(product){
        var attr = config.product_review_attribute;
        var review = 0;
        
        if (!!product[attr]) {
          review = Number(product[attr]);
        }

        return review;
    };

    function render(data){
        var productsHtml = "";
        var popupsHtml = "";
        var dataLength = data.length;

        function piTrack(p){
            analytics.track('pi',{
                vd: p.entityIdParent,
                ct: p.id,
                pg: config.channelId
            });
        }

        for (var i = 0; i < dataLength; i++) {
            var product = data[i];
            
            product.title = Utils.trimText(product.title || '',50);
            product.price = Utils.trimPrice(product.price || '');

            var rating = getProductRating(product);
            var ratingReviewsHtml = "";

            if (rating > 0) {
              
              var hasFrac = rating % 1 != 0;
              var fulls = hasFrac ? Math.floor(rating) : rating;

              var empties = 0;
              if (4 === fulls && hasFrac) {
                empties = 0;
              } else if (1 === fulls && hasFrac) {
                empties = 3;
              } else if (hasFrac) {
                empties = (5 - fulls) - 1;
              } else {
                empties = 5 - fulls;
              }

              ratingReviewsHtml = '<ul class="tvp-product-rating">';
              
              for (var j = 0; j < fulls; j++) {
                ratingReviewsHtml += '<li class="tvp-rate full"></li>';
              }
              
              if (hasFrac) {
                ratingReviewsHtml += '<li class="tvp-rate half"></li>';
              }

              for (var k = 0; k < empties; k++) {
                ratingReviewsHtml += '<li class="tvp-rate empty"></li>';
              }


              var review = getProductReview(product);
              if (review > 0) {
                ratingReviewsHtml += '<li class="tvp-reviews">' + review + ' Reviews </li>';
              }

              ratingReviewsHtml += '</ul>';
            }

            product.ratingReviews = ratingReviewsHtml;

            var template = config.templates.modal.content;

            productsHtml += Utils.tmpl(template.product, product);
            popupsHtml += Utils.tmpl(template.popup, product);

            piTrack(product);
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

    function onPlayerResize(initial, size){
        productsEl.style.height = size[1] + 'px';

        Utils.sendMessage({
            event: eventPrefix + ':widget_modal_resize',
            height: getWidgetHeight() + 'px'
        });
    }

    function onPlayerNext(next){
        if (config.merchandise && next) {
            loadProducts(next.assetId, function(data){
                render(data);
            });
        }

        Utils.sendMessage({
            event: eventPrefix + ':player_next',
            next: next
        });
    }

    function initPlayer(){
        var playerConfig = Utils.copy(config);

        playerConfig.data = config.channel.videos;
        playerConfig.onResize = onPlayerResize;
        playerConfig.onNext = onPlayerNext;

        var player = new Player('tvp-player-el', playerConfig, config.clicked);
        
        player.initialize();
    };

    function initAnalytics(){
        analytics =  new Analytics();
        analytics.initConfig({
            domain: location.hostname || '',
            logUrl: config.api_base_url + '/__tvpa.gif',
            loginId: config.loginId,
            firstPartyCookies: config.firstpartycookies,
            cookieDomain: config.cookiedomain
        });
        analytics.track('ci', {
            li: config.loginId
        });
    };

    var deps = ['TVPage', 'Utils', 'Player', 'Analytics', 'Ps'],
        depsCheck = 0,
        depsCheckLimit = 1000;

    (function initModal() {
        setTimeout(function() {
            if(config.debug){
                console.log('deps poll...');
            }
        
        var ready = true;
        for (var i = 0; i < deps.length; i++)
            if ('undefined' === typeof window[deps[i]])
            ready = false;

        if(ready){
            mainEl = Utils.getById(id);
            
            //We set the height of the player to the products element, we also do this on player resize, we
            //want the products scroller to have the same height as the player.
            productsEl = mainEl.querySelector('.tvp-products-holder');
            productsEl.style.height = mainEl.querySelector('.tvp-player-holder').offsetHeight + 'px';

            initPlayer();
            initAnalytics();

            if (config.merchandise) {
                loadProducts(config.clicked, function(data){
                    render(data);
                });
            }

            Utils.sendMessage({
                event: eventPrefix + ':widget_modal_initialized',
                height: getWidgetHeight() + 'px'
            });

        }else if(++depsCheck < depsCheckLimit){
            initModal()
        }
        },10);
    })();

}());
