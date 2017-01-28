(function($, IScroll, _, BigScreen){
	var liveResultsPage=0;
    var btnLoadMore = $(".btn-more-button");
    var searchDesktopInput = $("#tvp-desktop-search-input");
    var $nullResults = $('#tvp-null-results');
    var	resultsScroller;
    var $searchMobileInput = $("#tvp-mobile-search-input");
    var $searchMobileCancelBtn = $('.mobile-search-modal-cancel-btn');
    var $searchMobileResultHolder = $('#tvp-mobile-search-results');
    var $nullMobileResults = $('#tvp-mobile-null-results');
    var isLoadMore = false;
    var isIOS = (/iPhone|iPad|iPod/i.test(navigator.userAgent)) ? true : false;
    var isFiltering = false;
    var initialPlay = true;
    var isFullScreen = false;
    var activeVideoId = null;
    var videoList = [];
    var isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ? true : false;
    var isMac = navigator.userAgent.indexOf('Mac OS X') != -1;
    var isFireFox = navigator.userAgent.indexOf('Firefox') != -1;
    var IE = function ( version ) {
         return RegExp('msie' + (!isNaN(version)?('\\s'+version):''), 'i').test(navigator.userAgent);
        };
    var playerResolution = isMobile ? '360p' : '480p';
    var isFlashRequired = ( (IE(9) || IE(10)) || (isMac && isFireFox)  );
    var playerTechOrder = isFlashRequired ? 'flash,html5' : 'html5,flash';
    var playbackList = [];
    var formatDate = function(unixTimestamp) {
        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'],
        	d = (new Date(Number(unixTimestamp) * 1000)),
        	month = months[d.getMonth()],
			day = '' + d.getDate() + ',',
			year = d.getFullYear();
			return [month, day, year].join(' ');
    };

    var channelDataExtractor = {
    	commonRequest : function(url, page, query){
    		return $.ajax({
    			url : url,
    			cache : false,
    			dataType : "jsonp",
    			data : _.extend({},isFiltering ? Filters.selected : {} ,{
    				p : (page == null || page == undefined) ? 0 : page,
    				n : TVSite.isHomePage ? 6 : 6 ,
    				s : (query == null || query == undefined) ? "" : query,
    				"X-login-id" : TVSite.loginId,
                    status: 'approved',
                    o: 'date_created',
                    od: 'desc',
    			})

    		});
    	},
        filters : function(){
            return $.ajax({
                url: TVSite.apiUrl + 'codebook/display/video',
                dataType: 'jsonp',
                data: {
                    'X-login-id': TVSite.loginId,
                    channelId: TVSite.channelId
                }
            });
        },
    	products : function(videoId){
            var url = TVSite.apiUrl+"videos/" + videoId + "/products";
            return this.commonRequest(url, null, null);

    	},
    	channelInfo : function(){

    	},
    	video : function(){

    	},
    	videos : function(channelId, page, query){
    		var url = TVSite.apiUrl+"videos/search";
    		var search = query;
    		if(channelId !== undefined && channelId !== null)
    			url = TVSite.apiUrl +"channels/"+ channelId + "/videos";
    		return this.commonRequest(url,page,search);
    	}

    };

    var renderUtil = {
    	liveResultHtml : '<li><a href="{url}" class="tvp-desktop-search-results-item clearfix"><div class="tvp-desktop-search-results-item-img-holder"><div class="tvp-desktop-search-results-item-img" style="background-image:url({asset.thumbnailUrl});+    	background-position: 50% 50%;"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" /></div></div><div class="tvp-desktop-search-results-item-text"><p class="tvp-desktop-search-results-item-title">{title}</p><p class="tvp-desktop-search-results-item-description">{description}</p></div></a></li>',
        videoTemplate : '<div class="col-sm-4 col-md-4">'
            +'<a href="{url}" class="latest-video">'
                +'<div class="latest-video-thumbnail">'        
                    +'<div class="content" style="background-image: url({asset.thumbnailUrl});">'
                        +'<div class="latest-video-hover">'
                            +'<div class="play-icon"></div>'
                        +'</div>'
                  +'</div>'
                +'</div>'
                +'<p class="latest-video-title">'
                    +'{title}'
                +'</p>'
            +'</a>'
        +'</div>',
    	getResultUrl :function(result) {
            var redefine = function(val) {
                return ("undefined" !== typeof val && null !== typeof val && val);
            };
            if (result && redefine(result)) {
                var url = TVSite.baseUrl + '/' +( (isLoadMore || isFiltering) ? TVSite.channelInfo.titleTextEncoded : String(result.entityTitleParent).replace(/\s/g,"-").replace(/\./g,"") )+ "/" + String(result.titleTextEncoded).replace(/\s/g,"-") + "/" + (result.entityIdParent || TVSite.channelId) + "-" + result.id;
                url = url.replace("//", "/");
                return url;
            }
            return;
        },
    	resetLiveSearch : function() {
            $('#tvp-desktop-search-results ul')
                .empty()
                .closest('#tvp-desktop-search-results-holder')
                .hide();
        },
        showEndOfResults : function() {
            if (!$('.tvp-end-of-results').length) {
                $('<p></p>')
                    .addClass('tvp-end-of-results')
                    .html('No more results')
                    .appendTo('#tvp-desktop-search-results ul');
                this.checkResultsScroller();
            }
        },
        createDesktopScroller : function(id) {
            if (id && $(id).children().length) {
                return new IScroll(id, {
                    interactiveScrollbars: true,
                    scrollX: false,
                    click: true,
                    mouseWheel: true,
                    scrollbars: true
                });
            }else{
                return;
            }
        },
        handleScrollEnd : function() {
            if (Math.abs(this.maxScrollY) - Math.abs(this.y) < 10) {
                var val = searchDesktopInput.val();
                channelDataExtractor.videos(null, liveResultsPage + 1,val)
                    .done(function(results) {
                        renderUtil.handleVideoResults(results);
                        liveResultsPage = liveResultsPage + 1;
                    });
            }
        },
        checkResultsScroller : function() {
            if (!this.resultsScroller) {
                this.resultsScroller = this.createDesktopScroller('#tvp-desktop-search-results-holder');
                this.resultsScroller.on('scrollEnd', this.handleScrollEnd);
            } else {
                setTimeout(function() {
                    renderUtil.resultsScroller.refresh();
                }, 0);
            }
        },
    	tmpl : function(template, data) {
            if (template && 'object' == typeof data) {
                return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
                    var keys = key.split("."),
                        v = data[keys.shift()];
                    for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
                    return (typeof v !== "undefined" && v !== null) ? v : "";
                });
            }
            return;
        },
        stripHtml : function(html) {
            var helper = document.createElement('DIV');
            helper.innerHTML = html;
            var helperText = helper.textContent || helper.innerText || '';
            return helperText;
        },
        handleVideoResults: function(results) {
            if (results.length) {
                var html = '',
                    holder = '#tvp-desktop-search-results-holder';
                for (var i = 0; i < results.length; ++i) {
                    var result = results[i];
                    result['url'] = this.getResultUrl(result);
                    if ('description' in result) result.description = this.stripHtml(result.description);
                    html += this.tmpl(this.liveResultHtml, result);
                }

                $('#tvp-desktop-search-results ul')
                    .append(html)
                    .closest(holder)
                    .show();
                renderUtil.checkResultsScroller();

            } else {
                renderUtil.showEndOfResults();
            }
        },
        handleLoadMore: function(results){
            var html = '';
                for (var i = 0; i < results.length; ++i) {
                    var result = results[i];
                    result['url'] = this.getResultUrl(result);
                    html += this.tmpl(this.videoTemplate, result);
                }

                $('#tvp-video-container').append(html);
                eventsBinder.onLoadMore();
        },
        addFilters : function(filters){
            var getOption = function(opt, selected) {
                var $opt = $('<a/>').attr({'value': opt.code, "href" : "#"});
                var li = $("<li/>");
                if (opt.id) $opt.attr('id', opt.id);
                $opt.html(opt.label || '');
                //if (selected) $opt.attr('selected', 'selected');
                li.append($opt[0]);
                return li[0];
            };
            for (var key in filters) {
                var frag = document.createDocumentFragment();
                frag.appendChild(getOption({ code: null, label: key.replace(/_/g, ' ') }));
                var opts = filters[key].options;
                for (var i = 0; i < (opts ? opts.length : 0); i++) {
                    if (opts[i].hasValues) 
                        frag.appendChild(getOption(opts[i]));
                }
                var $filter = $('#' + key );
                if(1=== frag.childElementCount){
                    $filter.addClass('tvp-filter-inactive');
                }
                else{
                    $filter.html(frag);
                    $filter.removeAttr("style");
                }
            }
        },
        handleMobileSearchResults : function (results) {
            if(results.length){
                var template = '<li><div class="item"> <a href="{url}" class="latest-video"><div class="latest-video-thumbnail"><div class="content" style="background-image: url({asset.thumbnailUrl})"></div></div><div class="latest-video-title"> {title}</div> </a></div></li>',
                    html = '',
                    that = this;
                _.each(results, function(el, idx){
                    var result = results[idx];
                    result['url'] = that.getResultUrl(result);                    
                    html += that.tmpl(template, result);
                });
            }
        },
        renderProd : function(prods, target, templ) {
            var html = "";
            if (prods && prods.length) {
                for (var i = 0; i < prods.length; i++) {
                    var data = JSON.parse(prods[i].data || "");
                    prods[i].linkUrl = data.linkUrl;
                    prods[i].imageUrl = data.imageUrl;
                    html += renderUtil.tmpl(templ, prods[i]);
                }
            } else {
                //no prods
            }

            if (html.length) {
                $(target).html(html);
                if (($(target).length > 0) && !$(target).is(':hidden')) {
                    //registerProductPanel($(target));
                }
                $searchMobileResultHolder.find('ul').html(html)
                    .parent().show();
            }
        }
    };

    var search = {
    	desktop : function(query){
    		 return channelDataExtractor.videos(null, null, query);

    	},
    	mobile : function(query){
            return channelDataExtractor.videos(null, null, query);
    	}
    };

    var eventsBinder = {
        onLoadMore : function(){
            $(".latest-video").on({
                click: function(e){
                    if(TVSite.isPlayerPage){
                        //e.preventDefault();
                    }
                },
                mouseover: function(e){
                    var $hoverDiv = $(this).find('.latest-video-hover');
                    if (!$hoverDiv.hasClass('active')) {
                        $hoverDiv.addClass('active');
                    }
                },
                mouseout: function(e){
                    var $hoverDiv = $(this).find('.latest-video-hover');
                    if ($hoverDiv.hasClass('active')) {
                        $hoverDiv.removeClass('active');
                    }
                }
            });
        },
        Filters : function(){
            $("#product_category li a").on("click", function(event){
                event.preventDefault();
                $(this).parent().parent().prev().find(".selected").text($(this).text());
                var _id = event.currentTarget.id;
                Filters.selected["product_category"] = event.currentTarget.text;
                liveResultsPage = 0;
                if(_id){
                    Filters.filterVideos();    
                }
                else{

                    Filters.reset();
                }
                
            });


            $("#type_of_video li a").on("click", function(event){
                event.preventDefault();
                $(this).parent().parent().prev().find(".selected").text($(this).text());
                var _id = event.currentTarget.id;
                Filters.selected["type_of_video"] = event.currentTarget.text;
                liveResultsPage = 0;
                if(_id){
                    Filters.filterVideos();    
                }
                else{

                    Filters.reset();
                }
                
            });


        },
        searchButton : function(){
            $(".brand-header-search-button").on("click", function(e){
                console.log("focus");
                $searchMobileInput.focus();
            });
        }

    };

    searchDesktopInput.on("keypress", function(e) {
            if (e.keyCode == 13) {
                e.preventDefault();
            }
    });

    searchDesktopInput.on('keyup', function(e) {
        isLoadMore = false;
        var code = e.keyCode;
        if(code===37 || code===38 || code===39 || code===40)
            return;
        e.preventDefault();
        var val = $(e.target).val();
        renderUtil.resetLiveSearch();
        $nullResults.find(".tvp-null-results-word").text(val);
        if (val) {
        	liveResultsPage = 0;
            search.desktop(val).done(function(results) {
            	if (results.length) {
            		$nullResults.hide();
            		renderUtil.handleVideoResults(results);
				} else {
                    $nullResults.show();
                }
            });
        } else {
            $nullResults.hide();
        }
    });

    searchDesktopInput.focus(function(){
    	$(".brand-header-search-container").animate({width:"+=175"},"fast");
    	$(".brand-header-logo").animate({marginLeft:"-=175"},"fast");
        eventsBinder.searchButton();
    }).blur(function(){
    	searchDesktopInput.val("");
    	renderUtil.resetLiveSearch();
        $nullResults.hide();
    	$(".brand-header-search-container").animate({ width: '-=175' }, "fast");
    	$(".brand-header-logo").animate({marginLeft:"+=175"},"fast");
    });

    $(document).on("click", function(event){
        var input = $(event.target);
        if(!searchDesktopInput.is(":focus") && input !== searchDesktopInput){
            //$(".brand-header-search-container").animate({ width: '-=175' }, "fast");
            //$(".brand-header-logo").animate({marginLeft:"+=175"},"fast");
        }
    });

    $searchMobileInput.on('keyup', function(e) {
        e.preventDefault();
        var val = $(e.target).val();
        if (val) {
            search.mobile(val).done(function (results) {                
                if(results.length){
                    $nullMobileResults.hide();
                    renderUtil.handleMobileSearchResults(results);
                }
                else{
                    $searchMobileResultHolder.hide();
                    $nullMobileResults.find('b').html(val);
                    $nullMobileResults.show();
                }
            });
        }
        else{
            $nullMobileResults.hide();
            $searchMobileResultHolder.hide();
        }
    });
    
    eventsBinder.searchButton();

    $searchMobileCancelBtn.on('click', function(e) {
        e.preventDefault();
        $searchMobileInput.val('');
        $nullMobileResults.hide();
        $searchMobileResultHolder.hide();
    });

    btnLoadMore.on("click", function(event){
        isLoadMore = true;
        liveResultsPage = liveResultsPage+1;
        channelDataExtractor.videos(TVSite.channelId, liveResultsPage ,null).done(function(data){
            if (data.length)
                renderUtil.handleLoadMore(data);
            else
                btnLoadMore.attr("disabled", true);

        });
        
    });


    // The filters module.
    var Filters = {
        selected: {},
        defaultFilters: null,
        filters: { type_of_video: {}, product_category: {} },
        reset : function(){
            $('.tvp-filter-reset').css("display", "none");
            btnLoadMore.attr("disabled", false);
            isFiltering = false;
            liveResultsPage = 0;
            $('#tvp-video-container').empty();
            channelDataExtractor.videos(TVSite.channelId, liveResultsPage ,null).done(function(data){
            if (data.length)
                renderUtil.handleLoadMore(data);
            });
        },
        filterVideos: function() {
            $('.tvp-filter-reset').css("display", "inline-block");
            isFiltering = true;
            if (liveResultsPage===0)
                    $("#tvp-video-container").empty();
            channelDataExtractor.videos(null, liveResultsPage, null).done(_.bind(function(results) {
                liveResultsPage =  liveResultsPage+1;
                if (results.length) {
                    renderUtil.handleLoadMore(results);
                    // if(!isMobile || !isIOS){
                    //     this.hoverCheck();    
                    // }
                } 

            }, this));
        },
        initialize: function() {
            channelDataExtractor.filters().done(_.bind(function(res) {
                for (var i = 0; i < res.length; i++) {
                    var attr = res[i],
                        code = attr.code;
                    if (code in this.filters) {
                        var props = ['id', 'label', 'options'];
                        for (var j = 0; j < props.length; j++) { 
                            this.filters[code][props[j]] = attr[props[j]]; 
                        }
                    }
                }
                renderUtil.addFilters(this.filters);
                eventsBinder.Filters();
                if(isIOS){
                    $(document).on('touchstart', '.tvp-filter-reset', _.bind(function() {
                        this.reset();
                    }, this));
                }
                else{
                    $(document).on('click', '.tvp-filter-reset', _.bind(function() {
                        $("#product_category").prev().find(".selected").text("Product Category");
                        $("#type_of_video").prev().find(".selected").text("Type of Video");
                        this.reset();
                    }, this));
                }

            }, this));
        }
    };

    var tvp_Player = {
        updateTitle : function(title){
          if (title) {
            $('#video-playing-title').empty()
            .html(title);
          }
        },
        showPlayButton : function(){
          $('#html5-play-button').show().on('click', function(){
            window.TVPlayer.play();
            $(this).hide();
          });
        },
        buildVideoData : function(video){
          var data = video.asset || {};
          data.sources = data.sources || [{file: data.videoId}];
          data.type = data.type || 'youtube';
          var channel = TVSite.channelVideosData;
          var id = "";
          if ("object" !== typeof channel && "undefined" !== typeof channel.id) {
            id = channel.id;
          }
          data.analyticsObj = {
            pg: TVSite.channelId || id,
            vd: video.id,
            li: TVSite.loginId
          };
          return data;
        },
        playVideo : function(video){
          if (video) {
            inTimeProducts.destroy();
            inTimeProducts.initialize({
                videoId: video.id,
                channelId: TVSite.channelId
            });
            var data = tvp_Player.buildVideoData(video);
            
            if (isMobile) {
              TVPlayer.cueVideo(data);
              if ('youtube' != data.type) {
                tvp_Player.showPlayButton();
              }
            } else {
              TVPlayer.loadVideo(data);
            }
            var url = tvp_Player.getVideoUrl(video);
            tvp_Player.updateSiteUrlAndTitle(url, video.title);
            tvp_Player.updateSocialShareLink(url, video);
          }
        },
        updateSiteUrlAndTitle : function(url, title){
          var newUrl = window.location.protocol +'//' + window.location.host + url;
          if (newUrl && window.history && history.pushState) {
            history.pushState({state: 1}, null, newUrl);
            if ( 'string' === typeof title ) title = title;
              document.title = title;
          }
        },
        updateSocialShareLink : function(url, video){
          $('.facebook').attr('href', function(i, val) {
            return 'https://www.facebook.com/sharer/sharer.php?u=' + window.location.protocol +'//' + window.location.host + url;
          });

          $('.twitter').attr('href', function(i, val) {
            return 'https://twitter.com/share?text=' + video.title + '%20%7C%0A&url=' + window.location.protocol +'//' + window.location.host  + url;
          });
        },
        getVideoUrl : function(video){
          var url;
          if('undefined' !== typeof video.url){
            url = video.url;
          }else{
            var channel = TVSite.channelVideosData;
            var videoUrl = '/' + channel.id +'-' + video.id;
            var videoTitle = '';
            if (video.titleTextEncoded && video.titleTextEncoded.length > 0 ) {
              videoTitle = '/' + video.titleTextEncoded;
            }
            var channelTitle = '';
            if (channel.titleTextEncoded && channel.titleTextEncoded.length > 0 ) {
              channelTitle = TVSite.baseUrl+'/' + channel.titleTextEncoded;
              channelTitle = channelTitle.replace("//", "/");
            }
            url = channelTitle + videoTitle + videoUrl;
          }
          return url;
        },
        resizePlayer : function(){
          var $playerHolder = $('#TVPagePlayer');
          if (!isFullScreen && $playerHolder.length) {
            TVPlayer.resize($playerHolder.width(), $playerHolder.height());
          }
        },
        getNextVideo : function(currentIndex, callback){
          if ( ('undefined' !== typeof currentIndex) && ('function' === typeof callback) ) {
            if ( currentIndex == videoList.length - 1 ) {
              callback( videoList[0] );
            } else {
              callback( videoList[ currentIndex + 1 ] );
            }
          }
        },
        handleNextvideo : function(nextVideo){
          if ( 'object' === typeof nextVideo ) {
            tvp_Player.updateTitle( nextVideo.title );
            // updateDescription( nextVideo );
            // updateTranscripts( nextVideo );
            // updateProducts( nextVideo.id );
            // $('#video-' + nextVideo.id).removeClass('inactive hovered').addClass('playing');
            tvp_Player.startPlayback(nextVideo);
          }
        },
        getVideoIndex : function(videoId, callback){
          if ( ('undefined' !== typeof videoId) && ('function' === typeof callback) ) {
            var i = 0;
            for ( i; i < videoList.length; i++ ) {
              if ( videoId == videoList[i].id ) return callback(i);
            }
            callback(null);
          }
        },
        handleAutoNext : function(){
          tvp_Player.updateVideoElements();
          tvp_Player.getVideoIndex(activeVideoId, function(index){
            tvp_Player.getNextVideo(index, $.proxy(tvp_Player.handleNextvideo) );
            ProductSlider.initialize({videoId: activeVideoId});
          });
        },
        startPlayback : function(video){
          if ( video && ('object' === typeof video) ) {
            tvp_Player.playVideo(video);
            activeVideoId = video.id;
            //updateProducts(video.id);
            channelDataExtractor.products(activeVideoId).done(function(data){

                renderUtil.renderProd(data, "#mobile-products-wrapper", $("#mobileProduct").html());
                renderUtil.renderProd(data, "#desktop-products-wrapper", $("#desktopProduct").html());
                renderUtil.renderProd(data, "#desktop-products-pop-ups", $("#productPopup").html());
                
            });
            // if(TVSite.productCartridges && TVSite.productCartridges.length){
            //   TVSite.productCartridges.forEach(function(element, index, array){
            //       var targetIsHidden = $(element.target).is(':hidden');
            //       if ( ($(element.target).length > 0) && !targetIsHidden) {
            //         registerProductPanel($(element.target));
            //       }
            //     });
            // }
            tvp_Player.updateTitle(video.title);
          }
        },
        handlePlayerReady : function(){
          videoList = TVSite.channelVideosData.videos;
          tvp_Player.resizePlayer();
          if ( initialPlay && 'channelVideosData' in TVSite ) {
            var video = TVSite.channelVideosData.video;
            tvp_Player.startPlayback(video);
            initialPlay = false;
          }
        },
        handlePlayerStateChange : function(e){
          if ('tvp:media:videoended' == e) {
            if (TVSite.isPlayerPage) {
              tvp_Player.handleAutoNext();
            }
          }
        },
        updateVideoElements : function(){
          // $('.channel-videos').find('.video.playing').removeClass('playing').addClass('inactive');
        }
    };


    var inTimeProducts = {

            status: false,

            products: null,

            queue: {},

            productTemplate: '<a id="{id}" href="{data.linkUrl}" data-video-id="{entityIdParent}" target="_blank" class="in-time-product"><span class="in-time-unit in-time-title">{title}</span><span class="in-time-unit in-time-cta">VIEW DETAILS</span></a>',

            initialize: function(settings) {
                this.settings = settings || {};
                this.setElement();
                this.initializeProducts();
                this.status = true;
            },

            setElement: function() {
                $('<div/>').attr('id', 'in-time-products').prependTo('#player-holder');
                this.$el = $('#in-time-products');
            },

            getSpotTimeUrl: function() {
                if ('channelId' in this.settings && 'videoId' in this.settings) {
                    return TVSite.apiUrl + 'spot/link/time/' + this.settings.channelId + '/' + this.settings.videoId;
                }
            },

            getProducts: function(callback) {
                if (callback && 'function' === typeof callback) {
                    return $.ajax({
                        url: this.getSpotTimeUrl(),
                        dataType: 'json',
                        data :{
                            "X-login-id" : TVSite.loginId
                        }
                    }).done(callback);
                }
            },

            cleanPrice: function(price) {
                if (price && 'string' === typeof price) {
                    if (price.indexOf('.') !== -1) {
                        var decimals = price.split('.').pop();
                        if (decimals.length > 2 && decimals.indexOf('00') !== -1) {
                            return price.slice(0, -2);
                        } else if (decimals.length === 1) {
                            return price + '0';
                        }
                    } else {
                        return price + '.00';
                    }
                }
            },

            renderProducts: function() {
                var html = '';
                for (var i = 0; i < this.products.length; ++i) {
                    var product = this.products[i];
                    if ('data' in product && 'string' === typeof product.data) {
                        product.data = JSON.parse(product.data);
                    }
                    html += renderUtil.tmpl(this.productTemplate, product);
                }
                this.$el.html(html);
            },

            initializeProducts: function() {
                var that = this;
                this.getProducts(function(res, status) {
                    if ('success' === status && res.length) {
                        that.products = res;
                        that.renderProducts();
                        that.bindProductClick();
                        that.setQueue();
                        that.initializeWatcher();
                    }
                });
            },
            bindProductClick: function() {
                this.$el.find('.in-time-product').on('click', function(e) {
                    sendAnalytics({ vd: $(this).data('videoId'), ct: $(this).attr('id') }, 'pk');
                });
            },

            setQueue: function() {
                if (this.products) {
                    for (var i = 0; i < this.products.length; ++i) {
                        var product = this.products[i],
                            endTime = Number(product.startTime) + Number(product.duration);
                        this.queue[product.id] = [Number(product.startTime), endTime];
                    }
                }
            },

            getPlayerTime: function() {
                return Math.floor(window.TVPlayer.getCurrentTime() * 1000);
            },

            initializeWatcher: function() {
                var that = this;
                this.watcher = setInterval(function() {
                    for (var key in that.queue) {
                        var time = that.getPlayerTime(),
                            item = that.queue[key];
                        if (time > item[0] && time < item[1]) that.showProduct(key);
                        if (time < item[0]) that.hideProduct(key);
                        if (time > item[1]) that.hideProduct(key);
                    }
                }, 50);
            },
            hideProduct: function(id) {
                if ('undefined' !== id) this.$el.find('#' + id).css('top', '-100px');
            },

            showProduct: function(id) {
                var $product = this.$el.find('#' + id);
                if ($product.css('top') === '-100px') {
                    $product.css('top', '0');
                }
            },

            destroy: function() {
                if (this.status) {
                    clearInterval(this.watcher);
                    this.$el.find('.in-time-product').off();
                    this.$el.remove();
                    this.status = false;
                }
            }

        };

    
    var ProductSlider = {
            products : [],
            $currentPopUp: null,
            currentId: 0,
            el: '[data-toggle="popover"]',
            initialize: function (settings) {
                this.destroy();
                var opt = settings || {};
                var that = this;
                channelDataExtractor.products(opt.videoId)
                    .done(function (results) {
                        if(results.length){
                            that.products = results;
                            that.renderProducts(results);
                            Analytics.registerProductPanel($('#tvp-products-wrapper .tvp-product-image'));
                            that.bindEvents();
                            that.initializeSlider();
                        }
                    });
            },
            renderProducts: function (results) {                
                var template = '<li> <a data-id="{id}" href="{linkUrl}" target="_blank" class="analyticsClick"><div id="{id}" data-toggle="popover" class="tvp-product-image" data-videoId="{videoId}"><div class="content"> <img src="{imageUrl}" alt=""></div></div> </a></li>',
                    html = '';
                this.products = results;

                _.each(results, function (el, idx) {
                    var result = results[idx];
                    
                    if ((result['OUT_OF_STOCK'] === 'Y') && (_.isEmpty(result['price']))) {
                        result['price'] = "Out Of Stock";
                    }
                    else{                        
                        if (result['price'].indexOf('$') < 0) {
                            result['price'] = '$' + result['price'];
                        }
                    }                    
                    result['videoId'] = activeVideoId || TVSite.channelVideosData.video.id;
                    html += renderUtil.tmpl(template, result); 
                });
                $('.tvp-products-wrapper ul').html(html);
            },
            bindEvents: function () {
                var that = this;
                $(this.el).popover({
                    placement: 'left',
                    template: '<div class="popover tvp-prod-hover" role="tooltip"><div class="arrow"></div><div class="popover-content tvp-prod-hover-content"></div></div>',
                    html: true,
                    trigger: 'manual',
                    container: 'div.player-product',
                    content: function(){
                        var hoverTmpl = '<div class="tvp-prod-hover-img-container"><div class="content"> <img src="{imageUrl}" alt=""></div></div><div class="tvp-prod-hover-title">{title}</div><div class="tvp-prod-hover-price-rate"> <span class="price">{price}</span></div> <a data-id="{id}" href="{linkUrl}" target="_blank" class="btn btn-primary btn-more-button analyticsClick">VIEW DETAILS</a>',
                            hoverHtml = ''
                            prodId = $(this).attr('id');

                        var currentProd = _.filter(that.products, function(item){
                            return item.id == prodId;
                        })[0];

                        hoverHtml = renderUtil.tmpl(hoverTmpl, currentProd);

                        return hoverHtml;
                    }
                }).on({
                    'mouseenter' : function () {
                        if (that.currentId === 0) {
                            $(this).popover('show');
                        }
                        else{
                            var _id = $(this).attr('id');
                            if (_id !== that.currentId) {
                                $('div[id="'+that.currentId+'"][data-toggle="popover"]').popover('hide');
                                $(this).popover('show');
                            }
                        }                        
                    },
                    'show.bs.popover': function () {
                        that.currentId = $(this).attr('id');
                    },
                    'hide.bs.popover': function () {
                        that.currentId = 0;
                    }
                });

                $('.player-product').on('mouseleave', '.popover', function() {
                    $('div[id="'+that.currentId+'"]').popover('hide');
                    that.currentId = 0;
                }).on('mouseleave', function() {
                    $('*[data-toggle="popover"]').popover('hide');                
                }).on('click', '.analyticsClick', function(e) {
                    // e.preventDefault();
                    // window.open($(this).attr('href'), "_blank");
                    e.stopPropagation();
                    Analytics.registerProductClick($(this).data('id'));
                });
            },
            initializeSlider: function () {
                var prodSlider = new IScroll('#tvp-products-wrapper', {
                    interactiveScrollbars: true,
                    scrollX: false,
                    mouseWheel: true,
                    scrollbars: true
              });
            },
            destroy: function () {
                $(this.el).popover('destroy');
            }
    }

    var Analytics = {
        registerProductPanel: function ($products) {
            var that = this;
            _.each($products, function(v, k){                
                that.sendAnalytics({
                    vd: $(v).data('videoid'),
                    ct: $(v).attr('id')
                }, 'pi');
            });
        },
        registerProductClick: function (prodId) {
            this.sendAnalytics({
                vd: activeVideoId || TVSite.channelVideosData.video.id,
                ct: prodId
            }, 'pk');
        },
        sendAnalytics: function(data, type) {
            if ('object' == typeof data && type) {
                return _tvpa.push(['track', type, $.extend(data, {
                    li: TVSite.loginId,
                    pg: TVSite.channelId
                })]);
            }
        }
    }

    $('.slider').slick({
        infinite: true,
	    speed: 900,
	    slidesToShow: 3,
	    slidesToScroll: 1,
	    responsive: [{
	        breakpoint: 768,
	        settings: {
	            arrows: false,
	            slidesToShow: 4,
	            slidesToScroll: 3
	        }
	    }]
    });
    
	eventsBinder.onLoadMore();
    //all calls will be defined here
    if (TVSite.isChannelPage) {
        Filters.initialize();
    }

    if (TVSite.isPlayerPage) {
      window.TVPlayer = new TVPage.player({
        divId: 'TVPagePlayer',
        swf: '//appcdn.tvpage.com//player/assets/tvp/tvp-1.5.2-flash.swf',
        displayResolution: tvp_Player.playerResolution,
        analytics: { tvpa : true },
        techOrder: tvp_Player.playerTechOrder,
        onReady: tvp_Player.handlePlayerReady,
        onStateChange: tvp_Player.handlePlayerStateChange,
        controls: {
          active: true,
          seekBar: { progressColor: '#779050' },
          floater: { removeControls:['tvplogo'] }
        }
      });
      /**
       * Fullscreen poll/check
       */
      if (BigScreen) {
        BigScreen.onchange = function () {
          isFullScreen = !isFullScreen;
        };
      }

      /**
       * Resize player on window resizing
       */
      $(window).resize(function(){
        if (!isFullScreen) { tvp_Player.resizePlayer(); }
      });

      ProductSlider.initialize({videoId: TVSite.channelVideosData.video.id});
      $('div[itemprop="video"] meta[itemprop="uploadDate"],meta[itemprop="datePublished"]').attr('content', function(i, val){        
        return formatDate(val);
      });      
    }


    $('#subscribe-header').on('click', function(event) {
        event.preventDefault();
        $('#subcribeModal')        
        .modal('show')
        .find('.channel-title, .chkSubscribeAll').css('display', 'none');
    });
    $('#subscribe-channel').on('click', function(event) {
        event.preventDefault();
        if(isMobile){            
            window.location.href = "/subscribe/" + $(this).data('channelid');
            return false;
        } 
        $('#subcribeModal')        
        .modal('show')
        .find('.channel-title, .chkSubscribeAll').css('display', 'block');
    });


	$('#subcribeModal').on('show.bs.modal', function(event) {
		$('.subscribe-body').show();
		$('.subscribed-body').hide();
	});

	$('.subscribe-button').on('click', function(event) {
		event.preventDefault();
		$('.subscribe-body').hide();
		$('.subscribed-body').show();
	});

	$('.video-details .published-date').text(function(i, s){
		return formatDate(s);
	});

    $('#mobile-menu').on('click', function(event) {
        event.preventDefault();
        $('#mobile-menu-modal').modal();
    });
    $('.mobile.collapse').on({
        'show.bs.collapse': function(){            
            $('.caret').animate({  borderSpacing: -180 }, {
                step: function(now,fx) {
                  $(this).css({
                    '-webkit-transform': 'rotate('+now+'deg)',
                    '-moz-transform': 'rotate('+now+'deg)',
                    'transform': 'rotate('+now+'deg)'
                  });
                },
                duration:'slow',
                complete: function () {
                    $(this).addClass('up').removeAttr('style');
                }
            },'linear');

        },
        'hide.bs.collapse': function () {
            $('.caret').animate({  borderSpacing: 180 }, {
                step: function(now,fx) {                    
                  $(this).css({
                    '-webkit-transform': 'rotate('+now+'deg)',
                    '-moz-transform': 'rotate('+now+'deg)',
                    'transform': 'rotate('+now+'deg)'
                  });
                },
                duration:'slow',
                complete: function(){
                    $(this).removeClass('up').removeAttr('style');
                }
            },'linear');
        }
    });
    $('#mobile-subscribe').click(function(e) {
        e.preventDefault();
        window.location.href = "/subscribe";
    });
    $('#mobile-search').on('click', function(event) {
        event.preventDefault();
        $('#mobile-search-modal').modal();
    });

}(jQuery, window.IScroll, window._, window.BigScreen));
