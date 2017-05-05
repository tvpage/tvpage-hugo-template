(function(window, document) {
    var analytics = null;
    var channelId = null;
    var hasData = false;
    var eventName;
    var currentProducts = [];
    var settings = {};
    var eventPrefix = "tvp_" + (document.body.getAttribute("data-id") || "").replace(/-/g,'_');

    var analyticsTrack = function(trackEvent,product){
      var trackData = {};
      var trackConfig = {
        loginId: settings.loginId,
        domain: Utils.isset(location,'hostname') ?  location.hostname : ''
      };
      
      if (product.isCampaignProduct) {
        trackConfig.logUrl = product.analytics;
        
        var events = product.events;
        for (var i = 0; i < events.length; i++) {
          var e = events[i];
          if ( ("pi" === trackEvent ? "impression" : ("pk" === trackEvent ? "click" : "")) === e.type) {
            trackData = e.data;
          }
        }
      } else {
        trackConfig.logUrl = settings.api_base_url + '/__tvpa.gif';
        trackData = {
          vd: product.entityIdParent,
          ct: product.id,
          pg: channelId
        };
      }
      
      analytics.initConfig(trackConfig);
      analytics.track(trackEvent || '',trackData);
    };

    var productClick = function() {
      var toTrack = {};
      for (var i = 0; i < currentProducts.length; i++) {
        var product = currentProducts[i];
        if ('undefined' !== typeof product.entity) {
          product.entity.analytics = product.analytics;
          product = product.entity;
        }

        if (product.id === this.id.split('-').pop()) {
          toTrack = product;
        }
      }

      analyticsTrack("pk", toTrack);
    };
    
    var createProductsArray = function(obj){
      if ("object" !== typeof obj) return;
      var arr = [];
      for (var key in obj) {
        arr.push(obj[key]);
      }
      return arr;
    };
    
    var notify = function(){
      setTimeout(function(){
        if (window.parent) {
          window.parent.postMessage({event: eventName}, '*');
        }
      },0);
    };
    
    var checkProducts = function(data,el){
        if (!data || !data.length) {
            hasData = false;
            Utils.getByClass('tvp-products').classList.remove('enabled');
            el.classList.add('tvp-no-products');
            eventName = eventPrefix + ':modal_no_products';
            notify();
        }else{
            hasData = true;
            Utils.getByClass('tvp-products').classList.add('enabled');
            el.classList.remove('tvp-no-products');
            eventName = eventPrefix + ':modal_products';
            notify();
        }
    };

    var loadProducts = function(videoId, settings, fn) {
        if ("undefined" === typeof videoId || !settings) return;
        var src = settings.api_base_url + '/videos/' + videoId + '/products?X-login-id=' + settings.loginId;
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

    var render = function(data,config) {
        var container = Utils.getByClass('tvp-products');
        var el = Utils.getByClass('iframe-content');
        
        currentProducts = data;
        
        var carousel = container.querySelector('.tvp-products-carousel');
        if (carousel) {
            carousel.parentNode.removeChild(carousel);
        }

        carousel = document.createElement("div");
        carousel.className = 'tvp-products-carousel';
        container.appendChild(carousel);

        var toRemove = container.getElementsByClassName('tvp-product');
        for (var j = 0; j < toRemove.length; j++) {
            toRemove[j].removeEventListener('click', productClick, false);
        }

        var productsHtml = "";
        for (var i = 0; i < data.length; i++) {
            var product = data[i];
            
            var isCampaignProduct = 'undefined' !== typeof product.entity;
            if (isCampaignProduct) {
              product.entity.analytics = product.analytics;
              product = product.entity;
              product.isCampaignProduct = true;
            }
            
            analyticsTrack("pi", product);

            product.className = "tvp-product" + (product.isCampaignProduct ? " tvp-ad" : "");
            product.title = !Utils.isEmpty(product.title) ? Utils.trimText(product.title, 50) : '';
            product.price = !Utils.isEmpty(product.price) ? Utils.trimPrice(product.price) : '';
            productsHtml += Utils.tmpl(config.templates['modal-content-mobile'].products,product);
        }

        carousel.innerHTML = productsHtml;

        var productsTitle = Utils.getByClass('tvp-products-text');
        productsTitle.innerHTML = "";
        if (hasData) {
            var tooltipHtml = "";
            if (config.products_info_tooltip && config.products_message.trim().length) {
              tooltipHtml = config.templates['modal'].tooltip + 
              '<span class="tvp-products-message">' + config.products_message + '</span>';
            }  
            productsTitle.innerHTML += config.products_headline_text + tooltipHtml;  
        }   

        productsTitle.onclick = function(){
          this.classList.contains('active') ? this.classList.remove('active') : this.classList.add('active');
        };

        if (window.parent) {
            window.parent.postMessage({
                event: eventPrefix + ':modal_resize',
                height: (el.offsetHeight + parseInt(config.iframe_modal_body_padding || '0')) + 'px'
            }, '*');
        }

        var toTrack = container.getElementsByClassName('tvp-product');
        for (var j = 0; j < toTrack.length; j++) {
            toTrack[j].addEventListener('click', productClick, false);
        }

        //We start loading our slick dependency here, it was breaking while rendering it dynamicaly.
        var startSlick = function() {
            if (!data.length || 1 > data.length) return;
            setTimeout(function() {
                var $el = $(carousel);
                var centerMode = data.length > 1 ? true : false;
                var centerPadding = hasData ? '20px' : "0px";

                var config = {
                    slidesToSlide: 1,
                    slidesToShow: 3,
                    arrows: false,
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

                config.centerMode = centerMode;
                config.centerPadding = centerPadding;
                
                if (data.length <= 5) {
                    var dotsHolderClass = "tvp-slider-dots-holder";
                    var dotsHolderElement = container.querySelector("." + dotsHolderClass);
                    if (dotsHolderElement) {
                        dotsHolderElement.parentNode.removeChild(dotsHolderElement);
                    }

                    dotsHolderElement = document.createElement("div");
                    dotsHolderElement.className = dotsHolderClass;
                    container.querySelector(".tvp-products-headline").appendChild(dotsHolderElement);

                    config.appendDots = dotsHolderElement;
                    config.dots = true;
                    config.dotsClass = "tvp-slider-dots";
                }

                $el.on('init', function() {
                    container.classList.add('enabled');
                });

                $el.on('setPosition', function() {
                    setTimeout(function() {
                        if (window.parent) {
                            window.parent.postMessage({
                                event: eventPrefix + ':modal_resize',
                                height: (el.offsetHeight + parseInt(config.iframe_modal_body_padding || '0')) + 'px'
                            }, '*');
                        }
                    }, 0);
                });
                
                $el.slick(config);

            }, 10);
        };

        if ('undefined' === typeof $.fn.slick) {
            $.ajax({
                dataType: 'script',
                cache: true,
                url: document.body.getAttribute('data-domain') + '/carousel/js/vendor/slick-min.js'
            }).done(startSlick);
        } else {
            startSlick();
        }
    };

    var initialize = function() {
        var el = Utils.getByClass('iframe-content');
        
        var handleVideoProducts = function(video){
          if (settings.merchandise && video) {
            
            var endWith = function(productsData){
              setTimeout(function(){
                checkProducts(productsData,el);
                render(productsData,settings);
              },0);
            };
            
            var videoId = video.id || video.assetId;
            var videoProducts = Utils.isset(video,'products') ? video.products : null;
            if (videoProducts) {
              var videoProductsArray = createProductsArray(videoProducts);
              checkProducts(videoProductsArray,el);
              render(videoProductsArray,settings);
            } else if (settings.campaign && settings.product_spots_endpoint) {
              var xhr = new XMLHttpRequest();
              xhr.open('GET', settings.product_spots_endpoint + "&vd=" + videoId, true);
              xhr.onreadystatechange = function() {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                  var productSpots = [];
                  if (200 === xhr.status && xhr.responseText.length) {
                    productSpots = JSON.parse(xhr.responseText);
                  }
                  
                  loadProducts(videoId, settings, function(videoProducts){
                    endWith(productSpots.concat(videoProducts));
                  });
                }
              };
              xhr.send();
            } else {
              loadProducts(videoId, settings, endWith);
            }
          } else {
            el.classList.add('tvp-no-products');
            eventName = eventPrefix + ':modal_no_products';
            notify();
          }
        };

        var initPlayer = function(data) {
          data.runTime.loginId = data.runTime.loginId || data.runTime.loginid;
          var s = JSON.parse(JSON.stringify(data.runTime));

          s.data = data.data;

          s.onResize = function() {
              setTimeout(function() {
                  if (window.parent && !hasData) {
                      window.parent.postMessage({
                          event: eventPrefix + ':modal_resize',
                          height: (el.offsetHeight + parseInt(data.runTime.iframe_modal_body_padding || '0')) + 'px'
                      }, '*');
                  }
              }, 0);
          };

          s.onNext = function(nextVideo) {
              if (!nextVideo) return;
              
              handleVideoProducts(nextVideo);

              setTimeout(function() {
                  if (window.parent) {
                      window.parent.postMessage({
                          event: eventPrefix + ':player_next',
                          next: nextVideo
                      }, '*');
                  }
              }, 0);
          };

          var startVideo = data.selectedVideo;
          if ('undefined' !== typeof startVideo.entity) {
            startVideo = startVideo.entity;
          }

          new Player('tvp-player-el', s, startVideo.id);
        };

        window.addEventListener('message', function(e) {
            if (!e || !Utils.isset(e, 'data') || !Utils.isset(e.data, 'event')) return;
            var data = e.data;

            if (eventPrefix + ':modal_data' === data.event) {
                initPlayer(data);

                settings = data.runTime;
                settings.loginId = settings.loginId || settings.loginid;

                channelId = Utils.isset(settings.channel) && Utils.isset(settings.channel.id) ? settings.channel.id : (settings.channelId || settings.channelid);

                analytics = new Analytics();
                analytics.initConfig({
                    logUrl: settings.api_base_url + '/__tvpa.gif',
                    domain: Utils.isset(location, 'hostname') ? location.hostname : '',
                    loginId: settings.loginId
                });
                
                handleVideoProducts(data.selectedVideo);
            }
        });
        //Notify when the widget has been initialized.
        setTimeout(function() {
            if (window.parent) {
                window.parent.postMessage({
                    event: eventPrefix + ':modal_initialized',
                    height: (el.offsetHeight + 20) + 'px'
                }, '*');
            }
        }, 0);
    };

    var not = function(obj) {
        return 'undefined' === typeof obj
    };
    if (not(window.TVPage) || not(window._tvpa) || not(window.jQuery) || not(window.Utils) || not(window.Analytics) || not(window.Player)) {
        var libsCheck = 0;
        (function libsReady() {
            setTimeout(function() {
                if (not(window.TVPage) || not(window._tvpa) || not(window.jQuery) || not(window.Utils) || not(window.Analytics) || not(window.Player)) {
                    (++libsCheck < 200) ? libsReady(): console.warn('limit reached');
                } else {
                    initialize();
                }
            }, 150);
        })();
    } else {
        initialize();
    }

}(window, document));
