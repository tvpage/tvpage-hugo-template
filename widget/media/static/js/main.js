(function(window, document, $, IScroll, TVPage){
  $(function() {
    'use strict';

    // Login headers setup
    $.ajaxSetup({
      headers: {
        'X-Login-Id': window.TVSite.config.loginId
      }
    });

    window.TVStore = {
      cache: {
        fullscreen: false,
        currentVideo: null,
        channelsAccordionState: false
      },
      videoTemplate: '<div data-tvp-video-id="{id}" data-index="{id}" class="tvp-video col-3"><div class="tvp-video-image" style="background-image:url(\'{asset.thumbnailUrl}\')"><div class="video-overlay"></div><div class="tvp-video-play-button"></div></div><div class="title">{title}</div></div>',
      lightBoxTemplate : '<div id="tvplb"><div class="lb-content"><div class="lb-close"></div><div class="lb-header"><div class="related-products">Related Products</div><h4 class="lb-title"></h4></div><div class="lb-body"></div><div class="no-products-banner"></div></div><div id="lb-overlay" class="lb-overlay"></div></div>',
      playerTemplate : '<div id="tvpp"><div class="tvpp-wrapper"><div id="tvpp-holder" class="tvpp-holder"></div><div class="video-overlay"></div></div></div>',
      productsTemplate : '<div class="recommeded-products">Recommended Products</div><div id="mobile-products"><div><div><div id="scroller-wrapper" class="x-scroll"><div id="scroller" class="scroll-area"><ul id="mobile-products-list" class="products-list"></ul></div></div></div></div></div><div id="desktop-products" class="products"><div class="products-holder"><div id="scroller-wrapper" class="y-scroll"><div id="scroller" class="scroll-area"><ul id="desktop-products-list"></ul></div></div><div id="product-pop-ups"></div></div></div>',
      initialize: function(){
        $('#lightbox').html(this.lightBoxTemplate);
        $('.lb-body').append(this.playerTemplate);
        $('.lb-body').append(this.productsTemplate);
        this.loadVideos();
        this.videoClick();
        this.initializePlayer();
        this.initializeProductScrollerX();
        this.initializeProductScrollerY();
        this.bindWindowEvents();

        $('#lightbox').hide();
        $(document).on('click', '.lb-close', function(e){
          $('.lb-overlay').hide();
          $('#lightbox').hide();
        });
        $(document).on('click', '.lb-overlay', function(e){
          $('.lb-overlay').hide();
          $('#lightbox').hide();
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
            var width = $('#mobile-products-list').width();
            $('#mobile-products #scroller').css('width', width);
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
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
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
          window.matchMedia('(orientation: portrait)').addListener(function(m) {
            $('#mobile-channels #scroller').width(99999);
            var width = $('#mobile-channels-list').width();
            $('#mobile-channels #scroller').css('width', width);

          });
        }

      },
      
      loadVideos: function(){
        var THAT = this;
        $.ajax({
          url: 'http://local.tvpage.com/api/channels/videos/' + window.TVSite.config.channelId,
          dataType: 'jsonp',
          success: function(res){
            THAT.renderSearchResults( res );
            TVSite.videos = res;
          }
        });

      },

      renderVideosRow: function(row) {
        var html = '<div class="row clearfix">', i = 0;
        for ( i; i < row.length; i++ ) {
          var video = row[ i ];
          html += this.tmpl( this.videoTemplate, row[ i ] );
        }
        return html + '</div>';
      },

      renderVideoRows: function(rows, target){
        if ( rows && rows.length && ('undefined' !== typeof target) ) {
          var html = '', i = 0;
          for ( i; i < rows.length; i++ ) {
            html += this.renderVideosRow( rows[ i ] );
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
          $('#lightbox').show();
          var vid = $(e.currentTarget).attr('data-index');
          var video = THAT.searchVideoInObject(vid);
          var videoData = THAT.getVideoData(video);
          $('.lb-title').html(video.title);
          THAT.playVideo(videoData);

          THAT.getProducts(video.id).done(function(products){
            
            if(products.length > 0){
              if(THAT.noProductVideoClicked){
                $('.no-products-banner').hide();
                $('.related-products').show();
                $('#desktop-products').show();
                $('#tvpp').css('width', '84%');
                $('.lb-content').css({'height':'428px','width':'817px'});
                THAT.resizePlayer();
              }
              // THAT.mobileProductsClickBinded = false;
              // THAT.desktopProductsClickBinded = false;
              THAT.renderProducts(products);
              // THAT.bindProductClicks();
              setTimeout(function(){
                THAT.cache.productScrollerY.refresh();
              },0);
            }else{
              THAT.noProductVideoClicked = true;
              $('.related-products').hide();
              $('#desktop-products').hide();
              $('#tvpp').css('width', '100%');
              $('.lb-content').css({'height':'579px','width':'768px'});
              THAT.resizePlayer();
              if(THAT.isMobile()){
                var url = 'url(' + window.location + '/img/noProductAdMobile.png' + ')';
              }else{
                var url = 'url(' + window.location + '/img/noProductAdDesktop.png' + ')';
              }

              $('.no-products-banner').show();
              $('.no-products-banner').css('background-image', url);
            }

          });

        });
      },

      getProducts: function(videoId){
          return $.ajax({
          type: 'GET',
          url: "http://local.tvpage.com/api/videos/products/"+videoId,
          dataType: 'jsonp'
        });
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
               // TVPageAnalytics.registerProductImpression(products[i]);
             }
        }
        $('#desktop-products-list,#mobile-products-list')
        .empty()
        .append(s);
        this.bindProductEvents();
        // this.productBannerToggle(products);
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
          var top = $(this).offset().top - $dproducts.offset().top;
          if ($('#ppu-' + id).css('display') !== 'none') {
            that.clearPopUps();
            return;
          }

          var popupBottomEdge = $(this).offset().top + $('.pop-up').height();
          var playerBottomEdge = $('.lb-content').offset().top + $('.lb-content').height();
          if (top < 0) {
            top = 0;
          }else if(popupBottomEdge > playerBottomEdge){
             var excess = popupBottomEdge - playerBottomEdge;
             top = top - excess - 42;
          }

          var $wrapper = $('.lb-body');
          var arrowTop = ($(this).offset().top - $wrapper.offset().top) + 19;
          if (arrowTop < 0) {
            arrowTop = 10;
          }
          if (arrowTop > $wrapper.height()) {
            arrowTop = $wrapper.height() - 10;
          }
          
          $('.pop-up-before').css({
            top: arrowTop + 1
          }).show();
          $('.pop-up-after').css({
            top: arrowTop
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

          window.TVPlayer = new TVPage.player({
            divId: 'tvpp-holder',
            swf: '//d2kmhr1caomykv.cloudfront.net/player/assets/tvp/tvp-1.7.3-flash.swf',
            displayResolution: this.isMobile() ? '360p' : '480p',
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

      },

      playVideo: function(video) {
        if (this.isMobile()) {
          // this.showHTML5PlayBtn(video);
          TVPlayer.cueVideo(video);
        } else {
          TVPlayer.loadVideo(video);
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
          li: TVSite.config.loginId,
          pg: 0,
          url: encodeURIComponent(window.top.location.href)
        };
        return data;
      },



    };

    TVStore.initialize();

    
  });
}(window, document, jQuery, IScroll, TVPage));