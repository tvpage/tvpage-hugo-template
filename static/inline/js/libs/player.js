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
        this.onResize = isset(options.onResize) && isFunction(options.onResize) ? options.onResize : null;
        this.onNext = isset(options.onNext) && isFunction(options.onNext) ? options.onNext : null;
        this.onPlayerChange = isset(options.onPlayerChange) && isFunction(options.onPlayerChange) ? options.onPlayerChange : null;
        this.playIconTemplate = isset(options.templates.play_icon) ? options.templates.play_icon : null;
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

      var playsInline = 'playsInline' in options ? options.playsInline : ('playsinline' in options ? options.playsinline : null);

      if(null !== playsInline)
        this.playsInline = playsInline;

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

        var advertisingOptions = isset(options.advertising) && "object" === typeof options.advertising && !isEmpty(options.advertising) ? options.advertising : {};

        this.advertising = compact({
            enabled: isset(advertisingOptions.enabled) ? advertisingOptions.enabled : false,
            adServerUrl: (advertisingOptions.adServerUrl || advertisingOptions.adserverurl) || null,
            adTimeout: (advertisingOptions.adTimeout || advertisingOptions.adtimeout) || "2000",
            maxAds: (advertisingOptions.maxAds || advertisingOptions.maxads) || "100",
            adInterval: (advertisingOptions.adInterval || advertisingOptions.adinterval) || "0"
        });
        
        //Context reference for Methods.
        var that = this;

        this.willCue = function(ongoing){
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

            return willCue;
        };

        this.play = function(asset, ongoing) {
          if (!isset(asset)) return console.warn('Needs Asset');
      
          if (that.willCue(ongoing)) {
            this.instance.cueVideo(asset);
          } else {
            this.instance.loadVideo(asset);
          }

          // this will fix the continues loading of youtube type video on iOS (iPad/iPhone)            
            if (Utils.isIOS) {
                var control_overlay = that.el.querySelector('.tvp-control-overlay');
                
                if (asset.type === 'youtube') {                                
                    control_overlay.style.display = "none";                    
                }
                else{
                    control_overlay.style.display = "block";                    
                }
            }
        };

        this.getCurrentIndex = function(id){
          var current = 0;
          for (var i = 0; i < this.assets.length; i++) {
            if (this.assets[i].assetId === (id || '') ) {
              current = i;
            }
          }
          return current;
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

            //Fix required to let popups be displayed on top of plauer overlay.
            var controlBar = that.el.querySelector("#ControlBarFloater");
            if (controlBar && controlBar.parentNode) {
                controlBar.parentNode.style.zIndex = "9999";
            }

            var _overlay = isset(options.overlay) ? options.overlay : null;

            if (_overlay) {
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

              var existing = this.el.querySelector('.tvplayer-overlay');
              if (existing) {
                  existing.removeEventListener('click', click, false);
                  existing.parentNode.removeChild(existing);
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

            if (window.DEBUG) {
                console.debug("endTime = " + performance.now());
            }
        };

        this.onStateChange = function(e){
            if (e === 'tvp:media:videoended') {
                that.current++;

                if (!that.assets[that.current]) {
                    that.current = 0;
                }
                
                var next = that.assets[that.current];
                that.play(next, true);

                if (that.onNext) {
                    that.onNext(next);
                }
            }else if('tvp:media:videoplaying' === e){
                if(that.instance.tvpOverlay)
                    that.instance.removeOverlay();
            }

            var stateData = JSON.parse(JSON.stringify(that.assets[that.current]));
            
            stateData.currentTime = that.instance.getCurrentTime();

            if (that.onPlayerChange) {
                that.onPlayerChange(e, stateData);
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
                swf: '//cdnjs.tvpage.com/tvplayer/tvp-'+that.version+'.swf',
                poster: isset(options.poster) ? options.poster : null,
                onReady: that.onReady,
                onStateChange: that.onStateChange,
                controls: that.controls,
                version: that.version,
                advertising:that.advertising
            };

            var extras = ["preload","poster","playsInline"];
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
                poster: 1
            };

            $.each(options, function(i, val) {
                 if (!playerOptions.hasOwnProperty(i) || allowOverride.hasOwnProperty(i)) {
                    playerOptions[i] = options[i];
                 }
            });

            this.player = new TVPage.player(playerOptions);
            that.current = that.getCurrentIndex(startWith);
            if(that.willCue()){
                that.player.cueVideo(that.assets[that.current]);
            }else{
                that.player.loadVideo(that.assets[that.current]);
            }

            window.addEventListener('resize', function () {
                that.resize();
            });

        }
        that.initialize();
    }
    window.Player = Player;
}(window, document));