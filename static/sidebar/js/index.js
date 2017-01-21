define(function(require) {

  var $ = require("jquery-private");
  var IScroll = require("iscroll");

  var CSS = require('text!css/styles.css');
  if (!$('#tvp-css-lib').length) {
    $('<style/>').attr('id', "tvp-css-lib").html(CSS).appendTo('head');
  }

  var TVSite = {};
  var videosList = [];
  var displayedVideos = [];
  var holderId = Object.keys(__TVPage__.config).toString();
  var CONFIG = {
    apiUrl: "\/\/api.tvpage.com\/v1",
    products: "show"
  };

  var redefine = function(o,p){return "undefined" !== typeof o[p];};
  
  if (redefine(window,'__TVPage__') && redefine(__TVPage__,'config')) {
    CONFIG = $.extend({}, CONFIG, __TVPage__.config[holderId]);
  }

  var cleanVideos = function(){ $('#tvp-videos').off().html('') };
  var sendAnalitics = function(data, type) {
    if ('object' === typeof data && type) {
      if (window._tvpa) {
        return _tvpa.push(['track', type, $.extend(data, {
          li: CONFIG.loginId,
          pg: CONFIG.channelId
        })]);
      }
    }
  };

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
    haveMoreVideos: true,
    videoTemplate: '<div data-tvp-video-id="{id}" data-index="{id}" class="tvp-video "><div class="tvp-video-image" style="background-image:url(\'{asset.thumbnailUrl}\')"><div class="tvp-video-overlay"></div><div class="tvp-video-play-button"></div></div><div class="tvp-title">{title}</div></div>',
    initialize: function() {
      this.initializePlayer();
      this.videoClick();
      if ("hide" !== CONFIG.products) {
        this.initializeProductScrollerX();
        this.initializeProductScrollerY();
      } else {
        $("#tvpp").addClass('full');
        $("#tvp-mobile-products").addClass('hide');
        $("#tvp-desktop-products").addClass('hide');
        $(".tvp-lb-content").addClass('products-hide');
      }
      
      var THAT = this;
      $(document).on('click', '.tvp-lb-close', function(e) {
        $('.tvp-lb-overlay').hide();
        $('#lightbox').addClass('off');
        THAT.hideHTML5PlayBtn();
        window.TVPlayer.stop();
        if (THAT.isMobile()) {
          $('.tvp-pagination').empty();
          THAT.cache.productScrollerX.goToPage(0, 0, 100);
        }
      });
      $(document).on('click', '.tvp-lb-overlay', function(e) {
        $('.tvp-lb-overlay').hide();
        $('#lightbox').addClass('off');
        THAT.hideHTML5PlayBtn();
        window.TVPlayer.stop();
        if (THAT.isMobile()) {
          $('.tvp-pagination').empty();
          THAT.cache.productScrollerX.goToPage(0, 0, 100);
        }
      });
      $(document).on('click', '#tvp-view-more-button', function(e) {
        THAT.fetchPage++;
        if (THAT.haveMoreVideos === true) {
          $.ajax({
            url: ''+CONFIG.apiUrl+'/channels/'+CONFIG.channel.id+'/videos',
            dataType: 'jsonp',
            data: {
              p: THAT.fetchPage,
              n: 6,
              'X-login-id': CONFIG.loginId
            }
          }).done(function(res) {
              if (res.length === 0) {
                THAT.haveMoreVideos = false;
                THAT.lastPageReached = true;
              } else {
                  cleanVideos()
                  for (var i = 0; i < res.length; i++) {
                    videosList.push(res[i]);
                  }
                  THAT.renderSearchResults(res);
                  THAT.haveMoreVideos = true;
              }
              THAT.pointerLocation = res.length;
          });
        }
        if (THAT.lastPageReached === true){
          THAT.videosInLoop(THAT.pointerLocation);
        } 
      });
      $(document).on('click', '.tvp-product', function(e) {
        var $link = $(this).closest('a');
        if ($link.length) {
          sendAnalitics({
            ct: $(this).data('id'),
            vd: $(this).data('videoId')
          }, 'pk');
          window.open($link.attr("href"), "_blank");
        }
      });
      $(document).on('click', '.tvp-img-link', function(e) {
        sendAnalitics({
          ct: $(this).data('id'),
          vd: $(this).data('videoId')
        }, 'pk');
      });
      $(document).on('click', '.tvp-call-to-action', function(e) {
        sendAnalitics({
          ct: $(this).data('id'),
          vd: $(this).data('videoId')
        }, 'pk');
      });
    },

    initializeProductScrollerX: function() {
      var that = this;
      var sel = '#tvp-mobile-products #scroller-wrapper';
      if ($(sel).length) {
        this.cache.productScrollerX = new IScroll(sel, {
          scrollX: true,
          scrollY: false,
          momentum:false,
          bindToWrapper: true,
          click: true,
          snap: true
        });
        setTimeout(function() {
          $('#tvp-mobile-products #scroller').css('width', $('#tvp-mobile-products-list').width());
           that.mobileOrientation();
           that.mobileOrientationListener();
          that.cache.productScrollerX.refresh();
        }, 500);
        this.cache.productScrollerX.on('scrollEnd', function() {
          var that = this;
          $('.tvp-pagination > span').each(function(key, value) {
            if (that.currentPage.pageX == key) {
              $(value).addClass('active');
            } 
            else {
              $(value).removeClass('active');
            }
          });
        });
      }
    },

    initializeProductScrollerY: function() {
      var sel = '#tvp-desktop-products #scroller-wrapper';
      if ($(sel).length) {
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

    isMobile: function() {
      if ($(window).width() < 768) {
        return true;
      } else {
        return false;
      }
    },

    resizePlayer: function() {
      var $player = $('#tvpp-holder');
      if (window.TVPlayer) {
        TVPlayer.resize($player.width(), $player.height());
      }
    },

    bindWindowEvents: function() {
      var that = this;
      if (!$('body').hasClass('search-page')) {
        BigScreen.onchange = function() {
          that.cache.fullscreen = !that.cache.fullscreen;
        };
        $(window).resize(function() {
          if (!that.cache.fullscreen) {
            that.resizePlayer();
          }
        });
      }
    },

    getVideos: function() {
      var THAT = this;
      THAT.fetchPage = THAT.page;
      $.ajax({
        url: ''+CONFIG.apiUrl+'/channels/' + CONFIG.channelId + '/videos',
        dataType: 'jsonp',
        data: {
          p: THAT.page,
          n: 6,
          'X-login-id': CONFIG.loginId
        },
        success: function(res) {
          cleanVideos()
          if (res.length < 6 && res.length > 0) {
            cleanVideos()
            for (var i = 0; i < res.length; i++) {
              displayedVideos.push(res[i]);
            }
            var restVideos = 6 - res.length;
            for (var i = 0; i < restVideos; i++) {
              displayedVideos.push(videosList[i]);
            }
            THAT.renderSearchResults(displayedVideos);
            for (var i = 0; i < res.length; i++) {
              videosList.push(res[i]);
            }
          } else if (res.length == 6) {
            cleanVideos()
            THAT.renderSearchResults(res);
            for (var i = 0; i < res.length; i++) {
              videosList.push(res[i]);
            }
          }
          THAT.pointerLocation = res.length;
        }
      });
    },

    initializeVideos: function() {
      var THAT = this;
      THAT.fetchPage = THAT.page;
      $.ajax({
        url: ''+CONFIG.apiUrl+'/channels/' + CONFIG.channel.id + '/videos',
        dataType: 'jsonp',
        data: {
          p: THAT.page,
          n: 6,
          'X-login-id': CONFIG.loginId
        },
        success: function(res) {
          if (res.length < 6 && res.length > 0) {
            cleanVideos()
            THAT.renderSearchResults(res);
            for (var i = 0; i < res.length; i++) {
              videosList.push(res[i]);
            }
          } else if (res.length == 6) {
            cleanVideos()
            THAT.renderSearchResults(res);
            for (var i = 0; i < res.length; i++) {
              videosList.push(res[i]);
            }
            var $btn = $('<button/>').attr('id','tvp-view-more-button').append($('<span/>').addClass('tvp-view-more').html('VIEW MORE'));
            $btn.appendTo('#'+holderId);
          }
        }
      });
    },

    videosInLoop: function(pointer) {
      cleanVideos()
      var newVideosList = [];
      if (pointer == videosList.length) {
        pointer = 0;
      }
      var limit = pointer + 6;
      if (limit > videosList.length) {
        var limit1 = limit - videosList.length;
        var limit2 = limit - limit1;
        for (var i = pointer; i < limit2; i++) {
          newVideosList.push(videosList[i]);
        }
        if (limit2 == videosList.length) {
          pointer = 0;
        }
        for (var i = pointer; i < limit1; i++) {
          newVideosList.push(videosList[i]);
        }
        this.renderSearchResults(newVideosList);

        this.pointerLocation = limit1;
      } else {
        for (var i = pointer; i < limit; i++) {
          newVideosList.push(videosList[i]);
        }
        this.renderSearchResults(newVideosList);
        this.pointerLocation = limit;
      }
    },

    renderVideosRow: function(row) {
      var html = '<div class="tvp-clearfix">';
      for (var i = 0; i < row.length; i++) {
        var video = row[i];
        if ((video.hasOwnProperty('short_title')) && (video.title.length > 42) && (video.short_title != null)) {
          video.title = video.short_title;
        }
        html += this.tmpl(this.videoTemplate, row[i]);
      }
      if (row.length == 1) {
        html += '<div class="tvp-col-3"><div id="tvp-no-image" class="tvp-video-image"></div><div class="tvp-no-title-1"></div><div class="tvp-no-title-2"></div></div>';
      }
      return html + '</div>';
    },

    renderVideoRows: function(rows, target) {
      if (rows && rows.length && ('undefined' !== typeof target)) {
        var html = '';
        for (var i = 0; i < rows.length; i++) {
          html += this.renderVideosRow(rows[i]);
        }
        if (rows.length != 3) {
          var length = 3 - rows.length;
          for (var j = 0; j < length; j++) {
            html += '<div class="tvp-clearfix"><div class="tvp-col-3"><div id="tvp-no-image" class="tvp-video-image"></div><div class="tvp-no-title-1"></div><div class="tvp-no-title-2"></div></div><div class="tvp-col-3"><div id="tvp-no-image" class="tvp-video-image"></div><div class="tvp-no-title-1"></div><div class="tvp-no-title-2"></div></div></div>';
          }
        }
        if ('function' === typeof target) return target(html);
        $(target).append(html);
      }
    },

    renderSearchResults: function(data) {
      var cloneVideos = data.slice(0);
      var rows = this.rowerize(cloneVideos);
      this.renderVideoRows(rows, '#tvp-videos');
    },

    rowerize: function(data, per) {
      if (data && $.isArray(data)) {
        var raw = data.slice(0),
          rows = [];
        while (raw.length) rows.push(raw.splice(0, per || 2));
        return rows;
      }
    },

    tmpl: function(template, data) {
      if (template && 'object' == typeof data) {
        return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
          var keys = key.split("."),
            v = data[keys.shift()];
          for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
          return (typeof v !== "undefined" && v !== null) ? v : "";
        });
      }
    },

    videoClick: function() {
      var THAT = this;
      this.noProductVideoClicked = false;
      var show = function() {
        $('.tvp-lb-overlay').show();
        $('#lightbox').removeClass('off');
      };
      $(document).on('click', '.tvp-video', function(e) {
        e.preventDefault();
        $('.tvp-lb-overlay').show();
        $('#lightbox').removeClass('off');
        var vid = $(e.currentTarget).attr('data-index');
        var video = THAT.searchVideoInObject(vid);
        var videoData = THAT.getVideoData(video);
        $('.tvp-lb-title').html(video.title);
        THAT.playVideo(videoData);
        if ("hide" !== CONFIG.products) {
          THAT.getProducts(video.id).done(function(products) {
            show()
            THAT.handleAdBanner(products);
            THAT.handlePagination(products);
          });
        } else {
          show();
        } 
      });
    },

    mobileOrientation: function(){
      if (this.isMobile()) {
        $(window).ready(function(){
          $('#tvpp').each(function(i, item){
            item = $(item);
            var itemWidth = item.width();
            var productWidth = $('#tvp-mobile-products-list > li');
            if (window.matchMedia('(orientation: portrait)').matches) {
              $(productWidth).css('width', itemWidth);
              $('.tvp-no-products-banner ').css('width', itemWidth);
              $('.tvp-no-products-banner ').css('height', '85px');
              $('#tvplb .tvp-lb-content').css({'height': '','width': ''});
            }else {
              $(productWidth).css('width', itemWidth);
              $('.tvp-no-products-banner ').css('width', itemWidth);
              $('.tvp-no-products-banner ').css('height', '85px');
              $('#tvplb .tvp-lb-content').css({'height': '100%','width': '60%'});
            }
          });
        });
      }
    },

    mobileOrientationListener: function(){
      if (this.isMobile()) {
        var THAT = this;
        $(window).resize(function(){
          $('#tvpp').each(function(i, item){
            item = $(item);
            var itemWidth = item.width();
            var productWidth = $('#tvp-mobile-products-list > li');
            if (window.matchMedia('(orientation: portrait)').matches) {
              $(productWidth).css('width',itemWidth);
              $('#tvplb .tvp-lb-content').css({'width': '','height': ''});
              $('.tvp-lb-close').css({'height': '','width': ''});
            }else {
              $(productWidth).css('width',itemWidth);
              $('#tvplb .tvp-lb-content').css({'height': '100%','width': '60%'});
              $('.tvp-lb-close').css({'height': '26px','width': '26px'});
            }
            THAT.refreshMobileProductScroller();
            THAT.resizePlayer();
          });
          if (THAT.isMobile()) {
            $('#tvp-recommended-products-wrapper').show('fast');
          }else{
            $('#tvp-recommended-products-wrapper').hide();
          }
        });
      }
    },

    getProducts: function(videoId) {
      return $.ajax({
        type: 'GET',
        url: ''+CONFIG.apiUrl+'/videos/'+videoId+'/products',
        dataType: 'jsonp',
        data: {
          'X-login-id': CONFIG.loginId
        }
      });
    },

    handlePagination: function(products) {
      if (this.isMobile()) {
        for (var i = 0, l = products.length; i < l; i++) {
          if (products.length > 1) {
            $('.tvp-pagination').append('<span class=' + (i == 0 ? "active" : "") + '></span>');
          }
        }
      }
      else{
        $('#tvp-recommended-products-wrapper').hide();
      }
    },

    handleAdBanner: function(products) {
      var THAT = this;
      if (products.length > 0) {
        $.each(products, function(index, product) {
          sendAnalitics({
            ct: product.id,
            vd: product.entityIdParent
          }, 'pi');
        });
        if (this.noProductVideoClicked) {
          if (this.isMobile()) {
            $('.tvp-no-products-banner').hide();
            $('.tvp-recommeded-products').show();
            $('#tvp-mobile-products').show();
          } else {
            $('.tvp-no-products-banner').hide();
            $('.tvp-related-products').show();
            $('#tvp-desktop-products').show();
            $('#tvpp').css('width', '84%');
            $('.tvp-lb-content').css('height', '394px');
          }
        }
        this.renderProducts(products);
        setTimeout(function() {
          THAT.cache.productScrollerY.refresh();
        }, 0);
      } else {
        this.noProductVideoClicked = true;
        if (this.isMobile()) {
          $('.tvp-recommeded-products').hide();
          $('#tvp-mobile-products').hide();
        } else {
          $('.tvp-related-products').hide();
          $('#tvp-desktop-products').hide();
          $('#tvpp').css('width', '100%');
          $('.tvp-lb-content').css('height', '579px');
          $("#tvpp").addClass('full');
          setTimeout(function() {
            $('.tvp-lb-content').css("opacity", 1);
          }, 0);
        }
        $('.tvp-no-products-banner').show();
      }
      this.resizePlayer();
    },

    renderProducts: function(products) {
      var s = '';
      var that = this;
      this.renderPopUps(products);
      for (var i = 0, l = products.length; i < l; i++) {
        var offered = products[i].Web_Offered;
        var disabled = products[i].Web_Disabled;
        if (!((offered == "N") || (disabled == "Y"))) {
          var price = 0;
          var data = products[i].data;
          var array = JSON.parse(data);
          var priceHtml = '<div class="tvp-price">';
          if (array.price) {
            price = array.price.toString().replace(/[^0-9.]+/g, '');
            price = parseFloat(price).toFixed(2);
            if (price > 0) {
              priceHtml += '$' + price;
            }
          }
          priceHtml += '</div>';
          if (that.isMobile()) {
            that.refreshMobileProductScroller();
            s += '<li><div id="p-' + i + '" class="tvp-product" data-video-id="' + products[i].entityIdParent + '" data-id="' + products[i].id + '"><div class="tvp-product-img" style="background-image:url(' + array.imageUrl + ')"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="' + products[i].title + '" /></div><div><h4 class="tvp-product-title">' + products[i].title + '</h4>' + priceHtml + '</div><a class="tvp-call-to-action" href="' + array.linkUrl + '" target="_blank" data-video-id="' + products[i].entityIdParent + '" data-id="' + products[i].id + '">' + 'VIEW DETAILS' + '<span class="tvp-material-icon"></span>' + '</a></div></li>';
          }else {
            s += '<li><a class="tvp-call-to-action" href="' + array.linkUrl + '" target="_blank"><div id="p-' + i + '" class="tvp-product" data-video-id="' + products[i].entityIdParent + '" data-id="' + products[i].id + '"><div class="tvp-product-img" style="background-image:url(' + array.imageUrl + ')"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="' + products[i].title + '" /></div></div></a></li>';
          }
        }
      }
      $('#tvp-desktop-products-list,#tvp-mobile-products-list')
        .empty()
        .append(s);
      that.bindProductEvents();
      that.mobileOrientation();
      that.mobileOrientationListener();
    },

    renderPopUps: function(products) {
      var s = '';
      for (var i = 0, l = products.length; i < l; i++) {
        var price = 0;
        var data = products[i].data;
        var array = JSON.parse(data);
        var priceHtml = '<div class="tvp-price">';
        if (array.price) {
          price = array.price.toString().replace(/[^0-9.]+/g, '');
          price = parseFloat(price).toFixed(2);
          if (price > 0) {
            priceHtml += '$' + price;
          }
        }
        priceHtml += '</div>';
        s += '<div id="ppu-' + i + '" class="tvp-pop-up"><a class="tvp-img-link" href="' + array.linkUrl + '" target="_blank" data-video-id="' + products[i].entityIdParent + '" data-id="' + products[i].id + '"><img class="img-responsive" src="' + array.imageUrl + '" alt="' + products[i].title + '"><h4 class="tvp-product-title">' + products[i].title + '</h4>' + priceHtml + '</a>' + '<a class="tvp-call-to-action" href="' + array.linkUrl + '" target="_blank" data-video-id="' + products[i].entityIdParent + '" data-id="' + products[i].id + '">' + 'VIEW DETAILS' + '<span class="tvp-material-icon"></span>' + '</a></div>';
      }
      var arrows = '<div class="tvp-pop-up-before"></div><div class="tvp-pop-up-after"></div>';
      $('#tvp-product-pop-ups')
        .empty()
        .append(arrows)
        .append(s);
    },

    bindProductEvents: function() {
      var that = this;
      var $dproducts = $('#tvp-desktop-products');
      $dproducts.find('.tvp-product')
        .on('mouseover click', function(e) {
          e.preventDefault();
          var id = this.id.split('-')[1];
          if ($('#ppu-' + id).css('display') !== 'none') {
            that.clearPopUps();
            return;
          }
          var $wrapper = $('.tvp-lb-body');
          var arrowTop = ($(this).offset().top - $wrapper.offset().top) +19;
          if (arrowTop < 0) {
            arrowTop = 10;
          }
          if (arrowTop > $wrapper.height()) {
            arrowTop = $wrapper.height() - 10;
          }
          $('.tvp-pop-up-before').css({
            top: arrowTop + 2
          }).show();
          $('.tvp-pop-up-after').css({
            top: arrowTop + 1
          }).show();
          that.clearPopUps();
          that.showPopUp(id, top);
        });

      $('.tvp-pop-up').off().on('mouseleave', function(e) {
        e.preventDefault();
        that.clearPopUps();
      });

      $('.tvp-products-holder').on('mouseleave', function(e) {
        e.preventDefault();
        that.clearPopUps();
      });
    },

    clearPopUps: function() {
      var $p = $('.tvp-pop-up:visible');
      if ($p.length) {
        $p.hide();
      }
      $('.tvp-pop-up-before,.tvp-pop-up-after').hide();
    },

    showPopUp: function(id, top) {
      var $p = $('#ppu-' + id);
      if ($p.length) {
        $p
          .css({
            top: top
          })
          .show();
        $('.tvp-pop-up-before,.tvp-pop-up-after').show();
      }
    },

    refreshMobileProductScroller: function() {
      var that = this;
      $('#tvp-mobile-products #scroller').css('width', 9000);
      setTimeout(function() {
        $('#tvp-mobile-products #scroller').css('width', $('#tvp-mobile-products-list').width());
        that.cache.productScrollerX.refresh();
      }, 100);
    },

    searchVideoInObject: function(vid) {
      var videos = videosList;
      for (var i = 0, l = videos.length; i < l; i++) {
        if (videos[i].id == vid) {
          return videos[i];
        }
      }
    },

    initializePlayer: function() {
      var that = this;
      //Load tvpage analytics library.
      $.ajax({
        dataType: 'script',
        cache: true,
        url: '//a.tvpage.com/tvpa.min.js'
      }).done(function() {
        var checks = 0;
        (function analyticsPoller() {
          setTimeout(function() {
            if ("undefined" === typeof window._tvpa) {
              if (++checks < 10) {
                analyticsPoller();
              } 
            } else {
              _tvpa.push(["config", {
                "li": CONFIG.loginId,
                "gaDomain": "bleepingcomputer.com",
                "logUrl": "\/\/api.tvpage.com\/v1\/__tvpa.gif"
              }]);
              _tvpa.push(["track", "ci", {
                li: CONFIG.loginId
              }]);
            }
          }, 200);
        })();

        //Once the analytics library is present we can then load the player library.
        $.ajax({
          dataType: 'script',
          cache: true,
          url: '//d2kmhr1caomykv.cloudfront.net/player/assets/tvp/tvp-1.8.4-min.js'
        }).done(function() {
          if (window.TVPage) {
            that.bindWindowEvents();
            window.TVPlayer = new TVPage.player({
              divId: 'tvpp-holder',// this will need to be dynamic.
              swf: '//d2kmhr1caomykv.cloudfront.net/player/assets/tvp/tvp-1.8.4-flash.swf',
              displayResolution: that.isMobile() ? '360p' : '480p',
              analytics: {
                tvpa: true
              },
              techOrder: 'html5,flash',
              apiBaseUrl: '//api.tvpage.com/v1/',
              onError: function(e) {
                console.log(e);
              },
              controls: {
                active: true,
                seekBar: {
                  progressColor: '#B82927'
                },
                floater: {
                  removeControls: ['tvplogo', 'hd']
                }
              }
            });
            TVPlayer.on('tvp:media:ready', function() {
              that.initializeVideos();
            });
          }
        });
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

    showHTML5PlayBtn: function(video) {
      if (video.type === 'mp4') {
        var $btn = $('#html5MobilePlayBtn');
        $btn.show();
        var THAT = this;
        $btn.on('click', function() {
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

    getVideoData: function(video) {
      var data;
      if (video.data) {
        if ('string' === typeof video.data) {
          var parsed = JSON.parse(video.data);
          if ('object' === typeof parsed) {
            data = parsed.asset;
          }
        }
      } else if (video.asset) {
        data = video.asset;
      }
      data.sources = data.sources || [{
        file: data.videoId
      }];
      data.type = data.type || 'youtube';
      data.analyticsObj = {
        vd: video.id,
        li: CONFIG.loginId,
        pg: CONFIG.channelId
      };
      return data;
    }
  };

  // At DOM Ready!
  $(function() {
    var lightBoxTemplate = '<div id="tvplb"><div class="tvp-lb-content"><div class="tvp-lb-close"></div><div class="tvp-lb-header"><div class="tvp-related-products">SPONSORED PRODUCTS</div><h4 class="tvp-lb-title"></h4></div><div class="tvp-lb-body"></div><div class="tvp-no-products-banner" data-ns="footer" data-pos="btf" data-collapse="true"></div></div><div id="tvp-lb-overlay" class="tvp-lb-overlay"></div></div>';
    $("#"+holderId).append('<div class="cz-line-heading"><div class="cz-line-heading-inner">Recommended Videos</div></div><div id="tvp-videos"></div><div id="lightbox" class="off">' + lightBoxTemplate + '</div><a class="tvplogo" class="tvp-clearfix" href="//www.tvpage.com" target="_blank"></a>').addClass("tvp-clearfix");
    var playerTemplate = '<div id="tvpp"><div id="html5MobilePlayBtn" class="tvp-html5-play-button"></div><div class="tvpp-wrapper"><div id="tvpp-holder" class="tvpp-holder"></div><div class="tvp-video-overlay"></div></div></div>';
    var productsTemplate = '<div id="tvp-recommended-products-wrapper"><div class="tvp-recommeded-products">SPONSORED PRODUCTS</div><div class="tvp-pagination"></div></div><div id="tvp-mobile-products"><div id="scroller-wrapper" class="x-scroll"><div id="scroller" class="scroll-area"><ul id="tvp-mobile-products-list" class="products-list"></ul></div></div></div><div id="tvp-desktop-products" class="products"><div class="tvp-products-holder"><div id="scroller-wrapper" class="y-scroll"><div id="scroller" class="scroll-area"><ul id="tvp-desktop-products-list"></ul></div></div><div id="tvp-product-pop-ups"></div></div></div>';
    var initialTemplate = '<div class="tvp-clearfix"><div class="tvp-col-3"><div id="tvp-no-image" class="tvp-video-image"></div><div class="tvp-no-title-1"></div><div class="tvp-no-title-2"></div></div><div class="tvp-col-3"><div id="tvp-no-image" class="tvp-video-image"></div><div class="tvp-no-title-1"></div><div class="tvp-no-title-2"></div></div></div><div class="tvp-clearfix"><div class="tvp-col-3"><div id="tvp-no-image" class="tvp-video-image"></div><div class="tvp-no-title-1"></div><div class="tvp-no-title-2"></div></div><div class="tvp-col-3"><div id="tvp-no-image" class="tvp-video-image"></div><div class="tvp-no-title-1"></div><div class="tvp-no-title-2"></div></div></div><div class="tvp-clearfix"><div class="tvp-col-3"><div id="tvp-no-image" class="tvp-video-image"></div><div class="tvp-no-title-1"></div><div class="tvp-no-title-2"></div></div><div class="tvp-col-3"><div id="tvp-no-image" class="tvp-video-image"></div><div class="tvp-no-title-1"></div><div class="tvp-no-title-2"></div></div></div>';
    setTimeout(function() {
      $('.tvp-lb-body').append(playerTemplate + productsTemplate);
      $('#tvp-videos').append(initialTemplate);
      TVStore.initialize();
    }, 0);
  });
  return false;
});