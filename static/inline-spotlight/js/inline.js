;(function(window, document) {
    var $videoSliderDesktop = null;
    var productData = [];
    var isProductsInitialized = false;
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
    var hasProducts = true;

    var renderedApproach = function () {
        if (document.body.clientWidth < breakpoint) {
            return 'mobile';
        }
        else{
            return 'desktop';
        }
    };

    var resizeParent = function () {
        if (window.parent) {
            window.parent.postMessage({
                event: 'tvp_'+ inlineEl.id.replace(/-/g,'_') +':resize',
                height: inlineEl.offsetHeight + 'px'
            }, '*');
        }
    }

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

        var productRating = 0;
        if (Utils.isset(product.rating) && null !== product.rating) {
          productRating = Number(product.rating);
        }

        if (productRating || productRating > 0) {
            var ratingsTmpl = Utils.tmpl(templates.ratingsHtml, product);
            $(featuredProduct).find('.tvp-featured-info-price').after(ratingsTmpl);
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

        $('.tvp-featured-info-title').ellipsis({
            row: 2
        });  
    }
    
    var addProductActiveState = function (elId) {
        var $productContent = $('#productContent');
        $productContent.find('.tvp-product-item-active').removeClass('tvp-product-item-active');
        if (elId) {
            $productContent.find('.tvp-product-item[data-id="'+elId+'"]').addClass('tvp-product-item-active');
        }
    };

    var addVideoActiveState = function (videoId) {        
        var $videosContainer = $('#tvpVideoScroller');
        $videosContainer.find('.tvp-video-item-active').removeClass('tvp-video-item-active');
        $videosContainer.find('.tvp-video-item[data-id="'+videoId+'"]').addClass('tvp-video-item-active');
    };

    var checkProducts = function(){
        var classType = 'no-products' + (renderedApproach() == 'mobile' ? '-mobile' : '');
        var bodyEl = $('body');
        bodyEl.removeClass(function(i,currentclass){
            return currentclass.replace(/\b(?:dynamic)\b\s*/g, '');
        });
        if (hasProducts) {
            bodyEl.removeClass(classType);
            player.resize();
        }else{
            bodyEl.addClass(classType);
            player.resize();
        }
    };

    var showTitle = function(opts, title){
        var showTitleOption = Utils.isset(opts, 'show_video_title') ? opts.show_video_title : true,
            titleToShow = Utils.isset(opts, 'static_title') ? opts.static_title : title;
        if (!showTitleOption) {
            $(inlineEl).find('#videoTitle').hide();
        } else {
            $(inlineEl).find('#videoTitle').html(titleToShow);
        }
    };

    function Inline(el, options) {
        currentApproach = renderedApproach();
        xchg = options.xchg || false;
        loginId = (options.loginId || options.loginid) || 0;
        channel = options.channel || {};
        channelId = channel.id || ( options.channelId || options.channelid );
        productRatingEmptyIsBordered = Utils.isset(options.product_rating_empty_bordered) ? options.product_rating_empty_bordered : false;

        inlineEl = 'string' === typeof el ? document.getElementById(el) : el;
        var container = inlineEl.getElementsByClassName('tvp-videos-scroller')[0];

        //templates
        templates.productsNav = options.templates.product_nav;
        templates.inlineItem = options.templates.inline_item;
        templates.videosCarouselNextArrow = options.templates.inline_carousel_next_arrow;
        templates.videosCarouselPreviousArrow = options.templates.inline_carousel_previous_arrow;
        templates.featuredProduct = options.templates.featured_product.product;
        templates.productItem = options.templates.product;
        templates.playIcon = options.templates.play_icon;
        templates.ratingsHtml = options.templates.featured_product.ratings;

        var loadProducts = function(videoId, loginId, fn) {
            if (!videoId) return;
            var src = options.api_base_url +'/videos/' + videoId + '/products?X-login-id=' + loginId;
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

        var onNext = function (e) {
            isProductsInitialized = false;
            renderProducts(e.assetId, e.loginId); 
            showTitle(options, e.assetTitle);
            addVideoActiveState(e.assetId);
            var slickSlides = $videoSliderDesktop.slick('getSlick').$slides,
                slickIndex;
            $(slickSlides).each(function(i, el) {
                var itemChildren = el.childNodes;
                if ($(itemChildren).hasClass('tvp-video-item-active')) {
                    slickIndex = $(this).data('slickIndex');
                }
            });
            $videoSliderDesktop.slick('slickGoTo', parseInt(slickIndex));
        };

        var renderProducts = function (vid, lid) {        
        var products =  document.getElementById('tvpProductsView');
        var deInitProd = function () {
            if (!$('#productContent').hasClass('slick-initialized')) return;
            $('#productContent').slick('unslick');
            products.innerHTML = "";
        };
        var layoutProducts = function () {            
            deInitProd();
            var itemTemplate = templates.productItem;
            var _container = $('.tvp-products-scroller');
            var productContent = document.createElement('div');
            productContent.id = "productContent";
            var productGroup = document.createElement('div');
            productGroup.className = "tvp-product-item-group";
            for (var i = 0; i < productData.length; i++) {
                var row = document.createElement('a');
                row.setAttribute('data-id', productData[i].id);
                row.setAttribute('data-title', productData[i].title);
                row.className = 'tvp-product-item';
                productData[i].trimTitle = Utils.trimText(productData[i].title, 42);
                productData[i].price = Utils.trimPrice(productData[i].price);
                row.innerHTML = Utils.tmpl(itemTemplate, productData[i]);
                row.href = productData[i].linkUrl;
                row.setAttribute('target', '_blank');
                $(row).appendTo(productContent);
                $(productContent).appendTo(_container);
            }

            //product scroll nav
            if (productData.length > 1) {
                $(templates.productsNav).appendTo(_container);
            }

            $(productContent).slick({
                arrows: true,
                prevArrow: document.querySelector('.tvp-products-prev'),
                nextArrow: document.querySelector('.tvp-products-next'),
                slidesToShow: 1,
                slidesToScroll: 1,
                dots: false
            }).on('setPosition', function(s) {
                var $productItms = $('.tvp-product-item');
                for (var i = $productItms.length - 1; i >= 0; i--) {                    
                    var defaultTitle = $productItms[i].getAttribute('data-title');
                    $productItms[i].querySelector('.tvp-product-info-title').innerHTML = defaultTitle;
                }
                $('.tvp-product-info-title').ellipsis({
                    row: renderedApproach() !== 'mobile' ? 3 : 2 
                });  
                });
                addProductActiveState(productData[0].id);
            };

            if(!isProductsInitialized){
                loadProducts(vid, lid, 
                    function (data) {                
                        if (data.length) {
                            hasProducts = true;
                            checkProducts();
                            for (var i = data.length - 1; i >= 0; i--) {
                                analytics.track('pi',{
                                    vd: data[i].entityIdParent,
                                    ct: data[i].id,
                                    pg: channelId
                                });
                            }

                            productData = data;
                            layoutProducts();
                            renderFeaturedProduct(data[0]);                        
                            isProductsInitialized = true;                        
                        }
                        else{
                            hasProducts = false;
                            deInitProd();
                            checkProducts();
                        }
                        resizeParent();
                });
            }
            else{
                layoutProducts();
            }
        };

        var render = function(data){
            var all = data.slice(0);

            for (var i = 0; i < all.length; i++) {
                var item = all[i];
                var rowEl = document.createElement('div');
                var className = '';                
                item.trimTitle = Utils.trimText(item.title,50);
                if ('undefined' !== typeof item.entity) {
                    className += ' tvp-exchange';
                }

                item.className = className;
                item.mediaDuration = Utils.formatDuration(item.duration);
                item.publishedDate = Utils.formatDate(item.date_created);
                rowEl.innerHTML = Utils.tmpl(templates.inlineItem, item);
                container.appendChild(rowEl);
            }

            //insert custom arrow icon template
            $('.tvp-videos-arrow-next').append(templates.videosCarouselNextArrow);
            $('.tvp-videos-arrow-prev').append(templates.videosCarouselPreviousArrow);
            $('.tvp-video-item-image').append(templates.playIcon);

            $videoSliderDesktop = $(inlineEl.querySelector('#tvpVideoScroller'));

            if (all.length > 1) {
                var videosToShow =  Utils.isset(options.videos_to_show) ? parseInt(options.videos_to_show) : 4;
                var videosToScroll =  Utils.isset(options.videos_to_scroll) ? parseInt(options.videos_to_scroll) : 4;

                $videoSliderDesktop.slick({
                    arrows: options.videos_carousel_arrow_display === "none" ? false : true,
                    slidesToShow: videosToShow,
                    slidesToScroll: videosToScroll,
                    nextArrow: '.tvp-videos-arrow-next',
                    prevArrow: '.tvp-videos-arrow-prev',
                    dotsClass: 'tvp-slider-dots',
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
                        var itemPadding = parseInt(window.getComputedStyle(item, null).paddingTop);
                        var baseHeight = item.querySelector('.tvp-video-item-image').offsetHeight;
                        var arrowHeight = parseInt(s.currentTarget.slick.$nextArrow[0].offsetHeight);

                        s.currentTarget.slick.$nextArrow[0].style.marginTop = ((baseHeight - arrowHeight) / 2) + itemPadding + "px";
                        s.currentTarget.slick.$prevArrow[0].style.marginTop = ((baseHeight - arrowHeight) / 2) + itemPadding + "px";    
                    }

                    for (var i = s.currentTarget.slick.$slides.length - 1; i >= 0; i--) {
                        var slideItem = s.currentTarget.slick.$slides[i];
                        var defaultTitle = slideItem.querySelector('.tvp-video-item').getAttribute('data-title');                        
                        slideItem.querySelector('.tvp-video-item-title').innerHTML = defaultTitle;
                    }

                    $('.tvp-video-item-title').ellipsis({
                        row: options.videos_carousel_item_title_lines_to_display
                    });                    
                });
            }
            else{
                $videoSliderDesktop.hide();
                inlineEl.querySelector('.tvp-videos-container').style.display = "none";
            }
            

            //init player            
            var s = options;
            s.onNext = onNext;
            selectedVideo = data[0];
            s.data = data;

            player = new Player('tvp-player', s, selectedVideo.id);
            showTitle(options, selectedVideo.title);
            addVideoActiveState(selectedVideo.id);
            
            //render products  
            renderProducts(selectedVideo.id, loginId);

            resizeParent();

            analytics =  new Analytics();
            analytics.initConfig({
                logUrl: options.api_base_url + '/__tvpa.gif',
                domain: Utils.isset(location,'hostname') ?  location.hostname : '',
                loginId: loginId
            });

            window.addEventListener('resize', Utils.debounce(function(){
                if (isProductsInitialized) {
                    if(currentApproach !== renderedApproach()){                        
                        currentApproach = renderedApproach();
                    }
                    renderProducts(selectedVideo.id, loginId);
                }
                checkProducts();
                resizeParent();
            }, 85));
        };

        var load = function(callback){
            var getChannelVideos = function(callback){
                var channel_id = Utils.isEmpty(channel) ? channelId : channel.id;
                var params = channel.parameters || {};
                var src = options.api_base_url+ '/channels/' + channel_id + '/videos?X-login-id=' + loginId;
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
                showTitle(options, selectedVideo.title);                        
            }
            else if (getTarget('tvp-product-item')) {
                pkTrack(this.querySelector('.tvp-product-item').getAttribute('data-id'));
            }
            else if (getTarget('tvp-video-play')) {
                player.instance.play();
            }
        };

        load(function(data){
            render(data);
        });
    }

    window.Inline = Inline;
}(window, document));