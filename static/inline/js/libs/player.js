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
        compact = function(o){
            if (!o && "object" !== typeof o) return;
            for (var k in o) {
                if (!o[k]) {
                    delete o[k];
                }
            }
            return o;
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
        this.transcript = isset(options.transcript) ? options.transcript : null;
        this.overlay = isset(options.overlay) ? options.overlay : null;
        this.playerOverlayTemplate =  isset(options.playerOverlayTemplate) ? options.playerOverlayTemplate : null;
        this.playIconTemplate = isset(options.playIconTemplate) ? options.playIconTemplate : null;
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

        this.playButton = compact({
            height: isset(options.play_button_height) ? options.play_button_height : null,
            width: isset(options.play_button_width) ? options.play_button_width : null,
            backgroundColor: isset(options.play_button_background_color) ? options.play_button_background_color : null,
            borderRadius: isset(options.play_button_border_radius) ? options.play_button_border_radius : null,
            borderWidth: isset(options.play_button_border_width) ? options.play_button_border_width : null,
            borderColor: isset(options.play_button_border_color) ? options.play_button_border_color : null,
            borderStyle: isset(options.play_button_border_style) ? options.play_button_border_style : null,
            iconColor: isset(options.play_button_icon_color) ? options.play_button_icon_color : null
        });

        this.floater = compact({
            controlbarColor: isset(options.control_bar_color) ? options.control_bar_color : null,
            iconColor: isset(options.icon_color) ? options.icon_color : null,
            removeControls: isset(options.remove_controls) ? options.remove_controls : null
        });

        this.seekBar = compact({
            progressColor: isset(options.progress_color) ? options.progress_color : null
        });

        this.controls = compact({
            active: true,
            seekbar: this.seekBar,
            floater: this.floater,
            playbutton: this.playButton,
            overlayColor: isset(options.overlay_color) ? options.overlay_color : null,
            overlayOpacity: isset(options.overlay_opacity) ? options.overlay_opacity : null
        });
        
        //Context reference for Methods.
        var that = this;

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
            if (willCue) this.instance.cueVideo(asset);                
            else this.instance.loadVideo(asset);
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

        this.onReady = function(e, pl){
            that.instance = pl;
            that.resize();

            //We don't want to resize the player here on fullscreen... we need the player be.
            if (isset(window,'BigScreen')) {
                BigScreen.onchange = function(){
                    that.isFullScreen = !that.isFullScreen;
                };
            }

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
        };

        this.onStateChange = function(e){
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
        };

        this.initialize = function () {
            var playerOptions = {
                techOrder: isset(options.tech_order) ? options.tech_order : null,
                analytics: isset(options.analytics) ? options.analytics : null,
                apiBaseUrl: isset(options.api_base_url) ? options.api_base_url : null,
                mediaProviders: isset(options.media_providers) ? options.media_providers : null,
                divId: this.el.id,
                preload: isset(options.preload) ? options.preload : null,
                swf: '//appcdn.tvpage.com/player/assets/tvp/tvp-'+that.version+'-flash.swf',
                poster: isset(options.poster) ? options.poster : null,
                overlay: isset(options.overlay) ? options.overlay : null,
                onReady: that.onReady,
                onStateChange: that.onStateChange,
                controls: that.controls
            };

            var extras = ["preload","poster","overlay"];
                for (var i = 0; i < extras.length; i++) {
                var option = extras[i];
                if (that[option] !== null) {
                    playerOptions[option] = that[option];
                }
            }

            var i;
            var allowOverride = {
                techOrder: 1,
                analytics: 1,
                apiBaseUrl: 1,
                swf: 1,
                controls: 1,
                width: 1,
                height: 1,
                mediaProviders: 1,
                preload: 1,
                poster: 1,
                overlay: 1
            };

            for (i in options) {
                if ( !playerOptions.hasOwnProperty(i) || allowOverride.hasOwnProperty(i) ) {
                    playerOptions[i] = options[i];
                }
            }

            this.player = new TVPage.player(playerOptions);

            window.addEventListener('resize', function () {
                that.resize();
            });
        }
        
        this.el.onclick = function(e){
            var getTarget = function (name) { 
                var path = [];
                var currentElem = e.target;
                while (currentElem) {
                    path.push(currentElem);
                    currentElem = currentElem.parentElement;
                }
                if (path.indexOf(window) === -1 && path.indexOf(document) === -1)
                    path.push(document);
                if (path.indexOf(window) === -1)
                    path.push(window);

                for (var i = 0; i < path.length; i++) {
                    try{
                        if(Utils.hasClass(path[i], name)) {
                            target = path[i];
                            return true;
                        }
                    }
                    catch(err){
                        return false;
                    }
                }
            }
        };

        var checks = 0;
        (function libsReady(){
            setTimeout(function(){
                if ( (!isset(window,'TVPage') || !isset(window,'_tvpa')) && (++checks < 200) ) {
                    libsReady();
                }
                else{
                    that.initialize();
                }
            }, 150);
        })();
    }

    window.Player = Player;

}(window, document));