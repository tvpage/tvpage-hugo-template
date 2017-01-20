(function($, IScroll){
	var liveResultsPage=0,
        btnLoadMore = $(".btn-more-button"),
        searchDesktopInput = $("#tvp-desktop-search-input"),
        $nullResults = $('#tvp-null-results'),
		resultsScroller
        isLoadMore : false;
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
    			data : {
    				p : (page == null || page == undefined) ? 0 : page,
    				n : TVSite.isHomePage ? 6 : 20,
    				s : (query == null || query == undefined) ? "" : query,
    				"X-login-id" : TVSite.loginId
    			}

    		});
    	},
    	channels : function(){

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
            debugger;
            if (result && redefine(result, "entityTitleParent") && redefine(result, "titleTextEncoded") && redefine(result, "entityIdParent") && redefine(result, "id")) {
                return TVSite.baseUrl + '/' +( isLoadMore ? TVSite.channelInfo.titleTextEncoded : String(result.entityTitleParent).replace(/\s/g,"-").replace(/\./g,"") )+ "/" + String(result.titleTextEncoded).replace(/\s/g,"-") + "/" + result.entityIdParent + "-" + result.id;
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
                    .addClass('end-of-results')
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
            }
            return;
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
            return helper.textContent || helper.innerText || '';
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
                    //debugger;
                    html += this.tmpl(this.videoTemplate, result);
                }

                $('#tvp-video-container').append(html);
                eventsBinder.onLoadMore();
        }
    };

    var search = {
    	desktop : function(query){
    		 return channelDataExtractor.videos(null, null, query);

    	},
    	mobile : function(){

    	}
    };

    var eventsBinder = {
        onLoadMore : function(){
            $(".latest-video").on({
                click: function(e){
                    // alert('test');
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
        }

    };

    searchDesktopInput.on("keypress", function(e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                //  goToResultsPage(val);
            }
    });

    searchDesktopInput.on('keyup', function(e) {
        isLoadMore = false;
        e.preventDefault();
        var val = $(e.target).val();
        renderUtil.resetLiveSearch();
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
    }).blur(function(){
    	searchDesktopInput.val("");
    	renderUtil.resetLiveSearch();
    	$(".brand-header-search-container").animate({ width: '-=175' }, "fast");
    	$(".brand-header-logo").animate({marginLeft:"+=175"},"fast");
    });

    btnLoadMore.on("click", function(event){
        isLoadMore = true;
        liveResultsPage = liveResultsPage+1;
        if (TVSite.isHomePage) {
            channelDataExtractor.videos(TVSite.channelId, liveResultsPage ,null).done(function(data){
                debugger;
                if (data.length)
                    renderUtil.handleLoadMore(data);
            });
        }
        else if(TVSite.isChannelPage){
            channelDataExtractor.videos(TVSite.channelId, liveResultsPage ,null).done(function(data){
                if (data.length)
                    renderUtil.handleLoadMore(data);
            });
        }
        else if(TVSite.isPlayerPage){
            channelDataExtractor.videos(TVSite.channelId, liveResultsPage ,null).done(function(data){
                if (data.length)
                    renderUtil.handleLoadMore(data);
            });
        }
    });

	$('.slider').slick({
      infinite: true,
	    speed: 900,
	    slidesToShow: 3,
	    slidesToScroll: 1,
	    responsive: [{
	        breakpoint: 768,
	        settings: {
	            arrows: false,
	            slidesToShow: 3,
	            slidesToScroll: 3
	        }
	    }]
    });
    
	eventsBinder.onLoadMore();

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
    })
}(jQuery, window.IScroll));