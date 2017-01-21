(function($, IScroll){
	var liveResultsPage=0,
        btnLoadMore = $(".btn-more-button"),
        searchDesktopInput = $("#tvp-desktop-search-input"),
        $nullResults = $('#tvp-null-results'),
		resultsScroller,
        isLoadMore = false,
        isFiltering = false;
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
    				"X-login-id" : TVSite.loginId
    			})

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
                    $filter.prev().prop("disabled",false);
                }
            }

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
        },
        Filters : function(){
            $("#product_category li a").on("click", function(event){
                var _id = event.currentTarget.id;
                Filters.selected["product_category"] = event.currentTarget.text;
                liveResultsPage = 0;
                Filters.filterVideos();
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
        channelDataExtractor.videos(TVSite.channelId, liveResultsPage ,null).done(function(data){
            if (data.length)
                renderUtil.handleLoadMore(data);
        });
        
    });


    // The filters module.
    var Filters = {
        selected: {},
        defaultFilters: null,
        filters: { type_of_video: {}, product_category: {} },
        filterVideos: function() {
            $('.reset-filter').fadeTo(0, 1);
            isFiltering = true;
            if (liveResultsPage===0)
                    $("#tvp-video-container").empty();
            channelDataExtractor.videos(null, liveResultsPage, null).done(_.bind(function(results) {
                liveResultsPage =  liveResultsPage+1;
                if (results.length) {
                    if(!isMobile || !isIOS){
                        this.hoverCheck();    
                    }
                } 

            }, this));
        },
        initialize: function() {
            $.ajax({
                url: TVSite.apiUrl + 'codebook/display/video',
                dataType: 'jsonp',
                data: {
                    'X-login-id': TVSite.loginId,
                    channelId: TVSite.channelId
                }
            }).done(_.bind(function(res) {
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
                var isIOS = false;
                if(isIOS){
                    $(document).on('touchstart', '.reset-filter', _.bind(function() {
                        this.reset();
                    }, this));
                }
                else{
                    $(document).on('click', '.reset-filter', _.bind(function() {
                        this.reset();
                    }, this));
                }

            }, this));
        }
    };





	$('.slider').slick({
      infinite: true,
	    speed: 900,
	    slidesToShow: 3,
	    slidesToScroll: 1,
	    nextArrow: '<div class="col-sm-1 col-md-1"><button type="button" class="slick-next">Next</button></div>',
	    prevArrow: '<div class="col-sm-1 col-md-1"><button type="button" class="slick-prev">Previous</button></div>',
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
    //all calls will be defined here

    if (TVSite.isChannelPage) {
        Filters.initialize();
    }

    

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
}(jQuery, window.IScroll));