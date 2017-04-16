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
        if (!el || !isset(options) || !isset(options.data) || options.data.length <= 0) return console.log('bad args');

        this.options = options;
        this.instance = null;
        this.el = 'string' === typeof el ? document.getElementById(el) : el;

        this.isFullScreen = false;
        this.initialResize = true;

        this.autoplay = isset(options.autoplay) ? Number(options.autoplay) : false;
        this.autonext = isset(options.autonext) ? Number(options.autonext) : true;
        this.version = isset(options.player_version) ? options.player_version : null;

        this.removeControls = isset(options.remove_controls) ? options.remove_controls : null;
        this.techOrder = isset(options.tech_order) ? options.tech_order : null;
        this.analytics = isset(options.analytics) ? options.analytics : null;
        this.apiBaseUrl = isset(options.api_base_url) ? options.api_base_url : null;
        this.mediaProviders = isset(options.media_providers) ? options.media_providers : null;
        this.preload = isset(options.preload) ? options.preload : null;
        this.poster = isset(options.poster) ? options.poster : null;
        this.overlay = isset(options.overlay) ? options.overlay : null;

        this.playbutton = compact({
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
          seekBar: this.seekBar,
          floater: this.floater,
          playbutton: this.playbutton,
          overlayColor: isset(options.overlay_color) ? options.overlay_color : null,
          overlayOpacity: isset(options.overlay_opacity) ? options.overlay_opacity : null
        });

        this.onResize = isset(options.onResize) && isFunction(options.onResize) ? options.onResize : null;
        this.onNext = isset(options.onNext) && isFunction(options.onNext) ? options.onNext : null;

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
                    var channelId = isset(video,'parentId') ? video.parentId : ( isset(options,'channel') ? options.channel.id : 0 );
                    if (!channelId && (options.channelId || options.channelid)) {
                      channelId = options.channelId || options.channelid;
                    }

                    asset.analyticsObj = {
                        pg: channelId,
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
        this.getOption = function (name) {
          if (this.options.hasOwnProperty(name))
            return this.options.hasOwnProperty(name);
          return null;
        }

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
                config.logUrl = this.apiBaseUrl + '/__tvpa.gif';
                analytics.initConfig(config);
            }

            if (willCue) {
                this.instance.cueVideo(asset);
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

            if (!that.onResize) return;
            that.onResize(that.initialResize, [width, height]);

            that.initialResize = false;
        }

        var checks = 0;
        (function libsReady() {
            setTimeout(function() {
                if ( !isset(window,'TVPage') || !isset(window,'_tvpa') ) {
                    (++checks < 50) ? libsReady() : console.log('limit reached');
                } else {

                var playerOptions = {
                        techOrder: that.techOrder,
                        mediaProviders: that.mediaProviders,
                        analytics: { tvpa: that.analytics },
                        apiBaseUrl: that.apiBaseUrl,
                        swf: '//appcdn.tvpage.com/player/assets/tvp/tvp-'+that.version+'-flash.swf',
                        onReady: function(e, pl){
                            that.instance = pl;
                            that.resize();

                            //Fix required to let popups be displayed on top of plauer overlay.
                            var controlBar = that.el.querySelector("#ControlBarFloater");
                            if (controlBar && controlBar.parentNode) {
                                controlBar.parentNode.style.zIndex = "9999";
                            }

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
                                    if (!e || !isset(e, 'data') || !isset(e.data, 'event') || 'tvp_' + options.id.replace(/-/g,'_') + ':modal_holder_resize' !== e.data.event) return;
                                    var size = e.data.size || [];
                                    that.resize(size[0], size[1]);
                                };
                                window.removeEventListener('message', onHolderResize, false);
                                window.addEventListener('message', onHolderResize, false);
                            } else {
                                var onWindowResize = that.resize;
                                window.removeEventListener('message', onWindowResize, false);
                                window.addEventListener('resize', onWindowResize, false);
                            }

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
                        controls: that.controls
                    };

                    var extras = ["preload","poster","overlay"];
                    for (var i = 0; i < extras.length; i++) {
                      var option = extras[i];
                      if (that[option] !== null) {
                        playerOptions[option] = that[option];
                      }
                    }

                    // merge with options passed
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
                    for (i in that.options) {
                      if ( !playerOptions.hasOwnProperty(i) || allowOverride.hasOwnProperty(i) ) {
                        playerOptions[i] = that.options[i];
                      }
                    }
                    
                    that.player = new TVPage.player(playerOptions);
                }
            },150);
        })();

    }

    window.Player = Player;

}(window, document));