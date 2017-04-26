;(function(window, document) {
    var $videoSliderDesktop = null;
    var productData = [];
    var isProductsInitialized = false;
    var isFeaturedProductRendered = false;
    var analytics = null;
    var breakpoint = 769;
    var currentApproach = '';
    var loginId = null;
    var channel = null;
    var channelId = null;
    var player = null;
    var xchg = null;
    var itemsPerPage = 1000;
    var page = 0;
    var templates = {};
    var selectedVideo = null;
    var videosData = null;
    var inlineEl = null;
    var productRatingEmptyIsBordered = false;

    var renderedApproach = function () {
        if (document.body.clientWidth < breakpoint) {
            isFeaturedProductRendered = false;
            return 'mobile';
        }
        else{
            return 'desktop';
        }
    };

    var pkTrack = function(ctId){
        analytics.track('pk',{
            vd: player.assets[player.current].assetId,
            ct: ctId,
            pg: channelId
        });
    };

    var getSelectedData = function (_data, id) {
        var selected = {};
        var data = _data;
        for (var i = 0; i < data.length; i++) {
            if (data[i].id === id) {
                selected = data[i];
            }
        }
        return selected;
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

    var renderFeaturedProduct = function (product) {
        var featuredProductContainer = document.getElementById('tvpFeaturedProduct');

        var featuredProduct = document.createElement('a');        
        featuredProduct.className = 'tvp-featured-product';
        featuredProduct.href = product.linkUrl;
        featuredProduct.setAttribute('target', '_blank');
        featuredProduct.setAttribute('data-id', product.id);
        featuredProduct.innerHTML = Utils.tmpl(templates.featuredProduct, product);
        $(featuredProductContainer).children().remove();
        $(featuredProduct).appendTo(featuredProductContainer);

        isFeaturedProductRendered = true;

        $(document.getElementById('tvpProductsView'))
            .off().on('afterChange', function(event, slick, currentSlide) {
                if (currentApproach === 'desktop' && isFeaturedProductRendered) {
                    var slideItemId = $(slick.$slides[currentSlide]).find('.tvp-product-item')[0].getAttribute('data-id');
                    var selected = getSelectedData(productData, slideItemId);
                    renderFeaturedProduct(selected);
                    addProductActiveState(selected.id);
                }
            });

        var productRating = 0;
        if (Utils.isset(product.rating) && null !== product.rating) {
          productRating = Number(product.rating);
        }

        var fulls = 0;        
        var half = 0;
        if (productRating % 1 != 0) {
            fulls = Math.floor(productRating);
            half = fulls + 1;            
        } else {
            fulls = productRating;
        }
        var emptyType = productRatingEmptyIsBordered ? 'empty-border' : 'empty';
        $(inlineEl).find('.tvp-product-rating .tvp-rate').each(function(index, el) {
            if (index+1 > fulls) {
                if (half && half === index + 1) {
                    $(el).addClass('half');
                }
                else{
                    $(el).addClass(emptyType);
                }
            }
        });
    }
    
    var addProductActiveState = function (elId) {
        var $productContent = $('#productContent');
        $productContent.find('.tvp-product-item-active').removeClass('tvp-product-item-active');
        $productContent.find('.tvp-product-item[data-id="'+elId+'"]').addClass('tvp-product-item-active');
    };

    var addVideoActiveState = function (videoId) {        
        var $videosContainer = $('#tvpVideoScroller');
        $videosContainer.find('.tvp-video-item-active').removeClass('tvp-video-item-active');
        $videosContainer.find('.tvp-video-item[data-id="'+videoId+'"]').addClass('tvp-video-item-active');
    }

    var renderProducts = function (vid, lid) {
        if(isProductsInitialized) return;

        var products =  document.getElementById('tvpProductsView');
        var deInitProd = function () {
            $('#productContent').slick('unslick');
            products.innerHTML = "";
        };

        loadProducts(vid, lid, 
            function (data) {                
                if (data.length) {
                    var itemTemplate = templates.productItem;
                    var _container = $('.tvp-products-scroller');

                    deInitProd();

                    productData = data;

                    var productContent = document.createElement('div');
                    productContent.id = "productContent";
                    var productGroup = document.createElement('div');
                    productGroup.className = "tvp-product-item-group";
                    for (var i = 0; i < data.length; i++) {
                        var row = document.createElement('a');
                        row.setAttribute('data-id', data[i].id);
                        row.className = 'tvp-product-item';
                        row.innerHTML = Utils.tmpl(itemTemplate, data[i]);
                        if (currentApproach === 'mobile') {
                            row.href = data[i].linkUrl;
                            row.setAttribute('target', '_blank');
                        }
                        
                        if(renderedApproach() === 'mobile'){
                            $(row).appendTo(productContent);
                            $(productContent).appendTo(_container);
                        }
                        else{
                            $(row).appendTo(productGroup);
                            if (( ((i + 1) % 4) === 0 ) && (i !== (data.length - 1))) {
                                $(productGroup).appendTo(productContent);
                                $(productContent).appendTo(_container);
                                productGroup = document.createElement('div');
                                productGroup.className = "tvp-product-item-group";
                            }
                            else if (i === (data.length - 1)) {
                                $(productGroup).appendTo(productContent);
                                $(productContent).appendTo(_container);
                            }                            
                        }

                        analytics.track('pi',{
                            vd: data[i].entityIdParent,
                            ct: data[i].id,
                            pg: channelId
                        });
                    }

                    //product scroll nav
                    if (data.length > 4) {
                        $(templates.productsNav).appendTo(_container);
                    }

                    $(productContent).slick({
                        arrows: true,
                        prevArrow: document.querySelector('.tvp-products-prev'),
                        nextArrow: document.querySelector('.tvp-products-next'),
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        dots: true,
                        appendDots: $('.tvp-products-nav'),
                        responsive:[
                            {
                                breakpoint: 769,
                                settings: {
                                    arrows: false,
                                    centerPadding: '0px',
                                    slidesToShow: 1,
                                    slidesToScroll: 1,
                                    dots: false
                                }
                            }
                        ]
                    });

                    renderFeaturedProduct(data[0]);
                    addProductActiveState(data[0].id);

                    isProductsInitialized = true;
                }
                else{
                    deInitProd();
                }
        });
    };

    var onNext = function (e) {
        isProductsInitialized = false;
        renderProducts(e.assetId, e.loginId); 
        $(inlineEl).find('#videoTitle').html(e.assetTitle);
        addVideoActiveState(e.assetId);
    };

    function Inline(el, options) {
        currentApproach = renderedApproach();
        xchg = options.xchg || false;
        loginId = (options.loginId || options.loginid) || 0;
        channel = options.channel || {};
        channelId = options.channelid || {};
        productRatingEmptyIsBordered = Utils.isset(options.product_rating_empty_bordered) ? options.product_rating_empty_bordered : false;

        inlineEl = 'string' === typeof el ? document.getElementById(el) : el;
        var container = inlineEl.getElementsByClassName('tvp-videos-scroller')[0];

        //templates
        templates.productsNav = options.templates.product_nav;
        templates.inlineItem = options.templates.inline_item;
        templates.videosCarouselNextArrow = options.templates.inline_carousel_next_arrow;
        templates.videosCarouselPreviousArrow = options.templates.inline_carousel_previous_arrow;
        templates.featuredProduct = options.templates.featured_product;
        templates.productItem = options.templates.product;
        templates.playIcon = options.templates.play_icon;
        
        var render = function(data){            
            var all = data.slice(0);
            
            for (var i = 0; i < all.length; i++) {
                var item = all[i];
                var rowEl = document.createElement('div');
                var className = '';                
                item.title = Utils.trimText(item.title,50);
                if ('undefined' !== typeof item.entity) {
                    className += ' tvp-exchange';
                }

                item.className = className;

                rowEl.innerHTML = Utils.tmpl(templates.inlineItem, item);
                
                container.appendChild(rowEl);
            }

            //insert custom arrow icon template
            $('.tvp-videos-arrow-next').append(templates.videosCarouselNextArrow);
            $('.tvp-videos-arrow-prev').append(templates.videosCarouselPreviousArrow);
            $('.tvp-video-item-image').append(templates.playIcon);

            $videoSliderDesktop = $(inlineEl.querySelector('#tvpVideoScroller'));
            
            var videosToShow =  Utils.isset(options.videos_to_show) ? parseInt(options.videos_to_show) : 4;
            var videosToScroll =  Utils.isset(options.videos_to_scroll) ? parseInt(options.videos_to_scroll) : 4;

            $videoSliderDesktop.slick({
                arrows: options.videos_carousel_arrow_display === "none" ? false : true,
                slidesToShow: videosToShow,
                slidesToScroll: videosToScroll,
                nextArrow: '.tvp-videos-arrow-next',
                prevArrow: '.tvp-videos-arrow-prev',
                responsive:[
                    {
                        breakpoint: 769,
                        settings: {
                            arrows: false,
                            centerPadding: '0px',
                            slidesToShow: 2,
                            slidesToScroll: 2,
                            dots: true
                        }
                    }
                ]
            }).on('setPosition', function(s) {
                if (renderedApproach() !== 'mobile') {
                    var item = s.currentTarget.querySelector('.slick-current');
                    var itemPadding = parseInt($(item).css('padding'));
                    var baseHeight = item.querySelector('.tvp-video-item-image').offsetHeight;
                    var arrowHeight = parseInt(s.currentTarget.slick.$nextArrow[0].offsetHeight);

                    s.currentTarget.slick.$nextArrow[0].style.marginTop = ((baseHeight - arrowHeight) / 2) + itemPadding + "px";
                    s.currentTarget.slick.$prevArrow[0].style.marginTop = ((baseHeight - arrowHeight) / 2) + itemPadding + "px";    
                }
            });


            //init player            
            var s = options;
            s.onNext = onNext;
            selectedVideo = data[0];
            s.data = data;

            player = new Player('tvp-player', s, selectedVideo.id);
            $(inlineEl).find('#videoTitle').html(selectedVideo.title);
            addVideoActiveState(selectedVideo.id);
            
            //render products  
            renderProducts(selectedVideo.id, loginId);
            
            if (window.parent) {
                window.parent.postMessage({
                    event: 'tvp_'+ inlineEl.id.replace(/-/g,'_') +':resize',
                    height: inlineEl.offsetHeight + 'px'
                }, '*');
            }

            analytics =  new Analytics();
            analytics.initConfig({
                logUrl: '\/\/api.tvpage.com\/v1\/__tvpa.gif',
                domain: Utils.isset(location,'hostname') ?  location.hostname : '',
                loginId: loginId
            });

            window.addEventListener('resize', Utils.debounce(function(){
                if (isProductsInitialized) {
                    if(currentApproach !== renderedApproach()){
                        isProductsInitialized = false;
                        currentApproach = renderedApproach();
                    }
                }
                renderProducts(selectedVideo.id, loginId);
                if (window.parent) {
                    window.parent.postMessage({
                        event: 'tvp_'+ inlineEl.id.replace(/-/g,'_') +':resize',
                        height: inlineEl.offsetHeight + 'px'
                    }, '*');
                }
            }, 85));
        };

        var load = function(callback){
            var getChannelVideos = function(callback){
                var channel_id = Utils.isEmpty(channel) ? channelId : channel.id;
                var params = channel.parameters || {};
                var src = '//api.tvpage.com/v1/channels/' + channel_id + '/videos?X-login-id=' + loginId;
                for (var p in params) { src += '&' + p + '=' + params[p];}
                var cbName = options.callbackName || 'tvp_' + Math.floor(Math.random() * 555);
                src += '&p=' + page + '&n=' + itemsPerPage + '&callback='+cbName;
                var script = document.createElement('script');
                script.src = src;
                window[cbName || 'callback'] = callback;
                document.body.appendChild(script);
            };

            if (xchg) {
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
                                    xchgCount--;
                                }
                            }

                            videosData = data;
                            callback(data.concat(xchg));                            
                        });
                    }
                };
                xhr.send({p: 0,n: 1000,si: 1,li: 1,'X-login-id': 1});
            } else {
                getChannelVideos(function(data){                    
                    videosData = data;
                    callback(data);                    
                });
            }
        };
        
        inlineEl.onclick = function(e) {
            var target;
            
            var getTarget = function (name) {                
                var path = [];
                var currentElem = e.target;
                while (currentElem) {
                    path.push(currentElem);
                    currentElem = currentElem.parentElement;
                }
                if (path.indexOf(window) === -1 && path.indexOf(document) === -1)
                    path.push(document);
                if (path.indexOf(window) === -1)
                    path.push(window);

                for (var i = 0; i < path.length; i++) {
                    try{
                        if(Utils.hasClass(path[i], name)) {
                            target = path[i];
                            return true;
                        }
                    }
                    catch(err){
                        return false;
                    }
                }
            }

            if (getTarget('tvp-video-item')) {
                selectedVideo = getSelectedData(videosData, target.getAttribute('data-id'));
                
                player.load(selectedVideo.id);
                addVideoActiveState(selectedVideo.id);
                isProductsInitialized = false;
                renderProducts(selectedVideo.id, selectedVideo.loginId);
                $(inlineEl).find('#videoTitle').html(selectedVideo.title);                                
            }
            else if (getTarget('tvp-product-item')){
                if (renderedApproach() === 'desktop') {
                    var selected = getSelectedData(productData, target.getAttribute('data-id'));
                    renderFeaturedProduct(selected);
                    addProductActiveState(selected.id);
                }
                else{
                    pkTrack(this.querySelector('.tvp-product-item').getAttribute('data-id'));
                }
            }
            else if (getTarget('tvp-featured-product')) {
                pkTrack(this.querySelector('.tvp-featured-product').getAttribute('data-id'));
            }
        };

        load(function(data){
            render(data);
        });
    }

    window.Inline = Inline;
}(window, document));