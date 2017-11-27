(function() {

    var body = document.body;
    var id = body.getAttribute("data-id") || "";
    var config = window.parent.__TVPage__.config[id];
    var eventPrefix = config.events.prefix;
    var mainEl = Utils.getById(id);
    var analytics = null;
    var eventName;

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

    var pkTrack = function() {
        analytics.track('pk', {
            vd: this.getAttribute('data-vd'),
            ct: this.id.split('-').pop(),
            pg: config.channelId
        });
    };

    function render(data) {
        var container = mainEl.querySelector('.tvp-products');
        
        //This destroy technique might causing leaks?
        var carouselClass = 'tvp-products-carousel'
        var carousel = container.querySelector('.' + carouselClass);
        
        if(carousel)
          carousel.parentNode.removeChild(carousel)

        carousel = document.createElement("div");
        carousel.className = carouselClass;
        
        container.appendChild(carousel);

        var currentProducts = container.getElementsByClassName('tvp-product');
        for (var j = 0; j < currentProducts.length; j++) {
            var currentProductEl = currentProducts[j];
            if(currentProductEl)
                currentProductEl.removeEventListener('click', pkTrack, false);
        }

        var dataLength = data.length;
        var template = config.templates.mobile.modal.content;
        
        var piTrack = function(p){
            analytics.track('pi', {
                vd: p.entityIdParent,
                ct: p.id,
                pg: config.channelId
            });
        };

        var html = "";

        for (var i = 0; i < dataLength; i++) {
            var product = data[i];

            piTrack(product);

            product.title = Utils.trimText(product.title + '', 50);
            product.price = Utils.trimPrice(product.price + '');

            html += Utils.tmpl(template.product, product);
        }

        carousel.innerHTML = html;

        Utils.sendMessage({
            event: eventPrefix + ':widget_modal_resize',
            height: getWidgetHeight() + 'px'
        });

        var products = container.getElementsByClassName('tvp-product');
        var productLength = products.length;
        
        for (var j = 0; j < productLength; j++) {
            products[j].addEventListener('click', pkTrack, false);
        }

        //We use slick slider http://kenwheeler.github.io/slick/ for the ui component
        function onSlickLoad() {
            var moreThan1 = dataLength > 1;
            
            //Won't start the slider if there's not enough elements for it
            if (!moreThan1)
                return;

            var centerMode = moreThan1;
            var prefix = 'mobile_modal_products_slider';
            var centerPadding = config[prefix + '_center_padding'] || '0px';
            
            var slickConfig = {
                arrows: false,
                slidesToSlide: 1,
                slidesToShow: 3,

                //Do we want to use this feautre
                centerMode: centerMode,
                centerPadding: centerPadding,

                //The problem with having different values of slidesToShow depending on device's size is the skeleton build, we
                //can keep this if we can do that
                responsive: [
                {
                    breakpoint: 768,
                    settings: {
                        arrows: false,
                        centerMode: centerMode,
                        centerPadding: centerPadding,
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        arrows: false,
                        centerMode: centerMode,
                        centerPadding: centerPadding,
                        slidesToShow: 1
                    }
                }
                ]
            };

            var addPaginationConfig = function(){
                slickConfig.appendDots = '#tvp-slider-dots';
                slickConfig.dots = config.mobile_products_navigation_bullets;
            };

            var $slickEl = $(carousel);

            if (moreThan1 && dataLength <= config.mobile_products_max_navigation_bullets)
                addPaginationConfig();

            $slickEl.on('init', function() {
                if(config.debug) {
                    console.log('mobile products scroller initialized', performance.now() - startTime)
                }

                Utils.addClass(container,'enabled');
            });

            $slickEl.on('setPosition', function() {
                if(config.debug) {
                    console.log('slick is resizing');
                }

                Utils.sendMessage({
                    event: eventPrefix + ':widget_modal_resize',
                    height: getWidgetHeight() + 'px'
                });
            });

            $slickEl.slick(slickConfig);
        };

        //We start loading our slick dependency here, it was breaking while rendering it dynamicaly.
        var slickScript = document.createElement('script');
        slickScript.src = config.baseUrl + '/solo-cta/js/vendor/slick-min.js'
        slickScript.onload = onSlickLoad;
        body.appendChild(slickScript);
    };

    var loadProducts = function(vid, cback) {
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

    var onNoProducts = function(){
        Utils.addClass(mainEl,'tvp-no-products');
        Utils.sendMessage({
            event: eventPrefix + ':widget_modal_no_products'
        });
    };
    var onProducts = function(){
        Utils.removeClass(mainEl,'tvp-no-products');
        Utils.sendMessage({
            event: eventPrefix + ':widget_modal_products'
        });
    };

    var onLoadProducts = function(data) {
        data.length ? onProducts() : onNoProducts();
        render(data);
    };

    var onPlayerNext = function(next) {
        if (config.merchandise && next) {
            loadProducts(next.assetId, onLoadProducts);
        }else{
            onNoProducts();
        }

        Utils.sendMessage({
            event: eventPrefix + ':player_next',
            next: next
        });
    };

    var onPlayeResize = function() {
        Utils.sendMessage({
            event: eventPrefix + ':widget_modal_resize',
            height: getWidgetHeight() + 'px'
        });
    };

    var initializePlayer = function() {
        var playerConfig = Utils.copy(config);
        
        playerConfig.data = config.channel.videos;
        playerConfig.onResize = onPlayeResize;
        playerConfig.onNext = onPlayerNext;

        var player = new Player('tvp-player-el', playerConfig, config.clicked);

        player.initialize();
    };

    //This should be done lazily.. after the important stuff
    var initializeAnalytics = function(){
        analytics =  new Analytics();
        analytics.initConfig({
            domain: location.hostname || '',
            logUrl: config.api_base_url + '/__tvpa.gif',
            loginId: config.loginId,
            firstPartyCookies: config.firstpartycookies,
            cookieDomain: config.cookiedomain
        });
    };

    function initialize() {
        initializePlayer();
        initializeAnalytics();

        if (config.merchandise) {
            loadProducts(config.clicked, onLoadProducts);
        }else{
            onNoProducts();
        }

        Utils.sendMessage({
            event: eventPrefix + ':widget_modal_initialized',
            height: getWidgetHeight() + 'px'
        });
    };

    var depsCheck = 0;
    var deps = ['TVPage', '_tvpa', 'jQuery', 'Utils', 'Analytics', 'Player'];

    (function initModal() {
        setTimeout(function() {
            if(config.debug){
                console.log('deps poll...');
            }
        
            var ready = true;
            var depsLength = deps.length;
            
            for (var i = 0; i < depsLength; i++)
                if ('undefined' === typeof window[deps[i]])
                ready = false;

            if(ready){
                initialize();
            }else if(++depsCheck < 200){
                initModal()
            }
        },10);
    })();

}());