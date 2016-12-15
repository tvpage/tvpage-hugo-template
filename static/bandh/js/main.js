;(function($, IScroll, BigScreen, window, document, undefined) {
    "use strict";

    $(function() {
        var videoHtml = '<div id="video-{id}" class="video inactive" data-id="{id}"><div class="video-img-holder"><div class="video-img" style="background-image:url({asset.thumbnailUrl});"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="{title}"></div><div class="video-img-overlay"></div><p class="video-duration">{asset.prettyDuration}</p><p class="video-play-label">PLAY VIDEO</p><p class="video-playing-label">NOW PLAYING</p></div><p class="video-title">{title}</p></div>',
            resultHtml = '<div id="video-{id}" class="video inactive" data-id="{id}" data-link="{url}"><a href="{url}" title="{title}"><div class="video-img-holder"><div class="video-img" style="background-image:url({data.asset.thumbnailUrl});"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="{title}"></div><div class="video-img-overlay"></div><p class="video-duration">{data.asset.prettyDuration}</p><p class="video-play-label">PLAY VIDEO</p></div><p class="video-title">{title}</p></a></div>',
            liveResultHtml = '<li><a href="{url}" class="desktop-search-results-item clearfix"><div class="desktop-search-results-item-img-holder"><div class="desktop-search-results-item-img" style="background-image:url({asset.thumbnailUrl}); background-position: 50% 50%;"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" /></div></div><div class="desktop-search-results-item-text"><p class="desktop-search-results-item-title">{title}</p><p class="desktop-search-results-item-description">{description}</p></div></a></li>',
            playBackRowHtml = '<div class="row clearfix playback-row">',
            playbackList,
            currentVideo,
            resultsScroller,
            desktopProductScroller,
            mobileProductScroller,
            liveResultsPage,
            desktopBreakPoint = $(window).width() > 1024,
            isIOS = (/iPhone|iPad|iPod/i.test(navigator.userAgent)) ? true : false,
            isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ? true : false,
            isFullScreen = false,
            initialPlay = true,
            isMac = navigator.userAgent.indexOf('Mac OS X') != -1,
            isFireFox = navigator.userAgent.indexOf('Firefox') != -1,
            isFiltered = false,
            IE = function(version) {
                return RegExp('msie' + (!isNaN(version) ? ('\\s' + version) : ''), 'i').test(navigator.userAgent);
            },
            isFlashRequired = ((IE(9) || IE(10)) || (isMac && isFireFox)),
            playerTechOrder = isFlashRequired ? 'flash,html5' : 'html5,flash',
            playerResolution = isMobile ? '360p' : '480p',
            isHomePage = $('body').hasClass('homepage'),
            isPlaybackPage = $('body').hasClass('playback-page'),
            isSearchPage = $('body').hasClass('search-page'),
            isChannelPage = $('body').hasClass('channel-page'),
            formatMediaDuration = function(secs) {
                if (!_.isUndefined(secs)) {
                    var date = new Date(0, 0, 0);
                    date.setSeconds(Number(secs));
                    var hour = (date.getHours() ? date.getHours() : ''),
                        minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(),
                        seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
                    return (hour + minutes + ':' + seconds);
                }
            };

        // Login headers setup
        $.ajaxSetup({
            headers: {
                'X-login-Id': TVSite.loginId
            }
        });

        // The filters module.
        var Filters = {
            channelVideos: [],
            perPage: 9,
            isFiltering: false,
            filteredCurrentPage: 0,
            channelCurrentPage: 1,
            selected: {},
            defaultFilters: null,
            filters: { type_of_video: {}, product_category: {} },
            
            // We parse through the results of the filtering & we take the next valid options from there,
            // based in the video object attributes.
            updateFiltersFromResults: function(results) {
                var valids = { type_of_video: [], product_category: [] };
                for (var i = 0; i < results.length; i++) {
                    var result = results[i];
                    for (var key in valids) {
                        var value = result[key];
                        if (value && valids[key].indexOf(value) == -1) valids[key].push(value);
                    }
                }
                for (var filterCode in valids) {
                    var validOptionsCodes = valids[filterCode],
                        optionsRef = this.filters[filterCode].options,
                        frag = document.createDocumentFragment();
                    frag.appendChild($('<option/>').html(filterCode.replace(/_/g, ' '))[0]);
                    var validsQty = validOptionsCodes.length;
                    for (var i = 0; i < validsQty; i++) {
                        var validOptionCode = validOptionsCodes[i];
                        for (var j = 0; j < optionsRef.length; j++) {
                            if (validOptionCode === optionsRef[j].code) {
                                var validOption = optionsRef[j],
                                    $option = $('<option/>').attr('id', validOption.id).attr('value', validOption.code).html(validOption.label);
                                if (validOptionsCodes.length == 1) $option.attr('selected', 'selected');
                                frag.appendChild($option[0]);
                            }
                        }
                    }
                    $('[data-code="' + filterCode + '"]').html(frag).addClass(validsQty ? '' : 'inactive');
                }
            },
            getChannelVideos: function() {
                var channelId = 0;
                var channel = getPlaybackChannel();
                if ("object" === typeof channel) {
                    channelId = channel.id;
                }
                
                return $.ajax({
                    url: "//app.tvpage.com/api/channels/" + channelId + "/videos",
                    dataType: 'jsonp',
                    data: {
                        p: 0,
                        n: this.perPage,
                        "X-login-id": TVSite.loginId
                    }
                });
            },
            hoverCheck: function() {
                $('.video').each(function() {
                    if (!$._data(this, 'events')) $(this).hover(function() { $(this).addClass('hovered') }, function() { $(this).removeClass('hovered') });
                });
            },
            addLoadMoreButton: function() {
                if (!$('#load-more-videos').length) {
                    var $row = $('<div/>').addClass('row').
                    append($('<div/>').addClass('load-more-row').append($('<div/>').addClass('load-more').attr('id', 'load-more-videos').html('<p>LOAD MORE</p>')));
                    $('.channel-videos').append($row);
                    PlaybackChannelsSearch.bindLoadMoreVideosEvent();
                } else {
                    PlaybackChannelsSearch.bindLoadMoreVideosEvent();
                }
            },
            reset: function() {
                $('.reset-filter').fadeTo(0, 0);
                isFiltered = false;
                this.channelCurrentPage = 1;
                this.filteredCurrentPage = 0;
                if ($('.filter').hasClass('active')) {
                    $('.filter').removeClass('active');
                }
                this.selected = {};
                this.filters = this.defaultFilters;
                this.render(this.filters);
                this.getChannelVideos().done(_.bind(function(videos) {
                    PlaybackChannelsSearch.channelVideosPage = 0;
                    PlaybackChannelsSearch.lastChannelVideosPage = false;
                    $('.channel-videos').data('fetchPage', PlaybackChannelsSearch.channelVideosPage);
                    PlaybackChannelsSearch.lastChannelVideosPageCheck(videos);
                    PlaybackChannelsSearch.videoList = PlaybackChannelsSearch.videoList.concat(videos.slice(0));
                    PlaybackChannelsSearch.cacheVideoList = PlaybackChannelsSearch.videoList.slice(0);
                    PlaybackChannelsSearch.renderVideoRows(PlaybackChannelsSearch.rowerize(videos), function(html) { 
                        $('.channel-videos .loadable-container').html(html); 
                    });
                    PlaybackChannelsSearch.initLoadMoreChannelVideos();
                    PlaybackChannelsSearch.bindVideoThumbEvents('.channel-videos');
                    if (PlaybackChannelsSearch.videoList && PlaybackChannelsSearch.videoList.length >= 6) {
                        var $target = $('#playback-row-container').find('.row').eq(1);
                        $target.after(_.template($('#ad-banner-template').html())("some"));
                        checkAdBanner();
                    }
                }, this));
            },
            rowerizeData: function(coll, per) {
                if (coll && coll.length && 'undefined' !== typeof per) {
                    var rows = [];
                    while (coll.length) rows.push(coll.splice(0, per));
                    return rows;
                }
            },
            filterVideos: function() {
                $('.reset-filter').fadeTo(0, 1);
                isFiltered = true;
                $.ajax({
                    url: "//app.tvpage.com/api/videos/search",
                    dataType: 'jsonp',
                    data: _.extend({}, this.selected || {}, {
                        status: 'approved',
                        p: this.filteredCurrentPage,
                        o: 'date_created',
                        od: 'desc',
                        n: this.perPage,
                        "X-login-id": TVSite.loginId
                    })
                }).done(_.bind(function(results) {
                    var channel = getPlaybackChannel();
                    var activeChannel = {};
                    if ("object" === typeof channel) {
                        activeChannel = channel;
                    }

                    if (results.length) {
                        var resultsCopy = results.slice(0);
                        if (this.filteredCurrentPage == 0) this.updateFiltersFromResults(results);
                        var resultRows = this.rowerizeData(resultsCopy, 3),
                            frag = document.createDocumentFragment(),
                            rows = resultRows.length ? resultRows : [];
                        for (var i = 0; i < rows.length; i++) {
                            var $row = $('<div/>').addClass('row clearfix playback-row'),
                                row = rows[i];
                            for (var j = 0; j < row.length; j++) {
                                var item = row[j],
                                    url = TVSite.baseUrl + '/' + activeChannel.titleTextEncoded;
                                url += '/' + item.titleTextEncoded + '/' + activeChannel.id + '---' + item.id;
                                item.url = url;
                                $row.append(_.template($('#resultTemplate').html())(item));
                            }
                            frag.appendChild($row[0]);
                            $($row[0]).find('.video-duration').text(function(i, scs) {
                                return formatMediaDuration(scs); 
                            });

                        }
                        this.filteredCurrentPage > 0 ? $('#playback-row-container').append(frag) : $('#playback-row-container').html(frag);
                        if (results.length >= 6 && $('#playback-row-container').find('.ad-banner-holder').length == 0) {
                            var $target = $('#playback-row-container').find('.row').eq(1);
                            $target.after(_.template($('#ad-banner-template').html())(TVSite));
                            checkAdBanner();
                        }
                        this.hoverCheck();
                        var $loadMore = $('#load-more-videos');
                        var qty = results.length;
                        if (!qty || this.perPage > qty) {
                            $loadMore.off().closest('.row').remove();
                        } else {
                            this.addLoadMoreButton();
                        }
                    } else {
                        if ($loadMore) $loadMore.off().closest('.row').remove();
                    }
                }, this));
            },
            loadMoreCheck: function(total) {
                var $loadMore = $('#loadMore');
                if (!total || this.perPage > total) {
                    $loadMore.off().remove();
                } else {
                    $loadMore.find('button').html('LOAD MORE');
                }
            },
            render: function(filters) {
                var getOption = function(opt, selected) {
                    var $opt = $('<option/>').attr('value', opt.code);
                    if (opt.id) $opt.attr('id', opt.id);
                    $opt.html(opt.label || '');
                    if (selected) $opt.attr('selected', 'selected');
                    return $opt[0];
                };
                for (var key in filters) {
                    var frag = document.createDocumentFragment();
                    frag.appendChild(getOption({ code: null, label: key.replace(/_/g, ' ') }));
                    var opts = filters[key].options;
                    for (var i = 0; i < opts.length; i++) {
                        if (opts[i].hasValues) frag.appendChild(getOption(opts[i])); }
                    var $filter = $('[data-code="' + key + '"]');
                    $filter.html(frag);
                    var optionsQty = $filter.find('option');
                    (1 === optionsQty.length) ? $filter.addClass('inactive'): $filter.removeClass('inactive');
                }
            },
            nextPage: function() {
                this.filteredCurrentPage = ++this.filteredCurrentPage;
                this.filterVideos();
            },
            initialize: function() {
                $.ajax({
                    url: TVSite.apiUrl + '/api/codebook/display/video',
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
                            for (var j = 0; j < props.length; j++) { this.filters[code][props[j]] = attr[props[j]]; }
                        }
                    }

                    this.defaultFilters = this.filters
                    this.render(this.filters);

                    $(document).on('change', '.filter-select', _.bind(function(e) {
                        var getSelected = function(el) {
                            return $(el).find('option:selected'); };
                        $('.filter-select').each(_.bind(function(i, el) {
                            if (getSelected(el).attr('id')) this.selected[$(el).data('code')] = $(el).val(); }, this));
                        this.filteredCurrentPage = 0;
                        if (getSelected(e.currentTarget).attr('id')) {
                            this.filterVideos();
                        } else {
                            var controlId = e.currentTarget.id;
                            $("#" + controlId).parent().closest('.filter').removeClass('active');
                            var code = $("#" + controlId).attr("data-code");
                            if (_.has(this.selected, code)) { delete this.selected[code] }
                            if ($('.filter.active').length == 0) { this.reset(); } else { this.filterVideos(); }
                        }
                        $('#' + getSelected(e.currentTarget).attr('id')).parent().closest('.filter').addClass('active');
                    }, this));

                    $(document).on('click', '.reset-filter', _.bind(function() {
                        this.reset();
                    }, this));

                }, this));
            }
        };

        var tmpl = function(template, data) {
            if (template && 'object' == typeof data) {
                return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
                    var keys = key.split("."),
                        v = data[keys.shift()];
                    for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
                    return (typeof v !== "undefined" && v !== null) ? v : "";
                });
            }
        };

        var stripHtml = function(html) {
            var helper = document.createElement('DIV');
            helper.innerHTML = html;
            return helper.textContent || helper.innerText || '';
        };

        var videoOver = function() {
            if (!$(this).hasClass('playing')) {
                $(this)
                    .removeClass('inactive')
                    .addClass('hovered');
            }
        };

        var videoLeave = function() {
            if (!$(this).hasClass('playing')) {
                $(this)
                    .removeClass('hovered')
                    .addClass('inactive');
            }
        };

        var createDesktopScroller = function(id) {
            if (id && $(id).children().length) {
                return new IScroll(id, {
                    interactiveScrollbars: true,
                    scrollX: false,
                    click: true,
                    mouseWheel: true,
                    scrollbars: true
                });
            }
        };

        var searchVideos = function(query, page) {
            if ("undefined" !== typeof query && "undefined" !== typeof page) {
                return $.ajax({
                    url: "//app.tvpage.com/api/videos/search",
                    dataType: 'jsonp',
                    data: {
                        p: page,
                        n: 20,
                        s: query,
                        status: 'approved',
                        "X-login-id": TVSite.loginId
                    }
                });
            }
        };

        var goToResultsPage = function(query) {
            window.location.href = TVSite.baseUrl + '/search#s=' + (query || "");
        };

        var buildVideoData = function(video) {
            var data = video.asset || {};
            data.sources = data.sources || [{ file: data.videoId }];
            data.type = data.type || 'youtube';
            var channel = getPlaybackChannel();
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
        };

        var resizePlayer = function() {
            var $playerHolder = $('#TVPagePlayer');
            if (!isFullScreen && $playerHolder.length) {
                TVPLAYER.resize($playerHolder.width(), $playerHolder.height());
            }
        };

        var getChannelSettings = function() {
            var channel = getPlaybackChannel();
            if ('object' == typeof channel && 'settings' in channel) {
                var settings = channel.settings;
                if ('object' == typeof settings) {
                    return settings;
                } else if ('string' == typeof settings) {
                    return JSON.parse(settings);
                }
            }
        };

        var shallHideOutOfStockProducts = function() {
            var settings = getChannelSettings();
            if ('object' == typeof settings) {
                return 'hideoos' in settings ?
                    settings.hideoos :
                    0;
            }
        };

        var bindPopUp = function() {
            var $productsWrapper = $('#desktop-products-wrapper');
            $productsWrapper.off();

            $productsWrapper.on('click', '.desktop-product', function(e) {
                if (e.type == 'click') {
                    var $this = $(this);
                    sendAnalytics({
                        vd: $this.data('videoId'),
                        ct: $this.data('id')
                    }, 'pk');
                    return;
                }
            });

            $productsWrapper.on('mouseenter', '.desktop-product', function(e) {
                e.preventDefault();
                $('.product-pop-up').hide();
                $('#product-pop-up-' + $(this).data('id'))
                    .css('top', $(this).position().top)
                    .show();
            });

            $('.product-pop-up').off().on('mouseleave', function(e) {
                e.preventDefault();
                $('.product-pop-up').hide();
            });

            $('#desktop-products-holder').on('mouseleave', function(e) {
                e.preventDefault();
                $('.product-pop-up').hide();
            });

        };

        var recreatIscrolls = function() {
            if (isPlaybackPage) {

                if (desktopProductScroller) {
                    desktopProductScroller.destroy();
                    desktopProductScroller = false;
                }

                if (mobileProductScroller) {
                    mobileProductScroller.destroy();
                    mobileProductScroller = false;
                }

                if ($(window).width() < 768) {
                    mobileProductScroller = new IScroll('#mobile-products-holder', {
                        eventPassthrough: true,
                        scrollX: true,
                        scrollY: false,
                        bounce: false,
                        useTransition: false,
                        bindToWrapper: true
                    });
                    $('#mobile-products').css('width', $('.mobile-products-wrapper').width());
                    mobileProductScroller.refresh();

                } else if (isMobile) {
                    desktopProductScroller = new IScroll('#desktop-products-scroller-holder', {
                        scrollX: false,
                        click: true,
                        interactiveScrollbars: true,
                        scrollbars: true,
                        bounce: false,
                        useTransition: false,
                        bindToWrapper: true
                    });
                    desktopProductScroller.on('scrollStart', function() {
                        $('.product-pop-up').hide();
                    });
                } else {
                    if ($('#desktop-products-scroller-holder').length && $('#desktop-products-scroller-holder').children().length) {
                        desktopProductScroller = createDesktopScroller('#desktop-products-scroller-holder');
                        desktopProductScroller.on('scrollStart', function() {
                            $('.product-pop-up').hide();
                        });
                    }
                }

                $('.iScrollVerticalScrollbar').off().on('mouseleave', function(e) {
                    e.preventDefault();
                    $('.product-pop-up').hide();
                });
            }
        }

        var registerProductPanel = function($panel) {
            $.each($panel.find('.product'), function(i, p) {
                sendAnalytics({
                    vd: $(p).data('videoId'),
                    ct: $(p).data('id')
                }, 'pi');
            });
        }

        var renderProd = function(prods,target,templ){
            var html = "";
            if (prods && prods.length) {
                for (var i = 0; i < prods.length; i++) {
                    var data = JSON.parse(prods[i].data || "");
                    prods[i].linkUrl = data.linkUrl;
                    prods[i].imageUrl = data.imageUrl;
                    html += tmpl( templ, prods[i] );
                }
            } else {
                //no prods
            }
            
            if (html.length) {
                $(target).html(html);
                if (($(target).length > 0) && !$(target).is(':hidden')) {
                    registerProductPanel($(target));
                }
            }
        };

        var updateProducts = function(videoId) {
            if ("undefined" === typeof videoId) return console.log("no video id");
            
            $.ajax({
                url:"//app.tvpage.com/api/videos/" + videoId + "/products",
                dataType: 'jsonp',
                data:{
                    "X-login-id": TVSite.loginId
                }
            }).done(function(res){
                
                renderProd( res, "#mobile-products-wrapper",  $("#mobileProduct").html( ));
                renderProd( res, "#desktop-products-wrapper",  $("#desktopProduct").html( ));
                renderProd( res, "#desktop-products-pop-ups",  $("#productPopup").html( ));
                
                setTimeout(function(){
                    bindPopUp();
                    recreatIscrolls();
                    bindProductInteraction();
                });

            });
        };

        var getNextVideo = function(current) {
            if (current != undefined && playbackList) {
                return current == playbackList.length - 1 ?
                    playbackList[0] : playbackList[current + 1];
            }
        };

        var handlePlayerStateChange = function(e) {
            if ('tvp:media:videoended' == e) {
                if (isPlaybackPage) {
                    PlaybackChannelsSearch.handleAutoNext();
                }
            }
        };

        var updateTitle = function(title) {
            if (title) {
                $('#video-playing-title').empty()
                    .html(title);
            }
        };

        var showPlayButton = function() {
            $('#html5-play-button').show().on('click', function() {
                window.TVPLAYER.play();
                $(this).hide();
            });
        };

        var playVideo = function(video) {

            if (video) {
                
                inTimeProducts.destroy();
                inTimeProducts.initialize({
                    videoId: video.id,
                    channelId: getPlaybackChannel().id
                });

                var data = buildVideoData(video);
                if (isMobile) {
                    TVPLAYER.cueVideo(data);
                    if ('youtube' != data.type) {
                        showPlayButton();
                    }
                } else {
                    TVPLAYER.loadVideo(data);
                }

                var url = getVideoUrl(video);
                if (!isHomePage && !isChannelPage) {
                    updateSiteUrlAndTitle(url, video.titleTextEncoded);
                    setTimeout(function(){
                        updateSocialShareLink(url, video);
                    });
                }
            }
        };

        var updateSocialShareLink = function(url, video) {
            $('#facebook-share').attr('href', function(i, val) {
                return 'https://www.facebook.com/sharer/sharer.php?u=' + window.location.protocol + '//' + window.location.host + url;
            });

            $('#twitter-share').attr('href', function(i, val) {
                return 'https://twitter.com/share?text=' + video.title + '%20%7C%0A&url=' + window.location.protocol + '//' + window.location.host + url;
            });
        };

        var getVideoUrl = function(video) {
            var url = TVSite.baseUrl;

            var channel = getPlaybackChannel();
            var playlistId = '';
            if (video.parentId && (video.parentId != channel.id)) {
                playlistId = video.parentId;
            }

            var videoUrl = '/' + channel.id + '-' + (playlistId || "-") + '-' + video.id;

            var videoTitle = '';
            if (video.titleTextEncoded && video.titleTextEncoded.length > 0) {
                videoTitle = '/' + video.titleTextEncoded;
            }

            var channelTitle = '';
            if (channel.titleTextEncoded && channel.titleTextEncoded.length > 0) {
                channelTitle = '/' + channel.titleTextEncoded;
            }

            url += channelTitle + videoTitle + videoUrl;

            return url;
        };

        var getPlaybackChannel = function() {
            return isHomePage ?
                TVSite.activeLatestVideosData :
                TVSite.channelVideosData;
        };

        var updateSiteUrlAndTitle = function(url, title) {
            if (url && window.history && history.pushState) {
                history.pushState({ state: 1 }, null, url);
                if ('string' === typeof title) title = title;
                document.title = title;
            }
        };

        var startPlayback = function(video) {
            playVideo(video);
            TVSite.productCartridges.forEach(function(element, index, array) {
                var targetIsHidden = $(element.target).is(':hidden');
                if (($(element.target).length > 0) && !targetIsHidden) {
                    registerProductPanel($(element.target));
                }
            });

            updateTitle(video.title);

            getVideo(video.id, function(i, video) {
                currentVideo = i;
            });
        };

        var handlePlayerReady = function() {
            resizePlayer();
            if (isPlaybackPage) {
                PlaybackChannelsSearch.handlePlayerReady();
            }
        };

        var getVideo = function(id, callback) {
            if (id != undefined && callback) {
                for (var i = 0; i < playbackList.length; ++i) {
                    if (playbackList[i].id == id) {
                        return callback(i, playbackList[i]);
                    }
                }
                callback(null, null);
            }
        };

        var getVideoFromCartridge = function(id, callback) {
            if (id != undefined && callback && 'function' === typeof callback) {
                var videos = getPlaybackChannel().videos;
                for (var i = 0; i < videos.length; ++i) {
                    if (videos[i].id == id) {
                        callback(i, videos[i]);
                    }
                }
            }
        };

        var renderVideoRow = function(row) {
            if (row.length) {
                var html = playBackRowHtml,
                    $container = $('.loadable-container'),
                    template = isPlaybackPage ? videoHtml : resultHtml;
                for (var i = 0; i < row.length; i++) {
                    var video = row[i];
                    video['url'] = getResultUrl(video);
                    html += tmpl(template, video);
                }
                $container.append(html + '</div>');
                var $videos = $container.find('.video');
                if (desktopBreakPoint && !isMobile) {

                    $videos.hover(videoOver, videoLeave);

                    if (isPlaybackPage) {
                        $videos.on('click', handleSelectedVideo);
                    }

                } else {
                    if (isPlaybackPage) {
                        $videos.tvpTouch({
                            link: false,
                            tap: function($el) {
                                if (!$el.hasClass('playing')) {
                                    var current = '#video-' + playbackList[currentVideo].id,
                                        selectedId = $el.data('id');

                                    $(current).removeClass('playing').addClass('inactive');

                                    getVideo(selectedId, function(i, video) {
                                        playVideo(video);
                                        if (isPlaybackPage) {
                                            $('.tab.details').click();
                                            updatePublishedDate(video);
                                            updateDuration(video);
                                            updateDescription(video);
                                            updateTranscripts(video);
                                        }
                                        if (!isHomePage) {
                                            updateSiteUrlAndTitle($el.data('url'), $el.data('title'));
                                            $('html, body').animate({ scrollTop: 0 }, 300);
                                        }
                                        updateTitle(video.title);
                                        updateProducts(video.id);
                                        $('#video-' + video.id).removeClass('inactive touched').addClass('playing');
                                        currentVideo = i;
                                    });
                                }
                            }
                        });
                    } else {
                        $videos.tvpTouch({
                            target: '_self'
                        });
                    }
                }
                $('html, body').animate({
                    scrollTop: $(document).height()
                });
            }
        };

        var handleVideosBatch = function(batch) {
            if (batch.length) {
                playbackList = playbackList.concat(batch);
                var rows = [],
                    perRow = 3;
                while (batch.length) rows.push(batch.splice(0, perRow));
                for (var i = 0; i < rows.length; i++) {
                    renderVideoRow(rows[i]);
                }
            }
        };

        var sendAnalytics = function(data, type) {
            var channelId = 0;
            var channel = getPlaybackChannel();
            if ("object" === typeof channel) {
                channelId = channel.id;
            }
            if ('object' == typeof data && type) {
                var getCh
                return _tvpa.push(['track', type, $.extend(data, {
                    li: TVSite.loginId,
                    pg: channelId
                })]);
            }
        };

        var showEndOfResults = function() {
            if (!$('.end-of-results').length) {
                $('<p></p>')
                    .addClass('end-of-results')
                    .html('No more results')
                    .appendTo('#desktop-search-results ul');
                checkResultsScroller();
            }
        };

        var handleScrollEnd = function() {
            if (Math.abs(this.maxScrollY) - Math.abs(this.y) < 10) {
                var val = $('#desktop-search-input').val();
                searchVideos(val, liveResultsPage + 1)
                    .done(function(results) {
                        handleVideoResults(results);
                        liveResultsPage = liveResultsPage + 1;
                    });
            }
        };

        var checkResultsScroller = function() {
            if (!resultsScroller) {
                resultsScroller = createDesktopScroller('#desktop-search-results-holder');
                resultsScroller.on('scrollEnd', handleScrollEnd);
            } else {
                setTimeout(function() {
                    resultsScroller.refresh();
                }, 0);
            }
        };

        var resetLiveSearch = function() {
            $('#desktop-search-results ul')
                .empty()
                .closest('#desktop-search-results-holder')
                .hide();
        };

        var getResultUrl = function(result) {
            var redefine = function(val) {
                return ("undefined" !== typeof val && null !== typeof val && val);
            };
            if (result && redefine(result, "entityTitleParent") && redefine(result, "titleTextEncoded") && redefine(result, "entityIdParent") && redefine(result, "id")) {
                return TVSite.baseUrl + '/' + result.entityTitleParent + "/" + result.titleTextEncoded + "/" + result.entityIdParent + "---" + result.id;
            }
        };

        var handleVideoResults = function(results) {
            if (results.length) {
                var html = '',
                    holder = '#desktop-search-results-holder';
                for (var i = 0; i < results.length; ++i) {
                    var result = results[i];
                    result['url'] = getResultUrl(result);
                    if ('description' in result) result.description = stripHtml(result.description);
                    html += tmpl(liveResultHtml, result);
                }

                $('#desktop-search-results ul')
                    .append(html)
                    .closest(holder)
                    .show();
                checkResultsScroller();

            } else {
                showEndOfResults();
            }
        };

        var getVideoDescription = function(video) {
            var description = '';
            if ('description' in video && video.description) {
                description = video.description;
            } else if ('asset' in video && video.asset.description) {
                description = video.asset.description;
            }
            return description;
        };

        var handleShowMore = function(e) {
            e.preventDefault();
            var $detailsTab = $('.tab-content.details'),
                $showMoreContent = $('#show-more-content');
            if ($detailsTab.hasClass('compressed')) {
                $detailsTab.removeClass('compressed').addClass('scrollable');
                $showMoreContent.text('SHOW LESS');
            } else {
                $('#tab-content-0').animate({ scrollTop: 0 }, 300);
                $detailsTab.addClass('compressed').removeClass('scrollable');
                $showMoreContent.text('SHOW MORE');
            }
        };

        var descriptionRows = function() {
            var lineHeight = parseInt($('.video-description').css('line-height'), 10);
            return (Math.round($('.video-description').height() / lineHeight));
        };

        var appendShowMore = function() {
            if (!$('.show-more-row').length) {
                var showMore = '<div class="show-more"></div>';
                $('<div></div>').addClass('row show-more-row').html(showMore).appendTo('#details-transcript');

                $('<button></button>').text('SHOW MORE').attr('id', 'show-more-content')
                    .on('click', handleShowMore).appendTo('.show-more');
            }
        };

        var removeShowMore = function() {
            $('#show-more-content').off();
            $('.show-more-row').remove();
        };

        var formatTime = function(time) {
            if (time !== 'undefined') {
                var date = new Date(0, 0, 0);
                date.setSeconds(Number(time));
                var hour = (date.getHours() ? date.getHours() + 'hrs ' : '');
                return hour + date.getMinutes() + 'mins ' + date.getSeconds() + 'secs';
            }
        };

        var formatDate = function(date) {
            if (date !== 'undefined') {
                var date = new Date(Number(date) * 1000);
                return date.toDateString();
            }
        };

        var updateDuration = function(video) {
            if (video && ('duration' in video || 'asset' in video)) {
                $('#details-transcript .duration').html(formatTime(video.duration || video.asset.mediaDuration));
            }
        };

        var updatePublishedDate = function(video) {
            if (video && 'date_created' in video) {
                $('.video-date-text').html(formatDate(video.date_created));
            }
        };

        var updateDescription = function(video) {
            if (video) {
                removeShowMore();
                if (!$('.tab-content.details').hasClass('compressed')) {
                    $('.tab-content.details').addClass('compressed').removeClass('scrollable');
                }
                $('.video-description').html(getVideoDescription(video) || '');
                if (descriptionRows() > 2) {
                    appendShowMore();
                }
            }
        };

        var getVideoTranscript = function(videoId, callback) {
            if ('undefined' !== typeof videoId && callback) {
                $.ajax({
                    url: "//app.tvpage.com/api/videos/" + videoId + "/transcript",
                    dataType: 'jsonp',
                    data: {
                        'X-login-id': TVSite.loginId
                    }
                }).done(callback);
            }
        };

        var updateTranscripts = function(video) {
            var isObj = function(val){return "object" === typeof val};
            if (video && isObj(video) && 'id' in video) {
                getVideoTranscript(video.id, function(res) {
                    if (res && isObj(res) && "transcripts" in res && res.transcripts && res.transcripts.trim().length) {
                        var text = res.transcripts;
                        $('.video-transcript').html('string' === typeof text ? text.replace(/(\r\n|\n|\r)/gm, '<br>') : '');
                        $('.transcript-text').removeClass('hidden');
                    } else {
                        $('.video-transcript').html("");
                        $('.transcript-text').addClass('hidden');
                    }
                });
            }
        };

        if (isPlaybackPage) {
            var handleSelectedVideo = function(e) {
                e.preventDefault();
                if (!$(this).hasClass('playing')) {
                    var current = '#video-' + playbackList[currentVideo].id;
                    $('.video').removeClass('playing').addClass('inactive');
                    getVideo($(this).data('id'), function(i, video) {
                        playVideo(video);
                        if (isPlaybackPage) {
                            $('.tab.details').click();
                            updatePublishedDate(video);
                            updateDuration(video);
                            updateDescription(video);
                            updateTranscripts(video);
                        }
                        updateTitle(video.title);
                        updateProducts(video.id);
                        if (!isHomePage && !isChannelPage) {
                            updateSiteUrlAndTitle($(this).data('url'), $(this).data('title'));
                            $('html, body').animate({ scrollTop: 0 }, 300);
                            $('#video-' + video.id).removeClass('inactive hovered').addClass('playing');
                            currentVideo = i;
                        }
                    });
                }
            };
        }

        var isLatestVideo = function(el) {
            if (el) {
                return $(el).closest('#latest-videos').length;
            }
        };

        var isPlaybackVideo = function(el) {
            if (el) {
                return $(el).closest('#playback').length;
            }
        };

        /**
         * Header Interaction
         */
        $('#mobile-channels-menu-button').tvpTouch({
            link: false,
            tap: function($el) {
                $el.toggleClass('active');
                $('#mobile-channels-menu').slideToggle(200);
            }
        });

        $('#mobile-search-button').tvpTouch({
            link: false,
            tap: function($el) {
                $el.toggleClass('active');
                $('#mobile-search').slideToggle(200);
            }
        });

        $('#more-sites-button').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $('#more-sites-menu').slideToggle(20);
        });

        $('#desktop-channels-menu-button').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).toggleClass('active');
            $('#desktop-channels-menu').slideToggle(20);
        });


        /**
         * Desktop Search (with Live Search)
         */
        var $desktopSearchInput = $('#desktop-search-input'),
            $desktopSearchButton = $('#desktop-search-button');

        $desktopSearchInput.on("keypress", function(e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                //  goToResultsPage(val);
            }
        });

        $desktopSearchInput.on('keyup', $.debounce(350, function(e) {
            e.preventDefault();
            var val = $(e.target).val(),
                $spinner = $('#spinner'),
                $nullResults = $('#null-results');

            resetLiveSearch();

            if (val) {

                $nullResults.hide();
                $spinner.show();

                liveResultsPage = 0;
                searchVideos(val, liveResultsPage).done(function(results) {
                    if (results.length) {
                        $nullResults.hide();
                        $spinner.hide();
                        handleVideoResults(results);
                    } else {
                        $spinner.hide();
                        $nullResults.show();
                    }
                });
            } else {
                $nullResults.hide();
                $spinner.hide();
            }
        }));

        $desktopSearchInput.on('focusin focusout', function(e) {
            e.preventDefault();
            var $nullResults = $('#null-results');

            if (e.type == 'focusin') {
                $(this).val('').toggleClass('active');
            } else {
                $(this).toggleClass('active');
                $nullResults.hide();
                resetLiveSearch();
            }
        });

        $desktopSearchButton.on('click', function(e) {
            e.preventDefault();
            var val = $desktopSearchInput.val();

            var $spinner = $('#spinner'),
                $nullResults = $('#null-results');

            resetLiveSearch();

            if (val) {

                $nullResults.hide();
                $spinner.show();

                liveResultsPage = 0;

                searchVideos(val, liveResultsPage).done(function(results) {
                    if (results.length) {
                        $nullResults.hide();
                        $spinner.hide();
                        handleVideoResults(results);
                    } else {
                        $spinner.hide();
                        $nullResults.show();
                    }
                });
            } else {
                $nullResults.hide();
                $spinner.hide();
            }
        });


        /**
         * Mobile Search
         */
        var $mobileSearchInput = $('#mobile-search-input');

        $mobileSearchInput.on('keyup', function(e) {
            e.preventDefault();
            var val = $(this).val();
            if (e.keyCode == 13 && val) {
                goToResultsPage(val);
            }
        });

        $mobileSearchInput.on('focusin focusout', function(e) {
            e.preventDefault();
            $(this).attr('value', e.type == 'focusin' ? '' : 'Search for videos');
        });


        /**
         * Products Scrollers
         */
        //recreatIscrolls();

        $(window).on('load', function() {
            var timeout = setTimeout(function() {
                $('.video-img').trigger('load-images');
                $('.brand-logo-img').trigger('load-images');
            }, 2000);
        });


        /**
         * Channel Sliders
         */
        if (isHomePage) {

            // Brands slider
            $('#brands-logo-slider').slick({
                infinite: true,
                speed: 900,
                slidesToShow: 4,
                slidesToScroll: 4,
                responsive: [{
                    breakpoint: 768,
                    settings: {
                        arrows: false,
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                }]
            });

            //Added hover on homepage channel-grid
            $('.desktop-channel').hover(
                function() {
                    $(this).addClass('hovered');
                },
                function() {
                    $(this).removeClass('hovered');
                });
        }

        /**
         * Player
         */
        if (isPlaybackPage) {
            window.TVPLAYER = new TVPage.player({
                divId: 'TVPagePlayer',
                swf: '//d2kmhr1caomykv.cloudfront.net/player/assets/tvp/tvp-1.5.2-flash.swf',
                displayResolution: playerResolution,
                analytics: { tvpa: true },
                techOrder: playerTechOrder,
                onReady: handlePlayerReady,
                onStateChange: handlePlayerStateChange,
                controls: {
                    active: true,
                    seekBar: { progressColor: '#779050' },
                    floater: { removeControls: ['tvplogo'] }
                }
            });
        }


        /**
         * Fullscreen poll/check
         */
        if (BigScreen) {
            BigScreen.onchange = function() {
                isFullScreen = !isFullScreen;
            };
        }


        /**
         * Resize player on window resizing
         */
        $(window).resize(function() {
            if (!isFullScreen) { resizePlayer(); }
        });


        /**
         * Desktop Products
         */
        bindPopUp();

        var bindProductInteraction = function() {
            $('.mobile-product').off().tvpTouch({
                tap: function($el) {
                    sendAnalytics({
                        vd: $el.data('videoId'),
                        ct: $el.data('id')
                    }, 'pk');
                }
            });

            $('#desktop-products-pop-ups').off().on('click', '.product-link', function(e) {
                var $popUp = $(this).closest('.product-pop-up');
                sendAnalytics({
                    vd: $popUp.data('videoId'),
                    ct: $popUp.data('id')
                }, 'pk');
            });
        };
        bindProductInteraction();

        /**
         * Retrofits
         */
        if (isFireFox) {
            $('.tvp-slider-arrow').css('top', '-20px');
            $('#brands-logos .tvp-slider-arrow').css('top', '-10px');
        }


        /**
         * Hide header menus when user do external clicks
         */
        $(document).mouseup(function(e) {
            var $moreSites = $('#more-sites-menu'),
                $moreSitesMenuButton = $('#more-sites-button'),
                $channelsMenu = $('#desktop-channels-menu'),
                $channelsMenuButton = $('#desktop-channels-menu-button'),
                $channelsMenuButtonSpan = $('#desktop-channels-menu-button > span');

            if (!$moreSites.is(e.target) && !$moreSitesMenuButton.is(e.target) && $moreSites.has(e.target).length === 0) {
                if ($moreSites.css('display') != 'none') {
                    $moreSites.hide();
                }
            }

            if (!$channelsMenuButtonSpan.is(e.target) && !$channelsMenu.is(e.target) && !$channelsMenuButton.is(e.target) && $channelsMenu.has(e.target).length === 0) {
                if ($channelsMenu.css('display') != 'none') {
                    $channelsMenuButton.toggleClass('active');
                    $channelsMenu.hide();
                }
            }
        });


        /**
         * Handle orientation change
         */
        if (isMobile && !isHomePage) {
            window.matchMedia('(orientation: portrait)').addListener(function(m) {
                if (!desktopProductScroller) {
                    desktopProductScroller = new IScroll('#desktop-products-scroller-holder', {
                        scrollX: false,
                        click: true,
                        scrollbars: true,
                        interactiveScrollbars: true,
                        bounce: false,
                        useTransition: false,
                        bindToWrapper: true
                    });
                    desktopProductScroller.on('scrollStart', function() {
                        $('.product-pop-up').hide();
                    });

                    bindPopUp();
                }

                if (!mobileProductScroller) {
                    mobileProductScroller = new IScroll('#mobile-products-holder', {
                        eventPassthrough: true,
                        scrollX: true,
                        scrollY: false,
                        bounce: false,
                        useTransition: false,
                        bindToWrapper: true
                    });

                    var wrapperWidth = $('.mobile-products-wrapper').width();
                    $('#mobile-products').css('width', wrapperWidth);

                    mobileProductScroller.refresh();
                }
            });
        }

        if (!isHomePage && !isChannelPage) {
            $("#video-" + TVSite.videoId).removeClass('inactive').addClass('playing');
        }

        /*
          handle facebook/twitter share
        */
        $('#facebook-share').off().on('click', function(e) {
            e.preventDefault();
            var url = $('#facebook-share').attr("href");
            window.open(url, this.target, 'height=353,width=553,resizable=yes,scrollbars=no');
        });
        $('#twitter-share').off().on('click', function(e) {
            e.preventDefault();
            var url = $('#twitter-share').attr("href");
            window.open(url, this.target, 'height=353,width=553,resizable=yes,scrollbars=no');
        });

        /*
          Firefox CSS retrofit
        */
        if (isFireFox) {
            $('#load-more-videos').css('top', '-20px');
            $('#load-more-results').css('top', '-20px');
        }

        /**
         * Channel title
         */
        if (isPlaybackPage) {
            var $title = $('#playback .title'),
                channel = getPlaybackChannel(),
                title = '';
            if (channel && channel.entityType === '5' && channel.description) {
                if (-1 !== channel.title.indexOf('-')) {
                    title = "MORE " + channel.title.split('-')[0] + " VIDEOS";
                } else {
                    title = "MORE " + channel.title + " VIDEOS";
                }
            } else {
                title = "MORE " + channel.title + " VIDEOS";
            }
            $title.data({
                'entityType': channel.entityType
            });
            $title.html(title + ' <span class="qty">' + $title.data('channelQty') + '</span>');
        }

        /**
         * Video Details & Transcripts
         */
        if (descriptionRows() > 2) {
            appendShowMore();
        }

        $('.duration').text(function(i, text) {
            return formatTime(text);
        });

        if (!isMobile) {
            $('.tab').hover(function() {
                $(this).addClass('hovered');
            }, function() {
                $(this).removeClass('hovered');
            });
        }

        $('#details-transcript').on('click', '.tab', function(e) {

            var i = $(this).attr('id').split('-').pop();

            if (!$(this).hasClass('active')) {

                // Clear
                $('.tab.active').removeClass('active');
                $('.tab-content.active').removeClass('active').fadeOut(10);

                // Activate requested tab
                $(this).addClass('active');
                var $content = $('#tab-content-' + i);
                $content.fadeIn('fast').addClass('active');

                if ($content.hasClass('transcript')) {
                    $('.tab-content.details').addClass('compressed').removeClass('scrollable');
                    removeShowMore();
                }

                if ($content.hasClass('details')) {
                    if (descriptionRows() > 2) {
                        appendShowMore();
                    } else {
                        removeShowMore();
                    }
                }
            }

        });

        if (isChannelPage) {
            Filters.initialize();
            var channelQty = TVSite.activeChannelVideosTotal;
            $('.channel-poster-holder').find('.channel-qty').html(channelQty);
        }

        var checkAdBanner = function() {
            if (isChannelPage || isPlaybackPage) {
                if (TVSite.channelId == TVSite.proAudioChannelId) {
                    var $banner = $('.ad-banner');
                    var $bannerMobile = $('.ad-banner-mobile');
                    var changeDisplay = function($el, val) {
                        return $el.css("display", val || '');
                    }
                    var handleBanner = function(width) {
                        if (width && width < 768) {
                            changeDisplay($bannerMobile, "block");
                            changeDisplay($banner, "none");
                        } else {
                            changeDisplay($banner, 'block');
                            changeDisplay($bannerMobile, 'none');
                        }
                    };

                    handleBanner($(window).width());

                    window.matchMedia('(orientation: portrait)').addListener(function() {
                        handleBanner($(window).width());
                    });

                    var $holder = $('.presented-holder');
                    changeDisplay($holder, "block");
                    changeDisplay($('.ad-banner-holder'), "block");

                    var path = window.location.protocol + '//' + window.location.host + TVSite.baseUrl;
                    $bannerMobile.attr("href", path + '/c/' + TVSite.proAudioAd.name + '/' + TVSite.proAudioAd.id + '---');
                    $banner.attr("href", path + '/c/' + TVSite.proAudioAd.name + '/' + TVSite.proAudioAd.id + '---');
                    $holder.attr("href", path + '/c/' + TVSite.proAudioAd.name + '/' + TVSite.proAudioAd.id + '---');
                }
            }
        };
        checkAdBanner();


        /**
         * In-time Product
         */
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
                    return TVSite.apiUrl + '/api/spot/link/time/' + this.settings.channelId + '/' + this.settings.videoId;
                }
            },

            getProducts: function(callback) {
                if (callback && 'function' === typeof callback) {
                    return $.ajax({
                        url: this.getSpotTimeUrl(),
                        dataType: 'json'
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
                    html += tmpl(this.productTemplate, product);
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
                return Math.floor(TVPLAYER.getCurrentTime() * 1000);
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

        if (isPlaybackPage || isHomePage) {
            $('.video-duration').text(function(i, scs) {
                return formatMediaDuration(scs); 
            });
        }

        /**
         * Playback channels search
         */
        if (isPlaybackPage || isHomePage || isChannelPage) {

            var PlaybackChannelsSearch = {

                $el: $('.channel-search-form'),

                videoTemplate: '<div id="video-{id}" class="video inactive" data-id="{id}" data-url="{url}" data-title="{title}"><a href="{url}" title="{title}"><div class="video-img-holder"><div class="video-img" style="background-image:url({asset.thumbnailUrl});"></div><div class="video-img-overlay"></div><p class="video-duration">{asset.prettyDuration}</p><p class="video-play-label">PLAY VIDEO</p><p class="video-playing-label">NOW PLAYING</p></div><p class="video-title">{title}</p></a></div>',

                channelId: null,

                channelVideosPage: 0,

                searchResultsPage: 0,

                query: null,

                isSameSearch: null,

                lastChannelVideosPage: null,

                lastSearchResultsPage: null,

                nullResults: null,

                limitPerPage: 9,

                videoList: [],

                activeVideoId: null,

                activeChannelId: null,

                initialPlay: true,

                setChannelId: function() {
                    var entityType, channelId;
                    channelId = TVSite.channelVideosData.id;
                    entityType = $('#playback .title').data('entityType');
                    if (channelId > 0) {
                        this.channelId = channelId;
                    }
                    if (entityType > 0) {
                        this.channelEntityType = entityType;
                    }
                },

                initialize: function() {

                    $('.channel-spinner').height($('.channel-videos').height());
                    
                    if ($(window).width() < 768) {
                        $('.channel-search-no-results').height($('.channel-videos').height());
                    }
                    
                    this.bindEvents();
                    
                    var channel = TVSite.channelVideosData;
                    if ("object" === typeof channel && "undefined" !== typeof channel.videos) {
                        this.videoList = channel.videos;
                    }

                    this.cacheVideoList = this.videoList.slice(0);
                },

                startPlayback: function(video) {
                    if (video && ('object' === typeof video)) {
                        playVideo(video);
                        updateProducts(video.id);
                        this.activeVideoId = video.id;

                        if (TVSite.productCartridges && TVSite.productCartridges.length) {
                            TVSite.productCartridges.forEach(function(element, index, array) {
                                var targetIsHidden = $(element.target).is(':hidden');
                                if (($(element.target).length > 0) && !targetIsHidden) {
                                    registerProductPanel($(element.target));
                                }
                            });
                        }

                        updateTitle(video.title);
                    }
                },

                handlePlayerReady: function() {

                    if (this.initialPlay && 'channelVideosData' in TVSite) {
                        var video = TVSite.channelVideosData.video;
                        this.startPlayback(video);
                        this.initialPlay = false;
                    }
                },

                bindEvents: function() {
                    this.bindVideoThumbEvents('.channel-videos');
                    this.$el.on('keyup', $.debounce(350, $.proxy(this.handleKeyup, this)));
                    this.bindLoadMoreVideosEvent();
                },

                fetchLatestVideos: function(callback) { 
                    if ('function' !== typeof callback) return console.log("not a function");
                    $.ajax({
                        url: "//app.tvpage.com/api/channels/" + TVSite.activeLatestVideosData.id + "/videos",
                        dataType: 'jsonp',
                        data: {
                            p: this.channelVideosPage,
                            n: this.limitPerPage,
                            'X-login-id': TVSite.loginId
                        }
                    }).done(callback);
                },

                setChannelFetchPage: function() {
                    this.channelVideosPage = 2;
                    if ($('.channel-videos').data('fetchPage')) this.channelVideosPage = $('.channel-videos').data('fetchPage');
                },

                handleChannelVideos: function(res) {
                    if (res && ('cartridgeData' in res)) {
                        if ('channel' in res.cartridgeData) {
                            $('.channel-videos').data('fetchPage', res.cartridgeData.fetchPage || 0);
                            var channel = res.cartridgeData.channel,
                                channelVideos = channel.videos;
                            this.lastChannelVideosPage = null;
                            this.lastChannelVideosPageCheck(channelVideos);
                            if (channelVideos.length) {
                                this.videoList = channelVideos.slice(0); // copying the array
                                this.renderChannelVideos(channelVideos);
                            }
                        }
                    }
                },

                renderChannelVideos: function(videos) {
                    if (videos) {
                        this.renderVideoRows(this.rowerize(videos), function(html) { $('.channel-videos').html(html); });
                        this.initLoadMoreChannelVideos();
                        this.showChannelVideosPanel();
                        this.bindVideoThumbEvents('.channel-videos');
                    }
                },

                initLoadMoreChannelVideos: function() {
                    if (!this.lastChannelVideosPage) {
                        $('.channel-videos').append(this.loadMoreRowsTemplate('videos'));
                        this.bindLoadMoreVideosEvent();
                    }
                },

                handleChannelVideosFromLoadMore: function(res) {
                    $('.channel-videos').data('fetchPage', this.channelVideosPage);
                    var videos = (res && res.length) ? res : [];
                    this.lastChannelVideosPageCheck(videos);
                    this.videoList = this.videoList.concat(videos.slice(0)); // copying loaded page and add to video list
                    this.cacheVideoList = this.videoList.slice(0);
                    this.renderVideoRows(this.rowerize(videos), function(html) { 
                        $('.channel-videos .loadable-container').append(html || ""); 
                    });
                    this.initLoadMoreChannelVideos();
                    this.bindVideoThumbEvents('.channel-videos');
                },

                bindLoadMoreVideosEvent: function() {
                    var that = this;
                    var getNextVideosPage = function(callback){
                        that.channelVideosPage = ++that.channelVideosPage;
                        var channelId = 0;
                        var channel = getPlaybackChannel();
                        if ("object" === typeof channel) {
                            channelId = channel.id;
                        }
                        $.ajax({
                            url: "//app.tvpage.com/api/channels/"+channelId+"/videos",
                            dataType: 'jsonp',
                            data: {
                                p: that.channelVideosPage,
                                n: that.limitPerPage,
                                "X-login-id": TVSite.loginId
                            }
                        }).done(callback);
                    };

                    var $loadMore = $('.channel-videos').find('.load-more');
                    if (!$loadMore.length) return console.log("no load more btn");

                    if (isPlaybackPage || isChannelPage) {
                        $loadMore.off().fadeIn(10).on('click', function(e) {
                            if (isFiltered) {
                                Filters.nextPage();
                            } else {
                                getNextVideosPage( $.proxy(that.handleChannelVideosFromLoadMore, that) );
                            }
                            $(this).off().closest('.row').remove();
                        });

                    } else {
                        $loadMore.fadeIn(10).on('click', function(e) {
                            getNextVideosPage( $.proxy(that.handleChannelVideosFromLoadMore, that) );
                            $(this).off().closest('.row').remove();
                        });
                    }
                },

                resetSearch: function() {
                    this.videoList = this.cacheVideoList || [];
                    this.isSameSearch = null;
                    this.lastSearchResultsPage = null;
                    this.query = null;
                    this.searchResultsPage = 0;
                    this.channelVideosPage = 0;
                    $('.channel-search-results').find('.video').off();
                    $('.channel-search-results').empty();
                },

                targetCheck: function(e) {
                    return (e && ('target' in e) && e.target);
                },

                handleKeyup: function(e) {
                    if (e && ('target' in e) && e.target) {
                        var query = e.target.value.trim();
                        if (query === '' || !query) {
                            this.showChannelVideosPanelDelayed();
                            return this.resetSearch();
                        }
                        this.isSameSearchCheck(query);
                        if (!this.isSameSearch) {
                            this.resetSearch();
                            this.start(query, e.target);
                        }
                    }
                },

                isSameSearchCheck: function(query) {
                    if (this.query && query === this.query) {
                        this.isSameSearch = true;
                    } else {
                        this.isSameSearch = false;
                    }
                },

                start: function(query, target) {
                    var that = this;
                    this.query = query;
                    this.target = target;
                    this.showSpinnerPanel();
                    this.search($.proxy(this.handleSearchResults, this));
                },

                lastSearchResultsPageCheck: function(res) {
                    if (!res.length || res.length < this.limitPerPage) this.lastSearchResultsPage = true;
                },

                lastChannelVideosPageCheck: function(res) {
                    if (!res.length || res.length < this.limitPerPage) this.lastChannelVideosPage = true;
                },

                handleSearchResults: function(res) {
                    if (typeof res === 'object' && ('cartridgeData' in res) && ('search' in res.cartridgeData)) {
                        if (res.cartridgeData.search != $('.channel-search-form input').val())
                            return;
                    }

                    var results = ('object' === typeof res && ('cartridgeData' in res) && ('channel' in res.cartridgeData)) ? res.cartridgeData.channel.videos : res;
                    if (results) {
                        this.lastSearchResultsPageCheck(results);
                        if (results.length) {
                            if (this.searchResultsPage > 1) {
                                this.videoList = this.videoList.concat(results);
                            } else {
                                this.videoList = results;
                            }

                            this.renderSearchResults(results);
                            this.nullResults = false;
                        } else if (this.searchResultsPage > 1) {
                            // Asking for more results on a query that has no results
                        } else {
                            this.nullResults = true;
                            this.showNoresultsPanel();
                        }
                    }
                },

                search: function(callback) {
                    this.setChannelId();
                    $.ajax({
                        url: "//app.tvpage.com/api/videos/search",
                        dataType: 'jsonp',
                        data: {
                            'X-login-id': TVSite.loginId,
                            p: this.searchResultsPage,
                            n:this.limitPerPage,
                            s: this.query,
                            status: 'approved',
                            channelsLimit: TVSite.channelVideosData.id
                        }
                    }).done(callback);
                },

                buildUrl: function(video) {
                    if (video) {
                        var url = TVSite.baseUrl + '/' + getPlaybackChannel().titleTextEncoded + '/' + video.titleTextEncoded + '/';
                        return url += getPlaybackChannel().id + '---' + video.id;
                    }
                },

                rowerize: function(data) {
                    if (data && data.length) {
                        var rows = [],
                            perRow = 3;
                        while (data.length) rows.push(data.splice(0, perRow));
                        return rows;
                    }
                },

                renderVideosRow: function(row) {
                    var html = '<div class="row clearfix">',
                        i = 0;
                    for (i; i < row.length; i++) {
                        var video = row[i];
                        video['url'] = this.buildUrl(video);
                        html += tmpl(this.videoTemplate, row[i]);
                    }
                    return html + '</div>';
                },

                renderVideoRows: function(rows, target) {
                    if (rows && rows.length && ('undefined' !== typeof target)) {
                        var html = '',
                            i = 0;
                        for (i; i < rows.length; i++) {
                            html += this.renderVideosRow(rows[i]);
                        }
                        if ('function' === typeof target) return target(html);
                        $(target).append(html);
                    }
                },

                renderSearchResults: function(data) {
                    var cloneVideos = data.slice(0);
                    var rows = this.rowerize(cloneVideos);
                    this.renderVideoRows(rows, '.channel-search-results');
                    this.initLoadMoreResults();
                    this.showSearchResultsPanel();
                    this.bindVideoThumbEvents('.channel-search-results');
                },

                getNextVideo: function(currentIndex, callback) {
                    if (('undefined' !== typeof currentIndex) && ('function' === typeof callback)) {
                        if (currentIndex == this.videoList.length - 1) {
                            callback(this.videoList[0]);
                        } else {
                            callback(this.videoList[currentIndex + 1]);
                        }
                    }
                },

                handleNextvideo: function(nextVideo) {
                    if ('object' === typeof nextVideo) {
                        updateTitle(nextVideo.title);
                        updateDescription(nextVideo);
                        updateTranscripts(nextVideo);
                        updateProducts(nextVideo.id);
                        $('#video-' + nextVideo.id).removeClass('inactive hovered').addClass('playing');
                        this.startPlayback(nextVideo);
                    }
                },

                getVideoIndex: function(videoId, callback) {
                    if (('undefined' !== typeof videoId) && ('function' === typeof callback)) {
                        var i = 0;
                        for (i; i < this.videoList.length; i++) {
                            if (videoId == this.videoList[i].id) return callback(i);
                        }
                        callback(null);
                    }
                },

                updateVideoElements: function() {
                    $('.channel-videos').find('.video.playing').removeClass('playing').addClass('inactive');
                },

                handleAutoNext: function() {
                    var that = this;
                    this.updateVideoElements();
                    this.getVideoIndex(this.activeVideoId, function(index) {
                        that.getNextVideo(index, $.proxy(that.handleNextvideo, that));
                    });
                },

                getVideoFromList: function(videoId, callback) {
                    if (('undefined' !== typeof videoId) && ('function' === typeof callback)) {
                        var i = 0;
                        for (i; i < this.videoList.length; i++) {
                            if (videoId == this.videoList[i].id) return callback(this.videoList[i]);
                        }
                        callback(null);
                    }
                },

                handleSelectedVideo: function($video) {
                    if (!$(this).hasClass('playing')) {
                        var that = this;
                        this.updateVideoElements();
                        this.getVideoFromList($video.data('id'), function(video) {
                            playVideo(video);
                            updatePublishedDate(video);
                            updateDuration(video);
                            updateDescription(video);
                            updateTranscripts(video);
                            updateTitle(video.title);
                            updateProducts(video.id);
                            that.activeVideoId = video.id;
                        });
                        
                        updateSiteUrlAndTitle($video.data('url'), $video.data('title'));
                        $video.removeClass('inactive hovered').addClass('playing');
                        $('html, body').animate({ scrollTop: 0 }, 300);
                    }
                },

                bindVideoThumbEvents: function(delegate) {
                    if ('undefined' === typeof delegate) return console.log("no delegate");
                    var $videos = $(delegate).find('.video'), that = this;
                    if (!isMobile && isPlaybackPage) {
                        $videos.off().hover(videoOver, videoLeave);
                        $(delegate).off().on('click', '.video', function(e) {
                            if (e) e.preventDefault();
                            $.proxy(that.handleSelectedVideo, that, $(this))();
                        });
                    } else if (isPlaybackPage) {
                        $videos.off().tvpTouch({
                            link: false,
                            tap: function($el) {
                                $.proxy(that.handleSelectedVideo, that, $el)();
                            }
                        });
                    }
                },

                loadMoreRowsTemplate: function(type) {
                    if ('undefined' === type || $('#load-more-' + type).length) return;
                    $('#load-more-' + type).off().closest('.row').remove();
                    var $button = $('<div/>').attr('id', 'load-more-' + type)
                        .addClass('load-more').html('<p>LOAD MORE</p>'),
                        $row = $('<div/>').addClass('row').append($button);
                    return $row.append($('<div/>').addClass('load-more-row').append($button));
                },

                initLoadMoreResults: function() {
                    if (!this.lastSearchResultsPage) {
                        var that = this,
                            $channelResults = $('.channel-search-results');
                        $channelResults.append(this.loadMoreRowsTemplate('results'));
                        $channelResults.find('.load-more').fadeIn(10).on('click', function(e) {
                            that.searchResultsPage = ++that.searchResultsPage;
                            that.search($.proxy(that.handleSearchResults, that));
                            $(this).off().closest('.row').remove();
                        });
                    }
                },

                showChannelVideosPanelDelayed: function() {
                    var that = this;
                    if ($('.channel-videos').hasClass('hidden')) {
                        this.showSpinnerPanel();
                        setTimeout(function() { that.showChannelVideosPanel(); }, 450);
                    }
                },

                hideSpinner: function() {
                    $('.channel-spinner').addClass('hidden');
                },

                hideChannelVideos: function() {
                    $('.channel-videos').addClass('hidden');
                },

                hideSearchPanels: function() {
                    $('.channel-search-no-results').addClass('hidden');
                    $('.channel-search-results').addClass('hidden');
                },

                showSpinnerPanel: function() {
                    this.hideSearchPanels();
                    this.hideChannelVideos();
                    $('.channel-spinner').removeClass('hidden');
                },

                showNoresultsPanel: function() {
                    this.hideSpinner();
                    $('.channel-search-results').addClass('hidden');
                    this.hideChannelVideos();
                    $('.channel-search-no-results').removeClass('hidden');

                    $('.no-results-notice').find('p').html('We could not find any results with: ');

                    var that = this;
                    $('.no-results-notice').find('p').html(function(a, b) {
                        return b + that.query;
                    });

                },

                showSearchResultsPanel: function() {
                    this.hideSpinner();
                    $('.channel-search-no-results').addClass('hidden');
                    this.hideChannelVideos();
                    $('.channel-search-results').removeClass('hidden');
                },

                showChannelVideosPanel: function() {
                    this.hideSearchPanels();
                    this.hideSpinner();
                    $('.channel-videos').removeClass('hidden');
                }

            };

            PlaybackChannelsSearch.initialize();
        }

    });
}(window.jQuery, window.IScroll, window.BigScreen, window, document));


// Search results widget.
if ($('body').hasClass('search-page')) {
    (function($) {
        $(function() {

            var TEMPLATE = '';
            var TEMPLATE_URL = location.protocol + TVSite.apiUrl + '/tvsite/' + TVSite.domain + '/cartridge/' + TVSite.searchResultsTmpl;
            var RESULTS_LIMIT = 9;

            var tmplEngine = function(template, data) {
                if (template && 'object' == typeof data) {
                    return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
                        var keys = key.split("."),
                            v = data[keys.shift()];
                        for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
                        return (typeof v !== "undefined" && v !== null) ? v : "";
                    });
                }
            };
            var rowerize = function(data, per) {
                if (data && $.isArray(data)) {
                    var raw = data.slice(0),
                        rows = [];
                    while (raw.length) rows.push(raw.splice(0, per || 3));
                    return rows;
                }
            };
            var urlParams = (function() {
                if ("undefined" === typeof window.location) return {};
                var ret = {};
                var params = window.location.href.split("/").pop();
                if (params.length) {
                    params = params.substr(1).trim();
                    var kv = params.split("=");
                    ret[ kv[0] ] = kv[1];
                }
                return ret;
            }());

            var fetchParams = $.extend({
                n: RESULTS_LIMIT,
                status: 'approved',
                p: 0
            }, urlParams); 
            var getResults = function() {
                return $.ajax({
                    url: "//app.tvpage.com/api/videos/search",
                    dataType: 'jsonp',
                    data: {
                        'X-login-id': TVSite.loginId
                    },
                    data: fetchParams
                });
            };
            var getTemplate = $.ajax({
                url: TEMPLATE_URL + '?X-login-id=' + TVSite.loginId,
                dataType: 'json',
                type: 'post'
            });
            var renderRow = function(tmpl, row) {
                if (tmpl && row && $.isArray(row)) {
                    var html = '<div class="row clearfix search-results-row">';
                    for (var i = 0; i < row.length; i++) {
                        html += tmplEngine(tmpl, row[i]);
                    }
                    return html += '</div>';
                }
            };

            var $widget = $('#search-results');
            var msg = '';
            if (urlParams.s) {
                msg = 'Searching for: <em>"' + decodeURIComponent(urlParams.s) + '"</em>';
            } else {
                msg = 'Loading videos';
            }
            $notice = $('<h1/>').addClass('searching-notice').html(msg);
            $widget.html($notice);

            var lastPageReached = false;

            function populate(results) {
                if (results.length) {
                    for (var i = 0; i < results.length; i++) {
                        var url = TVSite.baseUrl + '/';
                        var result = results[i];
                        url += 'result/' + result.entityIdParent + '--' + result.id;
                        result.url = url;
                    }
                    var resultsRow = rowerize(results, 3);
                    var html = '';
                    for (var i = 0; i < resultsRow.length; i++) {
                        html += renderRow(TEMPLATE, resultsRow[i]);
                    }
                    $widget.find('.searching-notice').remove();
                    $widget.find('#search-results-header').remove();
                    $widget.prepend('<div id="search-results-header" class="row clearfix"><h2 class="search-prefix">RESULTS FOR:</h2><p class="search-query">' + decodeURIComponent(urlParams.s) + '</p></div>');
                    $widget.append('<div id="search-results-container" class="loadable-container"></div>');
                    $widget.find('#search-results-container').append(html);
                    if (!lastPageReached)
                        $widget.find('#search-results-container').after('<div class="row"><div class="load-more-row"><div id="load-more" class="load-more"><p>LOAD MORE VIDEOS</p></div></div></div>');
                    $widget.find('#load-more').click(loadMore);
                } else {
                    var $nullResultsNotice = $('<h1/>').addClass('null-results-notice').html('NO SEARCH RESULTS FOUND FOR: "' + decodeURIComponent(urlParams.s) + '"');
                    $widget.html($nullResultsNotice);
                }
            }

            $.when(getResults(), getTemplate).done(function(res1, res2) {
                if (res1 && res2) {
                    TEMPLATE = 'html' in res2[0] ? res2[0].html : '';
                    var results = res1[0];
                    if (!results.length || results.length < RESULTS_LIMIT) lastPageReached = true;
                    populate(results);
                }
            });

            var loadMore = function(e) {
                if (e) e.stopPropagation();
                fetchParams.p = ++fetchParams.p
                $.when(getResults().done(function(res) {
                    $('#load-more').off().closest('.row').remove();
                    if (res) {
                        var results = res;
                        if (!results.length || results.length < RESULTS_LIMIT) lastPageReached = true;
                        populate(results);
                    }
                }));
            };
        });
    }(jQuery));
}