define(function(require) {

    var $ = require("jquery-private");
    require("iscroll");

    var CSS = require('text!dist/css/main.css');
    if (!$('#tvp-css-lib').length) {
      $('<style/>').attr('id', "tvp-css-lib").html(CSS).appendTo('head');
    }

    var TVSite = {};
    var CONFIG = {"loginId":"1758881","apiUrl":"\/\/app.tvpage.com", channelId: "81979997"};

    window.TVStore = {
        cache: {
            fullscreen: false,
            currentVideo: null,
            channelsAccordionState: false
        },
        lastPageReached: false,
        pointerLocation: 0,
        page: 0,
        fetchPage: 0,
        haveMoreVideos: false,
        videoTemplate: '<div data-tvp-video-id="{id}" data-index="{id}" class="tvp-video tvp-col-3"><div class="tvp-video-image" style="background-image:url(\'{asset.thumbnailUrl}\')"><div class="video-overlay"></div><div class="tvp-video-play-button"></div></div><div class="title">{title}</div></div>',
        initialize: function(){

            this.initializePlayer();
            this.videoClick();
            this.initializeProductScrollerX();
            this.initializeProductScrollerY();

            TVSite.videos = [];
            TVSite.displayedVideos = [];

            var THAT = this;
            $(document).on('click', '.lb-close', function(e){
                $('.lb-overlay').hide();
                $('#lightbox').addClass('off');
                THAT.hideHTML5PlayBtn();
                window.TVPlayer.stop();
            });

            $(document).on('click', '.lb-overlay', function(e){
                $('.lb-overlay').hide();
                $('#lightbox').addClass('off');
                THAT.hideHTML5PlayBtn();
                window.TVPlayer.stop();
            });

            $(document).on('click', '#view-more-button', function(e){
                THAT.checkMoreVideos(true).done(function(){
                    if(THAT.haveMoreVideos){
                        THAT.haveMoreVideos = false;
                        THAT.page++;
                        THAT.getVideos();
                    }
                });
                if(THAT.lastPageReached){
                    THAT.videosInLoop(THAT.pointerLocation);
                }
            });

        },

        initializeProductScrollerX: function(){
            var that = this;
            var sel = '#mobile-products #scroller-wrapper';
            if($(sel).length){
                this.cache.productScrollerX = new IScroll(sel, {
                    scrollX: true,
                    scrollY: false,
                    bounce: false,
                    useTransition: false,
                    bindToWrapper: true,
                    click: true
                });
                setTimeout(function(){
                    $('#mobile-products #scroller').css('width', $('#mobile-products-list').width());
                    that.cache.productScrollerX.refresh();
                },500);
            }
        },

        initializeProductScrollerY: function(){
            var sel = '#desktop-products #scroller-wrapper';
            if($(sel).length){
                this.cache.productScrollerY = new IScroll(sel, {
                    mouseWheel: true,
                    scrollbars: true,
                    interactiveScrollbars: true,
                    useTransition: false,
                    bindToWrapper: true,
                    click: true
                });
            }
        },

        isMobile: function(){
            if ($(window).width() < 768) {
                return true;
            } else {
                return false;
            }
        },

        resizePlayer: function(){
            var $player = $('#tvpp-holder');
            if(window.TVPlayer){
                TVPlayer.resize($player.width(), $player.height());
            }
        },

        bindWindowEvents: function(){
            var that = this;
            if (!$('body').hasClass('search-page')){
                BigScreen.onchange = function() {
                    that.cache.fullscreen = !that.cache.fullscreen;
                };
                $(window).resize(function(){
                    if (!that.cache.fullscreen) {
                        that.resizePlayer();
                    }
                });
            }
            if (this.isMobile()) {
                var THAT = this;
                window.matchMedia('(orientation: portrait)').addListener(function(m) {
                    $('#mobile-channels #scroller').width(99999);
                    var width = $('#mobile-channels-list').width();
                    $('#mobile-channels #scroller').css('width', width);
                    THAT.refreshMobileProductScroller();
                    THAT.resizePlayer();
                    THAT.handleAdBanner(products);
                });
            }
        },

        getVideos: function(){
            var THAT = this;
            THAT.fetchPage = THAT.page;
            $.ajax({
                url: '//app.tvpage.com/api/channels/' + CONFIG.channelId + '/videos',
                dataType: 'jsonp',
                data : {
                    p: THAT.page,
                    n: 6,
                    'X-login-id': CONFIG.loginId
                },
                success: function(res){
                    $('#videos').html('');
                    if(res.length < 6 && res.length > 0){
                        THAT.lastPageReached = true;
                        $('#videos').html('');
                        for(var i=0; i<res.length; i++){
                            TVSite.displayedVideos.push(res[i]);
                        }
                        var restVideos = 6 - res.length;
                        for(var i=0; i<restVideos; i++){
                            TVSite.displayedVideos.push(TVSite.videos[i]);
                        }
                        THAT.renderSearchResults(TVSite.displayedVideos);
                        for(var i=0; i<res.length; i++){
                            TVSite.videos.push(res[i]);
                        }
                    }else if(res.length == 6){
                        $('#videos').html('');
                        THAT.renderSearchResults(res);
                        for(var i=0; i<res.length; i++){
                            TVSite.videos.push(res[i]);
                        }
                    }
                    THAT.pointerLocation = res.length;
                    $('#videos').append('<button id="view-more-button"><span class="view-more">VIEW MORE</span></button>');
                }
            });
        },

        initializeVideos: function(){
            var THAT = this;
            THAT.fetchPage = THAT.page;
            $.ajax({
                url: '//app.tvpage.com/api/channels/' + CONFIG.channelId + '/videos',
                dataType: 'jsonp',
                data : {
                    p: THAT.page,
                    n: 6,
                    'X-login-id': CONFIG.loginId
                },
                success: function(res){
                    if(res.length < 6 && res.length > 0){
                        $('#videos').html('');
                        THAT.renderSearchResults(res);
                        for(var i=0; i<res.length; i++){
                            TVSite.videos.push(res[i]);
                        }
                    } else if(res.length == 6){
                        $('#videos').html('');
                        THAT.renderSearchResults(res);
                        for(var i=0; i<res.length; i++){
                            TVSite.videos.push(res[i]);
                        }
                        $('#videos').append('<button id="view-more-button"><span class="view-more">VIEW MORE</span></button>');
                    }
                }
            });
        },

        videosInLoop: function(pointer){
            $('#videos').html('');
            TVSite.newArray = [];
            if(pointer == TVSite.videos.length){
                pointer = 0;
            }
            var limit = pointer + 6;
            if(limit > TVSite.videos.length){
                var limit1 = limit - TVSite.videos.length;
                var limit2 = limit - limit1;
                for(var i=pointer; i<limit2; i++){
                    TVSite.newArray.push(TVSite.videos[i]);
                }
                if(limit2 == TVSite.videos.length){
                    pointer = 0;
                }
                for(var i=pointer; i<limit1; i++){
                    TVSite.newArray.push(TVSite.videos[i]);
                }
                this.renderSearchResults(TVSite.newArray);

                this.pointerLocation = limit1;
            }else{
                for(var i=pointer; i<limit; i++){
                    TVSite.newArray.push(TVSite.videos[i]);
                }
                this.renderSearchResults(TVSite.newArray);
                this.pointerLocation = limit;
            }

            $('#videos').append('<button id="view-more-button"><span class="view-more">VIEW MORE</span></button>');
        },

        checkMoreVideos: function(response){
            var THAT = this;
            this.fetchPage++;
            return $.ajax({
                url: '//app.tvpage.com/api/channels/' + CONFIG.channelId + '/videos',
                dataType: 'jsonp',
                data : {
                    p: THAT.fetchPage,
                    n: 6,
                    'X-login-id': CONFIG.loginId
                },
                success: function(res){
                    if(res.length > 0){
                        THAT.haveMoreVideos = true;
                    }else{
                        THAT.haveMoreVideos = false;
                    }
                }
            });
        },

        renderVideosRow: function(row) {
            var html = '<div class="tvp-clearfix">', i = 0;

            for ( i; i < row.length; i++ ) {
                var video = row[ i ];
                if((video.hasOwnProperty('short_title')) && (video.title.length > 42) && (video.short_title != null)){
                    video.title = video.short_title;
                }
                html += this.tmpl( this.videoTemplate, row[ i ] );
            }
            if(row.length == 1){
                html += '<div class="tvp-col-3"><div id="no-image" class="tvp-video-image"></div><div class=no-title-1></div><div class="no-title-2"></div></div>'
            }
            return html + '</div>';
        },

        renderVideoRows: function(rows, target){
            if ( rows && rows.length && ('undefined' !== typeof target) ) {
                var html = '', i = 0, j = 0;
                for ( i; i < rows.length; i++ ) {
                    html += this.renderVideosRow( rows[ i ] );
                }
                if(rows.length != 3){
                    var length = 3 - rows.length;
                    for ( j; j < length; j++ ) {
                        html += '<div class="tvp-clearfix"><div class="tvp-col-3"><div id="no-image" class="tvp-video-image"></div><div class=no-title-1></div><div class="no-title-2"></div></div><div class="tvp-col-3"><div id="no-image" class="tvp-video-image"></div><div class=no-title-1></div><div class="no-title-2"></div></div></div>'
                    }
                }
                if ( 'function' === typeof target ) return target( html );
                $(target).append(html);
            }
        },

        renderSearchResults: function( data ){
            var cloneVideos = data.slice(0);
            var rows = this.rowerize( cloneVideos );
            this.renderVideoRows( rows, '#videos');
        },

        rowerize: function(data, per){
            if (data && $.isArray(data)) {
                var raw = data.slice(0), rows = [];
                while ( raw.length ) rows.push(raw.splice(0, per || 2));
                return rows;
            }
        },

        tmpl: function(template, data) {
            if (template && 'object' == typeof data) {
                return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
                    var keys = key.split("."), v = data[keys.shift()];
                    for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
                    return (typeof v !== "undefined" && v !== null) ? v : "";
                });
            }
        },

        videoClick: function(){
            var THAT = this;
            this.noProductVideoClicked = false;
            $(document).on('click', '.tvp-video', function(e){
                e.preventDefault();

                $('.lb-overlay').show();
                $('#lightbox').removeClass('off');

                var vid = $(e.currentTarget).attr('data-index');
                var video = THAT.searchVideoInObject(vid);
                var videoData = THAT.getVideoData(video);
                $('.lb-title').html(video.title);
                THAT.playVideo(videoData);
                THAT.getProducts(video.id).done(function(products){
                    THAT.handleAdBanner(products);
                });
            });
        },

        getProducts: function(videoId){
            return $.ajax({
                type: 'GET',
                url: "//app.tvpage.com/api/videos/" + videoId + '/products',
                dataType: 'jsonp',
                data: {
                    'X-login-id': CONFIG.loginId
                }
            });
        },

        handleAdBanner: function(products){
            var THAT = this;
            if(products.length > 0){
                if(this.noProductVideoClicked){
                    if(this.isMobile()){
                        $('.no-products-banner').hide();
                        $('.recommeded-products').show();
                        $('#mobile-products').show();
                    }else{
                        $('.no-products-banner').hide();
                        $('.related-products').show();
                        $('#desktop-products').show();
                        $('#tvpp').css('width', '84%');
                        $('.lb-content').css('height','394px');
                    }
                }
                this.renderProducts(products);
                setTimeout(function(){
                    THAT.cache.productScrollerY.refresh();
                },0);
            }else{
                this.noProductVideoClicked = true;
                if(this.isMobile()){
                    $('.recommeded-products').hide();
                    $('#mobile-products').hide();
                    var url = 'url(' + '//www-bleeping-computer-com.netlify.com/img/noProductAdMobile.png' + ')';
                }else{
                    $('.related-products').hide();
                    $('#desktop-products').hide();
                    $('#tvpp').css('width', '100%');
                    $('.lb-content').css('height','579px');
                    var url = 'url(' + '//www-bleeping-computer-com.netlify.com/img/noProductAdDesktop.png' + ')';
                }
                $('.no-products-banner').show();
                $('.no-products-banner').css('background-image', url);
            }
            this.resizePlayer();
        },

        renderProducts: function(products){
            var s = '';
            var bpcheck = window.innerWidth < 767;
            var pref = bpcheck ? 'mobile' : 'desktop';
            var that = this;
            if(bpcheck){
                this.refreshMobileProductScroller();
            }

            this.renderPopUps(products);
            for (var i = 0, l = products.length; i < l; i++) {
                var offered = products[i].Web_Offered;
                var disabled = products[i].Web_Disabled;
                if (!((offered == "N") || (disabled == "Y"))){
                    var data = products[i].data;
                    var array = JSON.parse(data);
                    s += '<li>\
                       <a href="'+array.linkUrl+'" target="_blank">\
                         <div id="p-'+i+'" class="product" data-video-id="'+products[i].entityIdParent+'" data-id="'+products[i].id+'">\
                           <div class="product-img" style="background-image:url('+array.imageUrl+')">\
                             <img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="'+products[i].title+'" />\
                           </div>\
                         </div>\
                       </a>\
                     </li>';
                }
            }
            $('#desktop-products-list,#mobile-products-list')
              .empty()
              .append(s);
            this.bindProductEvents();
        },

        renderPopUps: function(products){
            var s = '';
            for (var i = 0, l = products.length; i < l; i++) {
                var price = 0;
                var data = products[i].data;
                var array = JSON.parse(data);
                var priceHtml = '<div class="price">';
                if (array.price) {
                    price = array.price.toString().replace(/[^0-9.]+/g, '');
                    price = parseFloat(price).toFixed(2);
                    if (price > 0) {
                        priceHtml+= '$'+price;
                    }
                }
                priceHtml += '</div>';

                s += '<div id="ppu-'+i+'" class="pop-up">\
                  <a class="img-link" href="'+array.linkUrl+'" target="_blank" data-video-id="'+products[i].entityIdParent+'" data-id="'+products[i].id+'"><img class="img-responsive" src="'+array.imageUrl+'" alt="'+products[i].title+'"><h4 class="product-title">'+products[i].title+'</h4>'+ priceHtml +'</a>\
                  ' +'<a class="call-to-action" href="'+array.linkUrl+'" target="_blank" data-video-id="'+products[i].entityIdParent+'" data-id="'+products[i].id+'">'+ 'VIEW DETAILS'+ '<span class="material-icon"></span>'  + '</a>\
                </div>';
            }

            var arrows = '<div class="pop-up-before"></div><div class="pop-up-after"></div>';

            $('#product-pop-ups')
              .empty()
              .append(arrows)
              .append(s);
        },

        bindProductEvents: function(){
            var that = this;
            var $dproducts = $('#desktop-products');
            $dproducts.find('.product')
              .on('mouseover click', function(e){
                  e.preventDefault();
                  var id = this.id.split('-')[1];
                  if ($('#ppu-' + id).css('display') !== 'none') {
                      that.clearPopUps();
                      return;
                  }

                  var popupBottomEdge = $(this).offset().top + $('.pop-up').height();
                  var playerBottomEdge = $('.lb-content').offset().top + $('.lb-content').height();

                  var $wrapper = $('.lb-body');
                  var arrowTop = ($(this).offset().top - $wrapper.offset().top) + 19;
                  if (arrowTop < 0) {
                      arrowTop = 10;
                  }
                  if (arrowTop > $wrapper.height()) {
                      arrowTop = $wrapper.height() - 10;
                  }

                  $('.pop-up-before').css({
                      top: arrowTop + 2
                  }).show();
                  $('.pop-up-after').css({
                      top: arrowTop + 1
                  }).show();

                  that.clearPopUps();
                  that.showPopUp(id, top);
              });

            $('.pop-up').off().on('mouseleave', function(e){
                e.preventDefault();
                that.clearPopUps();
            });

            $('.products-holder').on('mouseleave', function(e){
                e.preventDefault();
                that.clearPopUps();
            });

        },

        clearPopUps: function() {
            var $p = $('.pop-up:visible');
            if ($p.length) {
                $p.hide();
            }
            $('.pop-up-before,.pop-up-after').hide();
        },

        showPopUp: function(id, top) {
            var THAT = this;
            var $p = $('#ppu-' + id);

            if ($p.length) {
                $p
                  .css({ top: top })
                  .show();
                $('.pop-up-before,.pop-up-after').show();
            }

        },

        refreshMobileProductScroller:function() {
            var that = this;

            $('#mobile-products #scroller').css('width', 9000);
            setTimeout(function(){
                $('#mobile-products #scroller').css('width', $('#mobile-products-list').width());
                that.cache.productScrollerX.refresh();
            }, 100);

        },

        searchVideoInObject: function(vid){
            var videos = TVSite.videos;
            for (var i = 0, l = videos.length; i < l; i++) {
                if (videos[i].id == vid) {
                    return videos[i];
                }
            }
        },

        initializePlayer: function(){
            var that = this;
            $.ajax({ dataType: 'script', cache: true, url: '//d2kmhr1caomykv.cloudfront.net/player/assets/tvp/tvp-1.8.4-min.js' }).done(function() {
              if (window.TVPage) {
                that.bindWindowEvents();
                window.TVPlayer = new TVPage.player({
                  divId: 'tvpp-holder',
                  swf: '//d2kmhr1caomykv.cloudfront.net/player/assets/tvp/tvp-1.8.4-flash.swf',
                  displayResolution: that.isMobile() ? '360p' : '480p',
                  analytics: { tvpa: true },
                  techOrder: 'html5,flash',
                  apiBaseUrl: '//app.tvpage.com',
                  onError: function(e){ console.log(e); },
                  controls:{
                    active: true,
                    seekBar: { progressColor:'#00aef0' },
                    floater: {
                      removeControls:['tvplogo', 'hd']
                    }
                  }
                });
                TVPlayer.on('tvp:media:ready', function(){
                  that.initializeVideos();
                });
              }
            });
        },

        playVideo: function(video) {
            if (this.isMobile()) {
                this.showHTML5PlayBtn(video);
                TVPlayer.cueVideo(video);
            } else {
                TVPlayer.loadVideo(video);
            }
        },

        showHTML5PlayBtn: function(video){
            if (video.type === 'mp4') {
                var $btn = $('#html5MobilePlayBtn');
                $btn.show();
                var THAT = this;
                $btn.on('click',function(){
                    window.TVPlayer.play();
                    THAT.hideHTML5PlayBtn();
                });
            }
        },

        hideHTML5PlayBtn: function() {
            var $btn = $('#html5MobilePlayBtn');
            if ($btn.length) {
                $btn.hide();
                $btn.off();
            }
        },

        getVideoData: function(video){
            var data;
            if (video.data) {
                if ( 'string' === typeof video.data ) {
                    var parsed = JSON.parse(video.data);
                    if ('object' === typeof parsed) {
                        data = parsed.asset;
                    }
                }
            } else if (video.asset) {
                data = video.asset;
            }
            data.sources = data.sources || [{file: data.videoId}];
            data.type = data.type || 'youtube';
            data.analyticsObj = {
                vd: video.id,
                li: CONFIG.loginId,
                pg: CONFIG.channelId
            };
            return data;
        }
    };

    $(function(){
      var lightBoxTemplate = '<div id="tvplb"><div class="lb-content"><div class="lb-close"></div><div class="lb-header"><div class="related-products">Related Products</div><h4 class="lb-title"></h4></div><div class="lb-body"></div><div class="no-products-banner"></div></div><div id="lb-overlay" class="lb-overlay"></div></div>';
      $("#tvp-gallery").append( '<div class="cz-line-heading"><div class="cz-line-heading-inner">Recommended Videos</div></div><div id="videos"></div><div id="lightbox" class="off">'+lightBoxTemplate+'</div><a class="tvplogo" class="tvp-clearfix" href="//www.tvpage.com" target="_blank"></a>' ).addClass("tvp-clearfix");

      var playerTemplate = '<div id="tvpp"><div id="html5MobilePlayBtn" class="html5-play-button"></div><div class="tvpp-wrapper"><div id="tvpp-holder" class="tvpp-holder"></div><div class="video-overlay"></div></div></div>';
      var productsTemplate = '<div class="recommeded-products">Recommended Products</div><div id="mobile-products"><div><div><div id="scroller-wrapper" class="x-scroll"><div id="scroller" class="scroll-area"><ul id="mobile-products-list" class="products-list"></ul></div></div></div></div></div><div id="desktop-products" class="products"><div class="products-holder"><div id="scroller-wrapper" class="y-scroll"><div id="scroller" class="scroll-area"><ul id="desktop-products-list"></ul></div></div><div id="product-pop-ups"></div></div></div>';
      var initialTemplate = '<div class="tvp-clearfix"><div class="tvp-col-3"><div id="no-image" class="tvp-video-image"></div><div class=no-title-1></div><div class="no-title-2"></div></div><div class="tvp-col-3"><div id="no-image" class="tvp-video-image"></div><div class=no-title-1></div><div class="no-title-2"></div></div></div><div class="tvp-clearfix"><div class="tvp-col-3"><div id="no-image" class="tvp-video-image"></div><div class=no-title-1></div><div class="no-title-2"></div></div><div class="tvp-col-3"><div id="no-image" class="tvp-video-image"></div><div class=no-title-1></div><div class="no-title-2"></div></div></div><div class="tvp-clearfix"><div class="tvp-col-3"><div id="no-image" class="tvp-video-image"></div><div class=no-title-1></div><div class="no-title-2"></div></div><div class="tvp-col-3"><div id="no-image" class="tvp-video-image"></div><div class=no-title-1></div><div class="no-title-2"></div></div></div>';

      setTimeout(function(){
        $('.lb-body').append(playerTemplate + productsTemplate);
        $('#videos').append(initialTemplate);

        TVStore.initialize();
      },0);

    });

    return false;

});