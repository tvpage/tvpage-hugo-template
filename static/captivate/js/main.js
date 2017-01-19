(function($){
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
    				n : 20,
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
    	videos : function(channelId, query){
    		var url = "//app.tvpage.com/api/videos/search";
    		var search = query;
    		if(channelId !== undefined && channelId !== null)
    			url = "//app.tvpage.com/api/channels/" + channelId + "/videos";
    		return this.commonRequest(url,null,search);
    	}

    };

    var renderUtil = {
    	liveResultHtml : '<li><a href="{url}" class="desktop-search-results-item clearfix"><div class="desktop-search-results-item-img-holder"><div class="desktop-search-results-item-img" style="background-image:url({asset.thumbnailUrl});+    	background-position: 50% 50%;"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" /></div></div><div class="desktop-search-results-item-text"><p class="desktop-search-results-item-title">{title}</p><p class="desktop-search-results-item-description">{description}</p></div></a></li>',
    	tmpl : function(template, data) {
            if (template && 'object' == typeof data) {
                return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
                    var keys = key.split("."),
                        v = data[keys.shift()];
                    for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
                    return (typeof v !== "undefined" && v !== null) ? v : "";
                });
            }
        },
        stripHtml : function(html) {
            var helper = document.createElement('DIV');
            helper.innerHTML = html;
            return helper.textContent || helper.innerText || '';
        },
        handleVideoResults: function(results) {
            if (results.length) {
                var html = '',
                    holder = '#desktop-search-results-holder';
                for (var i = 0; i < results.length; ++i) {
                    var result = results[i];
                    //result['url'] = getResultUrl(result);
                    if ('description' in result) result.description = this.stripHtml(result.description);
                    html += this.tmpl(this.liveResultHtml, result);
                }

                $('#desktop-search-results ul')
                    .append(html)
                    .closest(holder)
                    .show();
                //checkResultsScroller();

            } else {
                //showEndOfResults();
            }
        }
    };

    var search = {
    	desktop : function(query){
    		 return channelDataExtractor.videos(null, query);

    	},
    	mobile : function(){

    	}
    };

    var searchDesktopInput = $("#desktop-search-input");

    searchDesktopInput.on("keypress", function(e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                //  goToResultsPage(val);
            }
    });

    searchDesktopInput.on('keyup', function(e) {
        e.preventDefault();
        var val = $(e.target).val();
    
        if (val) {
        	liveResultsPage = 0;
            search.desktop(val).done(function(results) {
            	if (results.length) {
            		renderUtil.handleVideoResults(results);
				} else {
                
                
                }
            });
        } else {
            
            
        }
    });
    searchDesktopInput.focus(function(){
    	$(".brand-header-search-container").animate({width:"+=180"},"medium");
    }).blur(function(){
    	$(".brand-header-search-container").animate({ width: '-=180' }, "medium");
    });

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
    
	$(".latest-video").on({
		click: function(e){
			// alert('test');
		},
		mouseover: function(e){
			$hoverDiv = $(this).find('.latest-video-hover');
			if (!$hoverDiv.hasClass('active')) {
				$(this).find('.latest-video-hover').addClass('active');
			}
		},
		mouseout: function(e){
			$hoverDiv = $(this).find('.latest-video-hover');
			if ($hoverDiv.hasClass('active')) {
				$(this).find('.latest-video-hover').removeClass('active');
			}
		}
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
}(jQuery));