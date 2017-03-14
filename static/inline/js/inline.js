;(function(window, document) {

    var $carousel = null;
    var $videoSliderDesktop = null;

    var itemTemplate = '<div data-id="{id}" class="tvp-video{className}">' +
        '<div class="tvp-video-image" style="background-image:url({asset.thumbnailUrl})">'+
        '<svg class="tvp-video-play" viewBox="0 0 200 200" alt="Play video"><polygon points="70, 55 70, 145 145, 100"></polygon></svg>'+
        '<div class="tvp-video-image-overlay"></div>'+
        '</div><p class="tvp-video-title">{title}</p></div>';

    var productTemplate = '<div class="tvp-product-image" style="background-image: url({imageUrl})"></div>';

    var productFeatureTemplate = '<span class="tvp-featured-image"> <img src="{imageUrl}"> </span> <span class="tvp-featured-info"> <strong>{title}</strong> <small>{gender}</small> <span class="tvp-featured-price">${price}</span> <span class="tvp-featured-rating">{formattedRating}</span> <span class="clear"></span> </span> ';

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
        featuredProduct.innerHTML = Utils.tmpl(productFeatureTemplate, product);
        $(featuredProductContainer).children().remove();
        $(featuredProduct).appendTo(featuredProductContainer);
    }

    var renderProducts = function (vid, lid) {
        var products =  document.getElementById('tvpProductsView'); //Utils.getByClass('tvp-products-scroller');
        
        loadProducts(vid, lid, 
            function (data) {
                var $sscontent = $(products).find('.ss-content');
                if (data.length) {
                    var _container;
                    
                    if($sscontent.length){
                        $sscontent.children().remove();
                        _container = $sscontent;
                    }
                    else{
                        _container = products;
                    }

                    for (var i = 0; i < data.length; i++) {
                        var row = document.createElement('a');                    
                        row.setAttribute('data-id', data[i].id);
                        row.className = 'tvp-product-item';
                        row.innerHTML = Utils.tmpl(productTemplate, data[i]);
                        row.href = '#';
                        $(row).appendTo(_container);
                    }
                    SimpleScrollbar.initEl(products);
                    renderFeaturedProduct(data[0]);
                }
                else{
                    if($sscontent.children().length) {
                        $sscontent.children().remove();
                        $('#tvpFeaturedProduct').children().remove();
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
        this.loading = false;
        this.isLastPage = false;
        this.page = 0;

        this.el = 'string' === typeof el ? document.getElementById(el) : el;
        this.container = this.el.getElementsByClassName('tvp-videos-scroller')[1];

        this.onClick = Utils.isset(options.onClick) && Utils.isFunction(options.onClick) ? options.onClick : null;

        this.render = function(){
            this.container.innerHTML = '';

            var all = this.data.slice(0);
            var inlineFrag = document.createDocumentFragment();

            for (var i = 0; i < all.length; i++) {
                var item = all[i];
                var rowEl = document.createElement('div');
                var className = '';
                rowEl.className = 'tvp-video-container';
                rowEl.setAttribute('data-id', item.id);
                
                item.title = Utils.trimText(item.title,50);
                if ('undefined' !== typeof item.entity) {
                    className += ' tvp-exchange';
                }

                item.className = className;

                var templateScript = document.getElementById('videoItemTemplate');                
                var template = itemTemplate;
                if (templateScript) {
                    template = templateScript.innerHTML;
                }

                rowEl.innerHTML = Utils.tmpl(template, item);
                
                this.container.appendChild(rowEl);
            }
            
            $videoSliderDesktop = $(this.el.querySelector('#tvpVideoScroller'));
            $videoSliderDesktop.slick({
                arrows: true,
                slidesToShow: 4,
                slidesToScroll: 4,                
                nextArrow: '<div class="tvp-videos-arrows tvp-videos-arrow-next" data-dir="prev"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/><path d="M0-.25h24v24H0z" fill="none"/></svg></div>',
                prevArrow: '<div class="tvp-videos-arrows tvp-videos-arrow-prev" data-dir="next"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/><path d="M0-.5h24v24H0z" fill="none"/></svg></div>'
            });

            //init player
            var s = options;
            this.selectedVideo = this.data[0];
            s.data = data;

            this.player = new Player('tvp-player', s, this.selectedVideo.id);

            //render produyts
            var productHolder = Utils.getByClass('tvp-products-scroller');
            var playerHolder = document.getElementById('tvp-player');
            
            var resizeProducts = function(height){
                productHolder.style.height = height + 'px';
            };
            resizeProducts(playerHolder.offsetHeight);
            renderProducts(this.selectedVideo.id, options.loginId);
        };

        var that = this;
        this.load = function(callback){
            that.loading = true;
            if (this.onLoad) {
                this.onLoad();
            }

            var getChannelVideos = function(callback){
                var channel = that.channel || {};
                if (Utils.isEmpty(channel) || !channel.id) return console.log('bad channel');
                var params = channel.parameters || {};
                var src = '//api.tvpage.com/v1/channels/' + channel.id + '/videos?X-login-id=' + that.loginId;
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
                                    var xchgVideo = xchg[xchgCount-1];
                                    xchgVideo = $.extend(xchgVideo, xchgVideo.entity);
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
            console.log(e);
            var target = e.target;
            if (hasClass(target,'tvp-video-container')) {
                var id = target.getAttribute('data-id'),
                    selected = {};
                var data = that.data;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id === id) {
                        selected = data[i];
                    }
                }
                that.player.load(selected.id);
                renderProducts(selected.id, selected.loginId);

            } else if (hasClass(target,'tvp-carousel-arrow')) {

                if (hasClass(target,'next')) {
                    $carousel.slick('slickNext');
                } else {
                    $carousel.slick('slickPrev');
                }

            }
        };

        this.load(function(data){
            that.render(data);
        });
    }

    window.Inline = Inline;

}(window, document));