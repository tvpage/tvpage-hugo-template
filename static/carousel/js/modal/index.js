(function(){

    var body = document.body;
    var id = body.getAttribute("data-id") || "";
    var mainEl = null;
    var productsEl = null;
    var analytics = null;
    var channelId = null;
    var loginId = null;
    var eventPrefix = "tvp_" + id.replace(/-/g,'_');

    var sendMessage = function(msg){
        if (window.parent)
            window.parent.postMessage(msg, '*');
    };

    var pkTrack = function(){
        analytics.track('pk',{
            vd: this.getAttribute('data-vd'),
            ct: this.id.split('-').pop(),
            pg: channelId
        });
    };

    var checkProductsData = function(data,el){
        var status = "";
        
        if (data && data.length) {
            el.classList.remove('tvp-no-products');
            status = eventPrefix + ':modal_products';
        } else{
            el.classList.add('tvp-no-products');
            status = eventPrefix + ':modal_no_products';
        }

        sendMessage({
            event: status
        });
    };

    var loadProducts = function(videoId,settings,fn){
        if (!videoId)
            return;

        var src = settings.api_base_url + '/videos/' + videoId + '/products?X-login-id=' + loginId;
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
            
            product.title = Utils.trimText(product.title || '',50);
            product.price = Utils.trimPrice(product.price || '');

            var ratingAttrName = config.product_rating_attribute;
            var productRating = 0;
            if (!!product[ratingAttrName]) {
              productRating = Number(product[ratingAttrName]);
            }

            var ratingReviewsHtml = "";
            if (productRating > 0) {
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

    var initializePlayer = function(data){
        var playerConfig = Utils.copy(data.runTime);
        var player = null;

        playerConfig.data = data.data;

        playerConfig.onResize = function(initial, size){
            productsEl.style.height = size[1] + 'px';
            sendMessage({
                event: eventPrefix + ':modal_resize',
                height: (mainEl.offsetHeight + 20) + 'px'
            });
        };

        playerConfig.onNext = function(next){
            if (!next) return;

            data.runTime.loginId = loginId;

            if (data.runTime.merchandise) {
                loadProducts(next.assetId,data.runTime,function(products){
                    setTimeout(function(){
                        checkProductsData(products,mainEl);
                        render(products,data.runTime);
                        player.resize();
                    },0);
                });
            } else {
                mainEl.classList.add('tvp-no-products');
                sendMessage({
                    event: eventPrefix + ':modal_no_products',
                });
            }

            sendMessage({
                event: eventPrefix + ':player_next',
                next: next
            });
        };

        player = new Player('tvp-player-el', playerConfig, data.selectedVideo.id);
        player.initialize();

        window.addEventListener('resize', Utils.debounce(player.resize,85));
    };

    var initialize = function(){
        mainEl = Utils.getById(id);
        productsEl = mainEl.querySelector('.tvp-products-holder');
        
        //We set the height of the player to the products element
        productsEl.style.height = mainEl.querySelector('.tvp-player-holder').offsetHeight + 'px';

        window.addEventListener('message', function(e){
            if (!e || !Utils.isset(e, 'data') || !Utils.isset(e.data, 'event')) 
                return;
            
            var modalData = e.data;

            if (eventPrefix + ':modal_data' !== modalData.event)
                return;

            initializePlayer(modalData);
            
            var config = modalData.runTime;
            config.loginId = config.loginId || config.loginid;
            
            loginId = config.loginId;
            channelId = Utils.isset(config.channel) && Utils.isset(config.channel.id) ? config.channel.id : (config.channelId || config.channelid);

            analytics =  new Analytics();
            analytics.initConfig({
                domain: location.hostname || '',
                logUrl: config.api_base_url + '/__tvpa.gif',
                loginId: loginId,
                firstPartyCookies: config.firstpartycookies,
                cookieDomain: config.cookiedomain
            });


            analytics.track('ci', {
                li: loginId
            });

            var selectedVideo = modalData.selectedVideo;
            if (config.merchandise) {
                loadProducts(selectedVideo.id, config,
                    function(products){
                    setTimeout(function(){
                        checkProductsData(products,mainEl);
                        render(products,config);
                    },0);
                });
            } else {
                mainEl.classList.add('tvp-no-products');
                sendMessage({
                    event: eventPrefix + ':modal_no_products'
                });
            }
        });

        sendMessage({
            event: eventPrefix + ':modal_initialized',
            height: (mainEl.offsetHeight + 20) + 'px'
        });
    };

    //We need to poll/check when the dependencies had been already loaded, this is because we 
    //create the iframes asynchronously.
    var isLoadingLibs = function(){
        var libs = ['TVPage', '_tvpa', 'Utils', 'Analytics', 'Player', 'Ps'];
        for (var i = 0; i < libs.length; i++)
            if ('undefined' === typeof window[libs[i]])
                return true;
        return false;
    };
    
    if (isLoadingLibs()) {
        var libsLoadingCheck = 0;
        (function libsLoadingPoll() {
            setTimeout(function(){
                if (isLoadingLibs()) {
                    (++libsLoadingCheck < 200) ? libsLoadingPoll() : console.warn('limit reached');
                } else {
                    initialize();
                }
            },150);
        })();
    } else {
        initialize();
    }

}());