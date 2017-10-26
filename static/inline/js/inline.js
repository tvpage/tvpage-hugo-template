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
    var itemsPerPage = 1000;
    var page = 0;
    var selectedVideo = null;
    var videosData = null;
    var inlineEl = null;
    var productRatingEmptyIsBordered = false;
    var hasProducts = false;
    var firstRender = true;

    var helpers = {
        addActiveState: function (id, video) {
            var state = (video?'tvp-video-item-active':'tvp-product-item-active'),
                el = (video? $('#tvpVideoScroller') :$('#productContent'));

            el.find('.'+state).removeClass(state);
            el.find('.tvp-'+(video?'video':'product')+'-item[data-id="'+id+'"]').addClass(state);
        },
        checkProducts: function(){
            var classType = 'no-products' + (this.renderedApproach() == 'mobile' ? '-mobile' : '');
            var bodyEl = $('body');
            bodyEl.removeClass(function(i,currentclass){
                return currentclass.replace(/\b(?:dynamic)\b\s*/g, '');
            });
            if (hasProducts) {
                bodyEl.removeClass(classType);
                player.resize();
            }else{
                bodyEl.addClass(classType);
                document.getElementById('tvpFeaturedProduct').innerHTML = '';
                player.resize();
            }
        },
        emitMessage: function (evt, name, message) {
            if ( window.parent ) {
                message = message || {};
                message.event = 'tvp_' + name.replace(/-/g,'_') + ":" + evt;
                window.parent.postMessage(message, '*');
              }
        },
        getSelectedData: function (_data, id) {
            var selected = {};
            var data = _data;
            for (var i = 0; i < data.length; i++) {
                if (data[i].id === id) {
                    selected = data[i];
                }
            }
            return selected;
        },
        pkTrack: function(ctId){
            analytics.track('pk',{
                vd: player.assets[player.current].assetId,
                ct: ctId,
                pg: channelId
            });
        },
        renderedApproach: function () {
            if (document.body.clientWidth < breakpoint) {
                isFeaturedProductRendered = false;
                return 'mobile';
            }
            else{
                return 'desktop';
            }
        }
    };

    function Inline(options) {
        var el = options.name || '',
            _this = this,
            templates = {
                productsNav:options.templates.product_nav,
                inlineItem:options.templates.inline_item,
                videosCarouselNextArrow:options.templates.inline_carousel_next_arrow,
                videosCarouselPreviousArrow:options.templates.inline_carousel_previous_arrow,
                featuredProduct:options.templates.featured_product.product,
                productItem:options.templates.product,
                playIcon:options.templates.play_icon,
                ratingsHtml:options.templates.featured_product.ratings
            };

        currentApproach = helpers.renderedApproach();
        loginId = (options.loginId || options.loginid) || 0;
        channel = options.channel || {};
        channelId = channel.id || ( options.channelId || options.channelid );
        productRatingEmptyIsBordered = Utils.isset(options.product_rating_empty_bordered) ? options.product_rating_empty_bordered : false;

        inlineEl = 'string' === typeof el ? document.getElementById(el) : el;
        var container = inlineEl.getElementsByClassName('tvp-videos-scroller')[0];

        this.init = function(){
            this.render(options.videoData);
            this.bindClickEvents();
        };

        this.bindClickEvents = function(){
            Utils.addEvent(inlineEl, 'click',['tvp-video-item','tvp-product-item','tvp-featured-product','tvp-video-play'], function(type, el){ 
                switch (type) {
                    case 'tvp-video-item':
                        selectedVideo = helpers.getSelectedData(options.videoData, el.getAttribute('data-id'));
                        player.load(selectedVideo.id);
                        helpers.addActiveState(selectedVideo.id,true);
                        isProductsInitialized = false;
                        _this.renderProducts(selectedVideo.id, selectedVideo.loginId);
                        $(inlineEl).find('#videoTitle').html(selectedVideo.title);     
                        break;
                    case 'tvp-product-item':
                        if (helpers.renderedApproach() === 'desktop') {
                            var selected = helpers.getSelectedData(productData, el.getAttribute('data-id'));
                            _this.renderFeaturedProduct(selected);
                            helpers.addActiveState(selected.id,false);
                        }
                        else{
                            helpers.pkTrack(this.querySelector('.tvp-product-item').getAttribute('data-id'));
                        }
                        break;
                    case 'tvp-featured-product':
                        helpers.pkTrack(this.querySelector('.tvp-featured-product').getAttribute('data-id'));
                        break;
                    case 'tvp-video-play':
                        player.instance.play();
                        break;
                    default:
                }
            });
        };
        
        this.render = function(data){
            var playerInt = setInterval(function(){
                if (!player || !player.isReady) return;
                clearInterval(playerInt);
                $('.tvp-player-dummy-overlay').remove();
            },10);

            var all = data,
                rowEl = '',
                className = ''; 

            for (var i = 0; i < all.length; i++) {
                var item = all[i];
                item.trimTitle = Utils.trimText(item.title,50);
                if ('undefined' !== typeof item.entity) {
                    className += ' tvp-exchange';
                }
                item.className = className;
                rowEl +=  '<div>'+ Utils.tmpl(templates.inlineItem, item) + '</div>';
                
            }
            container.innerHTML = rowEl;


             selectedVideo = data[0];

            //render products 
            _this.renderProducts(selectedVideo.id, loginId); 
            if (helpers.renderedApproach() == 'mobile') {
                helpers.emitMessage('resize',el,{
                    height: (helpers.renderedApproach() == 'mobile' ? inlineEl.offsetHeight + 'px !important': '0px !important')
                });
            }

            //insert custom arrow icon template
            $('.tvp-videos-arrow-next').append(templates.videosCarouselNextArrow);
            $('.tvp-videos-arrow-prev').append(templates.videosCarouselPreviousArrow);
            $('.tvp-video-item-image').append(templates.playIcon);

            $videoSliderDesktop = $(inlineEl.querySelector('#tvpVideoScroller'));

            if (all.length >= 1) {
                var videosToShow = Utils.isset(options.videos_to_show) ? parseInt(options.videos_to_show) : 4;
                var videosToScroll = Utils.isset(options.videos_to_scroll) ? parseInt(options.videos_to_scroll) : 4;

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
                                centerPadding: options.videos_carousel_center_padding,
                                centerMode : true,
                                slidesToShow: 2,
                                slidesToScroll: 2,
                                dots: true
                            }
                        }
                    ]
                }).on('setPosition', function(s) {                    
                    if (helpers.renderedApproach() !== 'mobile') {
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
                $('.tvp-video-item-title').ellipsis({
                    row: options.videos_carousel_item_title_lines_to_display
                });   
            }
            else{
                $videoSliderDesktop.hide();
                inlineEl.querySelector('.tvp-videos-container').style.display = "none";
            }

            //init player            
            var s = options;
            s.onNext = this.onNext;
            s.data = data;

            player = new Player('tvp-player', s, selectedVideo.id);
            $(inlineEl).find('#videoTitle').html(selectedVideo.title);
            helpers.addActiveState(selectedVideo.id,true);
            
            analytics =  new Analytics();
            analytics.initConfig({
                logUrl: '//api.tvpage.com/v1/__tvpa.gif',
                domain: Utils.isset(location,'hostname') ?  location.hostname : '',
                loginId: loginId,
                firstPartyCookies: options.firstpartycookies,
                cookieDomain: options.cookiedomain
            });
            analytics.track('ci', {
                li: loginId
            });

            window.removeEventListener('resize', Utils.debounce(function(){_this.handleResize();},85),false);
            window.addEventListener('resize', Utils.debounce(function(){_this.handleResize();},85),false);
            $videoSliderDesktop.slick('setPosition');
            setTimeout(function(){
                helpers.emitMessage('initialize',el);
            },10);
        };

        this.handleResize = function(){
            if (isProductsInitialized) {
                if(currentApproach !== helpers.renderedApproach()){                        
                    currentApproach = helpers.renderedApproach();
                    _this.renderProducts(selectedVideo.id, loginId);
                    helpers.emitMessage('resize',el,{
                       height: (helpers.renderedApproach() == 'mobile' ? inlineEl.offsetHeight + 'px !important': '0px !important')
                    });
                }
            }
            if (helpers.renderedApproach() == 'mobile') {
                helpers.emitMessage('resize',el,{
                   height: inlineEl.offsetHeight + 'px !important'
                });
            }
        };

        this.renderFeaturedProduct = function (product) {     
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
                .off().on({
                    'beforeChange': function(event, slick, currentSlide, nextSlide){
                        helpers.addActiveState();
                    },
                    'afterChange' : function(event, slick, currentSlide) {
                        if (currentApproach === 'desktop' && isFeaturedProductRendered) {
                            var slideItemId = $(slick.$slides[currentSlide]).find('.tvp-product-item')[0].getAttribute('data-id');
                            var selected = helpers.getSelectedData(productData, slideItemId);
                            _this.renderFeaturedProduct(selected);
                            helpers.addActiveState(selected.id,false);
                        }
                    }
                });

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
        };

        this.renderProducts = function (vid, lid) {    
            var products =  document.getElementById('tvpProductsView'),

            deInitProd = function () {
                if (!$(products))return;
                $(products).empty();
            },

            layoutProducts = function () {
                if (!productData || !productData.length) return;         
                deInitProd();

                var allData = productData,
                    itemTemplate = templates.productItem,
                    _container = $('.tvp-products-scroller'),
                    productContent = document.createElement('div');
                    productContent.id = "productContent";

                var rowEl = '',
                    all = allData.slice(0),
                    pages = [];

                while (all.length) {
                    pages.push(all.splice(0,4));
                }

                for (var i = 0; i < pages.length; i++) {
                    var row = '', page = pages[i];
                    for (var j = 0; j < page.length; j++) {
                        var item = page[j];
                        item.trimTitle = Utils.trimText(item.title, 42);
                        item.price = Utils.trimPrice(item.price);
                        row += '<a class="tvp-product-item" '+ 
                             (helpers.renderedApproach() == 'mobile' ? 'href="'+item.linkUrl+'" target="_blank" ': '') +
                             'data-id="' + item.id + '" '+
                             'data-title="' + item.title + '" >' + Utils.tmpl(itemTemplate, item) + '</a>';
                    }
                    rowEl += '<div class="tvp-product-item-group">'+row+'</div>';
                }

                if(helpers.renderedApproach() == 'mobile'){
                    $(row).appendTo(productContent);
                    $(productContent).appendTo(_container);
                }
                else{
                    $(rowEl).appendTo(productContent);
                    $(productContent).appendTo(_container);                          
                }

                //product scroll nav
                if (productData.length > 1) {
                    $(templates.productsNav).appendTo(_container);
                    $(productContent).slick({
                        arrows: true,
                        prevArrow: document.querySelector('.tvp-products-prev'),
                        nextArrow: document.querySelector('.tvp-products-next'),
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        dots: true,
                        dotsClass: 'tvp-slider-dots',
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
                }

                helpers.addActiveState(productData[0].id,false);
                setTimeout(function(){
                    $('.tvp-product-info-title').ellipsis({
                        row: 2
                    });  
                },100); 
            };

            if(!isProductsInitialized && !firstRender){
                Utils.loadProducts(vid, lid, 
                    function (data) {                
                        if (data.length) {
                            hasProducts = true;
                            helpers.checkProducts();
                            for (var i = data.length - 1; i >= 0; i--) {
                                analytics.track('pi',{
                                    vd: data[i].entityIdParent,
                                    ct: data[i].id,
                                    pg: channelId
                                });
                            }

                            productData = data || [];
                            isProductsInitialized = true; 
                            layoutProducts();
                            _this.renderFeaturedProduct(data[0]);                                               
                        }
                        else{
                            hasProducts = false;
                            deInitProd();
                            helpers.checkProducts();
                        }
                        if (helpers.renderedApproach() == 'mobile') {
                            helpers.emitMessage('resize',el,{
                                height: (helpers.renderedApproach() == 'mobile' ? inlineEl.offsetHeight + 'px !important': '0px !important')
                            });
                        }
                });
            }
            else{
                if (firstRender) {
                    productData = options.productsFirstData || [];
                    hasProducts = (productData.length?true:false);
                    firstRender = false;
                }
                if (hasProducts) {
                    isProductsInitialized = true; 
                    layoutProducts();
                    _this.renderFeaturedProduct(productData[0]);
                }
            }
        };

        this.onNext = function (e) {
            isProductsInitialized = false;
            _this.renderProducts(e.assetId, e.loginId); 
            $(inlineEl).find('#videoTitle').html(e.assetTitle);
            helpers.addActiveState(e.assetId,true);
        };
    }
    window.Inline = Inline;
}(window, document));