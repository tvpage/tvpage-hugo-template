;(function(window, document) {
    var $videoSliderDesktop = null;
    var productData = [];
    var isProductsInitialized = true;
    var analytics = null;

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
        
        if (Utils.isMobile) return;
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
        
        loadProducts(vid, lid, 
            function (data) {
                var $sscontent = $(products).find('.ss-content');
                if (data.length) {
                    var itemTemplate = Utils.isMobile ? that.featuredProductTemplate : this.productItemTemplate;
                    var _container = null;

                    productData = data;

                    if (!Utils.isMobile) {                        
                        if($sscontent.length){
                            $sscontent.children().remove();
                            _container = $sscontent;
                        }
                        else{
                            _container = products;
                        }
                    }
                    else{
                        if (!isProductsInitialized) {$(products).slick('unslick').children().remove();}                        
                    }

                    for (var i = 0; i < data.length; i++) {
                        var row = document.createElement('a');                    
                        row.setAttribute('data-id', data[i].id);
                        row.className = 'tvp-product-item';
                        row.innerHTML = Utils.tmpl(itemTemplate, data[i]);
                        if (Utils.isMobile) {
                            row.href = data[i].linkUrl;
                            row.setAttribute('target', '_blank');
                        }

                        $(row).appendTo(!Utils.isMobile ? _container : $(products));
                        
                        analytics.track('pi',{
                            vd: data[i].entityIdParent,
                            ct: data[i].id,
                            pg: this.channel.id
                        });
                        row.addEventListener('click', pkTrack, false);
                    }

                    if (isProductsInitialized && !Utils.isMobile) {
                        SimpleScrollbar.initEl(products);
                    }

                    if (!Utils.isMobile){ renderFeaturedProduct(data[0]) }
                    else {
                        $(products).slick({
                            arrow: false,
                            slidesToShow: 1,
                            slidesToScroll: 1
                        });
                    }

                    isProductsInitialized = false;
                }
                else{
                    if (!isProductsInitialized) {
                        if (!Utils.isMobile) {
                            if($sscontent.children().length) {
                                $sscontent.children().remove();
                                $('#tvpFeaturedProduct').children().remove();
                            }
                            while(productData.length > 0){
                                productData.pop();
                            }
                        }
                        else{
                            $(products).slick('unslick').children().remove();
                        }                       
                    }
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
        this.featuredProductTemplate = options.templates.featured_product;
        this.productItemTemplate = options.templates.product;

        this.el = 'string' === typeof el ? document.getElementById(el) : el;
        this.container = this.el.getElementsByClassName('tvp-videos-scroller')[0];
        
        

        this.onClick = Utils.isset(options.onClick) && Utils.isFunction(options.onClick) ? options.onClick : null;
        this.onNext = function (e) {
            renderProducts(e.assetId, e.loginId); 
            $(that.el).find('#videoTitle').html(e.assetTitle);
        };
        this.onResize = function (e, d) {
            if (!Utils.isMobile) {                
                $(that.el).find('#tvpProductsView').height(d[1]);
            }            
            if (window.parent) {
                window.parent.postMessage({
                    event: 'tvp_'+ that.el.id.replace(/-/g,'_') +':resize',
                    height: that.el.offsetHeight + 'px'
                }, '*');
            }
        };    
        this.render = function(){
            // this.container.innerHTML = '';

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

            $videoSliderDesktop = $(this.el.querySelector('#tvpVideoScroller'));
            
            $videoSliderDesktop.slick({
                arrows: true,
                slidesToShow: 4,
                slidesToScroll: 4,
                nextArrow: '.tvp-videos-arrow-next',
                prevArrow: '.tvp-videos-arrow-prev',
                responsive:[
                    {
                        breakpoint: 769,
                        settings: {
                            arrows: false,
                            // centerMode: true,
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
    }

    window.Inline = Inline;

}(window, document));