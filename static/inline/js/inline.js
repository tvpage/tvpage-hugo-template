;(function(window, document) {
    var $videoSliderDesktop = null;
    var productData = [];
    var isProductsInitialized = false;
    var analytics = null;
    var breakpoint = 769;

    var that = this;

    var pkTrack = function(){
        analytics.track('pk',{
            vd: that.player.assets[that.player.current].assetId,
            ct: this.getAttribute('data-id'),
            pg: that.channel.id
        });
    };

    var hasClass = function(obj,c) {
        if (!obj || !c) return;
        return obj.classList.contains(c);
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
        var getRating = function() {
          var rating = 0;
          
          if(product.hasOwnProperty('rating')){
            rating = parseInt(this.rating);
          }

          return '<span class="tvp-icon tvp-icon-rating tvp-rating-' + rating + '"></span>';
        }

        var featuredProductContainer = document.getElementById('tvpFeaturedProduct');

        var featuredProduct = document.createElement('a');        
        product.formattedRating = getRating();
        featuredProduct.className = 'tvp-featured-product';
        featuredProduct.href = product.linkUrl;
        featuredProduct.setAttribute('target', '_blank');
        featuredProduct.setAttribute('data-id', product.id);
        featuredProduct.innerHTML = Utils.tmpl(that.featuredProductTemplate, product);
        $(featuredProductContainer).children().remove();
        $(featuredProduct).appendTo(featuredProductContainer);

        featuredProduct.addEventListener('click', pkTrack, false);
    }

    var renderProducts = function (vid, lid) {
        var products =  document.getElementById('tvpProductsView');
        var isScrollBar = function () {
            return this.el.offsetWidth >= breakpoint;
        }
        var deInitProd = function () {
            if(!$(products).find('.ss-content').length){
                $(products).find('#productContent').slick('unslick');//.children().remove();
                // $(products).find('#productContent').remove();
            }

            products.innerHTML = "";
        };

        loadProducts(vid, lid, 
            function (data) {                
                if (data.length) {
                    var itemTemplate = that.productItemTemplate;
                    var _container = $('.tvp-products-scroller');

                    if (isProductsInitialized) deInitProd();

                    productData = data;

                    var productContent = document.createElement('div');
                    productContent.id = "productContent";
                    var productGroup = document.createElement('div');
                    for (var i = 0; i < data.length; i++) {
                        var row = document.createElement('a');
                        row.setAttribute('data-id', data[i].id);
                        row.className = 'tvp-product-item';
                        row.innerHTML = Utils.tmpl(itemTemplate, data[i]);
                        if (Utils.isMobile) {
                            row.href = data[i].linkUrl;
                            row.setAttribute('target', '_blank');
                        }

                        $(row).appendTo(productGroup);
                        
                        if (( ((i + 1) % 4) === 0 ) && (i !== (data.length - 1))) {
                            $(productGroup).appendTo(productContent);
                            $(productContent).appendTo(_container);
                            productGroup = document.createElement('div');
                        }
                        else if (i === (data.length - 1)) {
                            $(productGroup).appendTo(productContent);
                            $(productContent).appendTo(_container);
                        }

                        analytics.track('pi',{
                            vd: data[i].entityIdParent,
                            ct: data[i].id,
                            pg: this.channel.id
                        });
                        row.addEventListener('click', pkTrack, false);
                    }

                    renderFeaturedProduct(data[0]);
                    $(productContent).slick({
                        arrows: true,
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        dots: true
                    })
                    .on('afterChange', function(event, slick, currentSlide) {
                        var slideItemId = $(slick.$slides[currentSlide]).find('.tvp-product-item')[0].getAttribute('data-id');
                        var selected = getSelectedData(productData, slideItemId);
                        renderFeaturedProduct(selected);
                    });

                    isProductsInitialized = true;
                }
                else{
                    $(products).find('#productContent').slick('unslick').children().remove();
                    document.getElementById('tvpFeaturedProduct').innerHTML = "";
                }
        });
    };

    function Inline(el, options) {
        this.xchg = options.xchg || false;
        this.windowSize = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) <= 200 ? 'small' : 'medium';
        this.initialResize = true;

        this.itemsPerPage = 1000;

        this.loginId = (options.loginId || options.loginid) || 0;
        this.channel = options.channel || {};
        this.channelid = options.channelid || {};
        this.loading = false;
        this.isLastPage = false;
        this.page = 0;

        //templates
        this.inlineItemTemplate = options.templates.inline_item;
        this.videosCarouselNextArrowTemplate = options.templates.inline_carousel_next_arrow;
        this.videosCarouselPreviousArrowTemplate = options.templates.inline_carousel_previous_arrow;
        this.featuredProductTemplate = options.templates.featured_product;
        this.productItemTemplate = options.templates.product;
        this.playIconTemplate = options.templates.play_icon;
        this.playerOverlayTemplate = options.templates.player_overlay;

        //player settings
        this.autoplay = Utils.isset(options.autoplay) ? Number(options.autoplay) : false;
        this.autonext = Utils.isset(options.autonext) ? Number(options.autonext) : true;
        this.player_version = Utils.isset(options.player_version) ? options.player_version : null;
        this.progress_color = Utils.isset(options.progress_color) ? options.progress_color : null;
        this.transcript = Utils.isset(options.transcript) ? options.transcript : null;
        this.remove_controls = Utils.isset(options.remove_controls) ? options.remove_controls : null;
        this.analytics = Utils.isset(options.analytics) ? options.analytics : null;
        this.overlay = Utils.isset(options.overlay) ? options.overlay : null;
        this.overlay_color = Utils.isset(options.overlay_color) ? options.overlay_color : null;
        this.overlay_opacity = Utils.isset(options.overlay_opacity) ? options.overlay_opacity : null;
        this.play_button_background_color = Utils.isset(options.play_button_background_color) ?  options.play_button_background_color : null;
        this.play_button_border_radius = Utils.isset(options.play_button_border_radius) ? options.play_button_border_radius : null;
        this.play_button_border_width = Utils.isset(options.play_button_border_width) ? options.play_button_border_width : null;
        this.play_button_border_color = Utils.isset(options.play_button_border_color) ? options.play_button_border_color : null;
        this.play_button_icon_color = Utils.isset(options.play_button_icon_color) ? options.play_button_icon_color : null;
        this.play_button_width = Utils.isset(options.play_button_width) ? options.play_button_width : null;
        this.play_button_height = Utils.isset(options.play_button_height) ? options.play_button_height : null;
        
        this.el = 'string' === typeof el ? document.getElementById(el) : el;
        this.container = this.el.getElementsByClassName('tvp-videos-scroller')[0];
        
        this.onClick = Utils.isset(options.onClick) && Utils.isFunction(options.onClick) ? options.onClick : null;
        this.onNext = function (e) {
            renderProducts(e.assetId, e.loginId); 
            $(that.el).find('#videoTitle').html(e.assetTitle);
        };
        this.onResize = function (e, d) {
            if (window.parent) {
                window.parent.postMessage({
                    event: 'tvp_'+ that.el.id.replace(/-/g,'_') +':resize',
                    height: that.el.offsetHeight + 'px'
                }, '*');
            }
        };    
        this.render = function(){
            var all = this.data.slice(0);
            
            for (var i = 0; i < all.length; i++) {
                var item = all[i];
                var rowEl = document.createElement('div');
                var className = '';                
                item.title = Utils.trimText(item.title,50);
                if ('undefined' !== typeof item.entity) {
                    className += ' tvp-exchange';
                }

                item.className = className;

                rowEl.innerHTML = Utils.tmpl(that.inlineItemTemplate, item);
                
                this.container.appendChild(rowEl);
            }

            //insert custom arrow icon template
            $('.tvp-videos-arrow-next').append(that.videosCarouselNextArrowTemplate);
            $('.tvp-videos-arrow-prev').append(that.videosCarouselPreviousArrowTemplate);
            $('.tvp-video-image').append(that.playIconTemplate);

            $videoSliderDesktop = $(this.el.querySelector('#tvpVideoScroller'));
            
            $videoSliderDesktop.slick({
                arrows: options.videos_carousel_arrow_display === "none" ? false : true,
                slidesToShow: parseInt(options.videos_to_show),
                slidesToScroll: parseInt(options.videos_to_scroll),
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
            });   



            //init player            
            var s = this;
            this.selectedVideo = this.data[0];
            s.data = data;
            this.player = new Player('tvp-player', s, this.selectedVideo.id);
            $(this.el).find('#videoTitle').html(this.selectedVideo.title);
            //render products  
            
            renderProducts(this.selectedVideo.id, options.loginId);

            window.addEventListener('resize', Utils.debounce(function(){
                this.player.resize();
            }, 85));
            
            analytics =  new Analytics();
            analytics.initConfig({
                logUrl: '\/\/api.tvpage.com\/v1\/__tvpa.gif',
                domain: Utils.isset(location,'hostname') ?  location.hostname : '',
                loginId: this.loginId
            });
        };

        this.load = function(callback){
            that.loading = true;
            if (this.onLoad) {
                this.onLoad();
            }

            var getChannelVideos = function(callback){
                var channelId = Utils.isEmpty(that.channel) ? that.channelid : that.channel.id;
                var params = channel.parameters || {};
                var src = '//api.tvpage.com/v1/channels/' + channelId + '/videos?X-login-id=' + that.loginId;
                for (var p in params) { src += '&' + p + '=' + params[p];}
                var cbName = options.callbackName || 'tvp_' + Math.floor(Math.random() * 555);
                src += '&p=' + that.page + '&n=' + that.itemsPerPage + '&callback='+cbName;
                var script = document.createElement('script');
                script.src = src;
                window[cbName || 'callback'] = callback;
                document.body.appendChild(script);
            };

            if (this.xchg) {
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
                                    // var xchgVideo = xchg[xchgCount-1];
                                    // xchgVideo = $.extend(xchgVideo, xchgVideo.entity);
                                    xchgCount--;
                                }
                            }

                            if (!data.length) {
                                that.isLastPage = true;
                            }

                            that.data = data;
                            callback(data.concat(xchg));
                            that.loading = false;
                            if (that.onLoadEnd) {
                                that.onLoadEnd();
                            }
                        });
                    }
                };
                xhr.send({p: 0,n: 1000,si: 1,li: 1,'X-login-id': 1});
            } else {
                getChannelVideos(function(data){                    
                    if ( !data.length || (data.length < that.itemsPerPage) ) {
                        that.isLastPage = true;
                    }

                    that.data = data;
                    callback(data);
                    that.loading = false;
                    if (that.onLoadEnd) {
                        that.onLoadEnd();
                    }
                });
            }
        };

        this.next = function(){
            if (this.isLastPage) {
                this.page = 0;
                this.isLastPage = false;
            } else {
                this.page++;
            }
        };

        
        this.el.onclick = function(e) {

            var target;
            
            var getTarget = function (name) {                
                for (var i = 0; i < e.path.length; i++) {
                    try{
                        if(hasClass(e.path[i], name)) {
                            target = e.path[i];
                            return true;
                        }
                    }
                    catch(err){
                        return false;
                    }
                }
            }

            if (getTarget('tvp-video')) {
                var selected = getSelectedData(that.data, target.getAttribute('data-id'));

                that.player.load(selected.id);
                renderProducts(selected.id, selected.loginId);
                $(that.el).find('#videoTitle').html(selected.title);                
            }
            else if (getTarget('tvp-product-item')){
                var selected = getSelectedData(productData, target.getAttribute('data-id'));
                renderFeaturedProduct(selected);
            }
        };

        this.load(function(data){
            that.render(data);
        });     

        // window.addEventListener('resize', function () {
        //     if (that.el.offsetWidth >= breakpoint;) renderProducts(that.selectedVideo.id, that.selectedVideo.loginId);
        // });
    }

    window.Inline = Inline;

}(window, document));