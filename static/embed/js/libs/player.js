;(function(window,document) {

    var isset = function(o,p){
            var val = o;
            if (p) val = o[p];
            return 'undefined' !== typeof val;
        },
        isEmpty = function(obj) {
            for(var key in obj) { if (obj.hasOwnProperty(key)) return false;}
            return true;
        },
        isFunction = function(obj){
            return 'undefined' !== typeof obj;
        },
        debounce = function(func,wait,immediate) {
            var timeout;
            return function() {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        };

    //The player singleton. We basically create an instance from the tvpage
    //player and expose most utilities, helping to encapsualte what is required for a few players to co-exist.
    function Player(el, options, startWith) {
        if (!el || !isset(options) || !isset(options.data) || options.data.length <= 0) return console.log('bad args');

        this.isFullScreen = false;
        this.initialResize = true;

        this.options = options || {};
        this.autoplay = isset(options.autoplay) ? Number(options.autoplay) : false;
        this.autonext = isset(options.autonext) ? Number(options.autonext) : true;
        this.version = isset(options.player_version) ? options.player_version : null;
        this.progressColor = isset(options.progress_color) ? options.progress_color : null;
        this.transcript = isset(options.transcript) ? options.transcript : null;
        this.removeControls = isset(options.remove_controls) ? options.remove_controls : null;
        this.analytics = isset(options.analytics) ? options.analytics : null;
        this.overlay = isset(options.overlay) ? options.overlay : null;

        this.onResize = isset(options.onResize) && isFunction(options.onResize) ? options.onResize : null;
        this.onNext = isset(options.onNext) && isFunction(options.onNext) ? options.onNext : null;

        this.instance = null;
        this.el = 'string' === typeof el ? document.getElementById(el) : el;

        this.assets = (function(data){
            var assets = [];
            for (var i = 0; i < data.length; i++) {
                var video = data[i];

                if (isEmpty(video)) break;

                var asset = video.asset;
                asset.assetId = video.id;
                asset.assetTitle = video.title;
                asset.loginId = video.loginId;

                if (isset(video,'events') && video.events.length) {
                    asset.analyticsLogUrl = video.analytics;
                    asset.analyticsObj = video.events[1].data;
                } else {
                    asset.analyticsObj = {
                        pg: isset(video,'parentId') ? video.parentId : ( isset(options,'channel') ? options.channel.id : 0 ),
                        vd: video.id,
                        li: video.loginId
                    };
                }

                if (!asset.sources) asset.sources = [{ file: asset.videoId }];
                asset.type = asset.type || 'youtube';
                assets.push(asset);
            }
            return assets;
        }(options.data));


        //Context reference for Methods.
        var that = this;

        //Sometimes we want/need to show an intearctive overlay on top of the player. We need this for MP4 videos that will
        //cue (mobile or autoplay:off) to actual play the video on demand.
        this.addOverlay = function(asset){
            var overlay = document.createElement('div');
            overlay.className = 'tvp-overlay';
            overlay.innerHTML = this.options.templates["player-overlay"];

            overlay.style.backgroundImage = 'url("' + asset.thumbnailUrl + '")';

            var click = function(){
                var clear = function () {
                    this.removeEventListener('click',click,false);
                    this.parentNode.removeChild(this);
                };
                clear.call(this);
                if (that.instance) {
                    that.instance.play();
                }
            };

            overlay.removeEventListener('click', click, false);
            overlay.addEventListener('click', click, false);

            this.el.appendChild(overlay);

            var overlayCover = overlay.querySelector('.tvp-overlay-cover');
            if (isset(this.options,"overlay_color")) {    
                overlayCover.style.backgroundColor = this.options.overlay_color;
            }

            if (isset(this.options,"overlay_opacity")) {
                overlayCover.style.opacity = this.options.overlay_opacity;
            }

            var playButton = this.el.querySelector('.tvp-play');
            if (isset(this.options,"play_button_width")) {
                playButton.style.width = this.options.play_button_width;
            }

            if (isset(this.options,"play_button_height")) {
                playButton.style.height = this.options.play_button_height;
            }

            if (isset(this.options,"play_button_background_color")) {
                playButton.style.backgroundColor = this.options.play_button_background_color;
            }

            if (isset(this.options,"play_button_border_radius")) {
                playButton.style.borderRadius = this.options.play_button_border_radius;
            }

            if (isset(this.options,"play_button_border")) {
                playButton.style.border = decodeURIComponent(this.options.play_button_border);
            }

            if (isset(this.options,"play_button_icon_color")) {
                playButton.querySelector(".tvp-play > polygon").style.fill = decodeURIComponent(this.options.play_button_icon_color);
            }

            overlay.classList.add("initialized");
        };

        this.play = function(asset,ongoing){
            if (!asset) return console.log('need asset');
            var willCue = false,
                isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (ongoing) {
                if (isMobile || (isset(this.autonext) && !this.autonext)) {
                    willCue = true;
                }
            } else {
                if (isMobile || (isset(this.autoplay) && !this.autoplay)) {
                    willCue = true;
                }
            }

            var analytics =  new Analytics(),
                config = {
                    domain: isset(location,'hostname') ?  location.hostname : '',
                    loginId: asset.loginId
                };

            //Update tvpa analytics configuration depending on the video type
            //(exhange or standard)
            if (isset(asset,'analyticsLogUrl')) {
                config.logUrl = asset.analyticsLogUrl;
                analytics.initConfig(config);
            } else {
                config.logUrl = '\/\/api.tvpage.com\/v1\/__tvpa.gif';
                analytics.initConfig(config);
            }

            if (willCue) {
                this.instance.cueVideo(asset);
                if ('mp4' === asset.type || this.overlay) {
                    this.addOverlay(asset);
                }
            } else {
                this.instance.loadVideo(asset);
            }
        };

        this.resize = function(){
            if (!that.instance || that.isFullScreen) return;
            var width, height;

            if (arguments.length > 1 && arguments[0] && arguments[1]) {
                width = arguments[0];
                height = arguments[1];
            } else {
                var parentEl = that.el.parentNode;
                width = parentEl.clientWidth;
                height = parentEl.clientHeight;
            }

            that.instance.resize(width, height);

            if(!that.onResize) return;
            that.onResize(that.initialResize, [width, height]);

            that.initialResize = false;
        }

        var checks = 0;
        (function libsReady() {
            setTimeout(function() {
                if ( !isset(window,'TVPage') || !isset(window,'_tvpa') ) {
                    (++checks < 100) ? libsReady() : console.log('limit reached');
                } else {

                    //We create insntances on the tvpage player.
                    that.player = new TVPage.player({
                        techOrder: 'html5,flash',
                        analytics: { tvpa: that.analytics },
                        apiBaseUrl: '//api.tvpage.com/v1',
                        swf: '//appcdn.tvpage.com/player/assets/tvp/tvp-'+that.version+'-flash.swf',
                        overlay: false,
                        onReady: function(e, pl){
                            that.instance = pl;
                            that.resize();

                            //We don't want to resize the player here on fullscreen... we need the player be.
                            if (isset(window,'BigScreen')) {
                                BigScreen.onchange = function(){
                                    that.isFullScreen = !that.isFullScreen;
                                };
                            }

                            //We can't resize using local references when we are inside an iframe. Alternative is to receive external
                            //size from host.
                            if (window.location !== window.parent.location && (/iPad|iPhone|iPod|iPhone Simulator|iPad Simulator/.test(navigator.userAgent) && !window.MSStream)){
                                var onHolderResize = function (e) {
                                    if (!e || !isset(e, 'data') || !isset(e.data, 'event') || 'tvp_carousel:modal_holder_resize' !== e.data.event) return;
                                    var size = e.data.size || [];
                                    that.resize(size[0], size[1]);
                                };
                                window.removeEventListener('message', onHolderResize, false);
                                window.addEventListener('message', onHolderResize, false);
                            } else {
                                var onWindowResize = debounce(that.resize,50);
                                window.removeEventListener('message', onWindowResize, false);
                                window.addEventListener('resize', onWindowResize);
                            }

                            that.el.querySelector('.tvp-progress-bar').style.backgroundColor = that.progressColor;
                            var current = 0;
                            if (startWith && startWith.length) {
                                for (var i = 0; i < that.assets.length; i++) {
                                    if (that.assets[i].assetId === startWith) current = i;
                                }
                            }

                            that.current = current;
                            that.play(that.assets[that.current]);
                        },
                        onStateChange: function(e){
                            if ('tvp:media:videoended' !== e) return;

                            that.current++;
                            if (!that.assets[that.current]) {
                                that.current = 0;
                            }

                            var next = that.assets[that.current];
                            that.play(next, true);
                            if(that.onNext) {
                                that.onNext(next);
                            }
                        },
                        divId: that.el.id,
                        controls: {
                            active: true,
                            floater: {
                                removeControls: that.removeControls,
                                transcript: that.transcript
                            }
                        }
                    });

                }
            },150);
        })();

    }

    window.Player = Player;

}(window, document));