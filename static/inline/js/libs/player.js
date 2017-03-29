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
        };

    //The player singleton. We basically create an instance from the tvpage
    //player and expose most utilities, helping to encapsualte what is required for a few players to co-exist.
    function Player(el, options, startWith) {
        if (!el || !isset(options) || !isset(options.data) || options.data.length <= 0) return; // console.log('bad args');

        this.isFullScreen = false;
        this.initialResize = true;
        this.autoplay = isset(options.autoplay) ? Number(options.autoplay) : false;
        this.autonext = isset(options.autonext) ? Number(options.autonext) : true;
        this.version = isset(options.player_version) ? options.player_version : null;
        this.progressColor = isset(options.progress_color) ? options.progress_color : null;
        this.transcript = isset(options.transcript) ? options.transcript : null;
        this.removeControls = isset(options.remove_controls) ? options.remove_controls : null;
        this.analytics = isset(options.analytics) ? options.analytics : null;
        this.overlay = isset(options.overlay) ? options.overlay : null;
        this.overlayColor = isset(options.overlay_color) ? options.overlay_color : null;
        this.overlayOpacity = isset(options.overlay_opacity) ? options.overlay_opacity : null;
        this.playButtonBackgroundColor = isset(options.play_button_background_color) ?  options.play_button_background_color : null;
        this.playButtonBorderRadius = isset(options.play_button_border_radius) ? options.play_button_border_radius : null;
        this.playButtonBorderWidth = isset(options.play_button_border_width) ? options.play_button_border_width : null;
        this.playButtonBorderColor = isset(options.play_button_border_color) ? options.play_button_border_color : null;
        this.playButtonIconColor = isset(options.play_button_icon_color) ? options.play_button_icon_color : null;
        this.playButtonWidth = isset(options.play_button_width) ? options.play_button_width : null;
        this.playButtonHeight = isset(options.play_button_height) ? options.play_button_height : null;

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
            overlay.classList.add('tvp-overlay');
            overlay.style.backgroundImage = 'url("' + asset.thumbnailUrl + '")';

            var overlayColor = this.overlayColor ? '#' + this.overlayColor : 'transparent';
            var overlayHtml = '<div class="tvp-overlay-cover" style="opacity:' + this.overlayOpacity + ';' +
                'background-image:linear-gradient(to bottom right,' + overlayColor + ',' + overlayColor + ');"></div>' +
                '<div class="tvp-play-holder" style="height:' + this.playButtonHeight + ';">'+
                '<svg class="tvp-video-play" style="width:' + this.playButtonWidth + ';height:' + this.playButtonHeight + ';' +
                'background-color:#' + this.playButtonBackgroundColor + ';border:' + this.playButtonBorderWidth + ' solid #' +
                this.playButtonBorderColor + ';border-radius:' + this.playButtonBorderRadius + ';" viewBox="0 0 200 200">' +
                '<polygon fill="#'+this.playButtonIconColor+'" points="70, 55 70, 145 145, 100"></polygon></svg>';

            overlay.innerHTML = overlayHtml;

            var click = function(){
                var clear = function () {
                    this.removeEventListener('click',click,false);
                    this.parentNode.removeChild(this);
                };

                if (that.onClick) {
                    that.onClick();
                } else if (that.instance) {
                    clear.call(this);
                    that.instance.play();
                }
            };

            overlay.addEventListener('click', click);
            this.el.appendChild(overlay);
        };

        this.play = function(asset,ongoing){
            if (!asset) return; // console.log('need asset');
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
                else{ 
                    var tvp_overlay = this.el.querySelector('.tvp-overlay');
                    if(Boolean(tvp_overlay)){
                        this.el.removeChild(tvp_overlay);
                    }
                    else{
                        return undefined;
                    }
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

        this.load = function (videoId) {
            for (var i = 0; i < this.assets.length; i++) {
                if(this.assets[i].assetId === videoId){
                    this.current = i;
                }
            }
            this.play(this.assets[this.current], true);
        }
        this.initialize = function () {
            this.player = new TVPage.player({
                techOrder: 'html5,flash',
                analytics: { tvpa: this.analytics },
                apiBaseUrl: '//api.tvpage.com/v1',
                swf: '//appcdn.tvpage.com/player/assets/tvp/tvp-'+this.version+'-flash.swf',
                onReady: function(e, pl){
                    that.instance = pl;
                    that.resize();

                    //We don't want to resize the player here on fullscreen... we need the player be.
                    if (isset(window,'BigScreen')) {
                        BigScreen.onchange = function(){
                            that.isFullScreen = !that.isFullScreen;
                        };
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
                    if (window.DEBUG) {
                        console.debug("endTime = " + performance.now());
                    }
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
        this.initialize();
    }

    window.Player = Player;

}(window, document));