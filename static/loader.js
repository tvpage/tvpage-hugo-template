//The selfs loader, so far it takes care of the aspect ratio of the iframes,
//it can also optionaly fetch the content from a self url, it also permits
//to load the iframe scripts asynchronouse, this hides the browser spinner.
//Loader is the delegator of iframe messages.
(function(window, document) {
    var _startTime = performance.now();
    var debug = window.DEBUG,
        response = null,
        isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        env = debug ? 'dev' : 'prod',
        isset = function(o, p) {
            var val = o;
            if (p) val = o[p];
            return 'undefined' !== typeof val;
        },
        isValidEvent = function(e, name){
            return (e && isset(e.data) && isset(e.data, "event") && ("tvp_solo_click:" + name || "") === e.data.event);
        };

    //Dynamically creates an iframe & appends it's required CSS & JS libraries.
    var getIframeHtml = function(options) {
        var html = '<head><base target="_blank" /></head><body class="' + (options.className || '') + '" data-domain="' +
        (options.domain || '') + '" data-id="' + (options.id || '') + '" onload="' +
        'var doc = document, head = doc.getElementsByTagName(\'head\')[0],' +
        'addJS = function(s){ var sc = doc.createElement(\'script\');sc.src=s;doc.body.appendChild(sc);};' +
        'addCSS = function(h){ var l = doc.createElement(\'link\');l.type=\'text/css\';l.rel=\'stylesheet\';l.href=h;head.appendChild(l);};' +
        'window.DEBUG=' + (debug || 0) + ';';

        var js = options.js || [];
        if (js && js.length) {
            for (var i = 0; i < js.length; i++) {
                html += 'addJS(\'' + js[i] + '\');';
            }
        }

        var css = options.css || [];
        if ('function' === typeof css) {
            css = css();
        }

        css = css.filter(Boolean);
        for (var i = 0; i < css.length; i++) {
            html += 'addCSS(\'' + css[i] + '\');';
        }

        html += '">';
        var content = options.html || '';
        if ('function' === typeof content) {
            html += content();
        } else if (content.trim().length) {
            html += content;
        }

        return html;
    };

    //Widget Singleton...
    function Widget(spot) {
        console.debug("HERE: " + (performance.now() - _startTime) );

        var self = function() {};
        var id = spot.getAttribute('data-id');
        var holder = null;
        var domain = spot.getAttribute('data-domain');
        var type = spot.className.replace('tvp-', '') || '';
        var static = domain + '/' + type;
        
        var config = {};
        __TVPage__ = window.__TVPage__ || {};
        __TVPage__.config = __TVPage__.config || {};
        config = __TVPage__.config[id] || {};

        var squareStyle = config.mobileStyle && "square" === config.mobileStyle ? true : false;
        var isMobileSquare = isMobile && squareStyle;

        //http://stackoverflow.com/questions/7589853/how-is-insertadjacenthtml-so-much-faster-than-innerhtml
        (function(
            holderId,
            coverOpacity,
            aspectRatio,
            channel,
            jsonpScript
        ){
            console.debug("INSERT?: " + (performance.now() - _startTime) );
            spot.insertAdjacentHTML('beforebegin', '<style>.tvp-play-holder,[class^=tvp-]{box-sizing:border-box}.tvp-iframe-holder{height:0;position:relative;transition:height ease-out .1ms}.tvp-holder-poster,.tvp-iframe-holder>iframe{width:100%;height:100%}.tvp-holder-poster,.tvp-holder-poster-cover,.tvp-iframe-holder>iframe,.tvp-play-holder{position:absolute;top:0;left:0}.tvp-iframe-holder.solo-click{padding-top:'+aspectRatio+';background-color:#000}.tvp-holder-poster{background-size:cover;background-position:center center;background-repeat:no-repeat}.tvp-holder-poster-cover{opacity:'+coverOpacity+';width:100%;height:100%;background-image:linear-gradient(to bottom right,#fff,#fff)}.tvp-play-holder{height:65px;padding:0;bottom:0;right:0;margin:auto;cursor:pointer;width:135px}.tvp-play-text{font-family:Helvetica;font-size:19px;color:#333;margin-top:10px;text-align:center}</style><div id="' + holderId + '" class="tvp-iframe-holder"><div id="'+holderId+'-poster" class="tvp-holder-poster"></div><div class="tvp-holder-poster-cover"></div>'+
            '<div class="tvp-play-holder"><svg style="box-sizing:border-box;padding:0;margin:auto;cursor:pointer;display:block;width:65px;height:65px;background-color:#eeeeee;border:1px solid #000;border-radius:50%;" viewBox="0 0 200 200"><polygon fill="#273691" points="70, 55 70, 145 145, 100"></polygon></svg><div class="tvp-play-text">Watch Video</div></div><iframe class="tvp-iframe" src="about:blank" allowfullscreen frameborder="0" scrolling="no"></iframe></div>');
            console.debug("first render: " + (performance.now() - _startTime) );

            holder = document.getElementById(holderId) || null;
            window.addEventListener('message', function(e) {
                if (isValidEvent(e, "no_data"))
                    holder.parentNode.removeChild(holder);
            });

            var srcUrl = '//api.tvpage.com/v1/channels/' + channel.id + '/videos?X-login-id=' + config.loginid;
            var params = isset(channel.parameters) ? channel.parameters : {};
            for (var p in params) { srcUrl += '&' + p + '=' + params[p];}
            jsonpScript.src = srcUrl + "&callback=_tvpcallback_";
            window['_tvpcallback_'] = function(data){
                response = data || [];
                
                if (!response.length)
                    return;

                holder.querySelector("#" + holderId + "-poster").style.backgroundImage = "url("+ response[0].asset.thumbnailUrl +")";
            };
            
            document.body.appendChild(jsonpScript);
            
            holder.classList.add(type);

            spot.parentNode.removeChild(spot);
        }(
            id + "-holder",
            isMobileSquare ? "1" : "0.7",
            isMobileSquare ? "100%" : "56.25%",
            isset(config, "channel") ? config.channel : {},
            document.createElement('script')
        ))

        self.initialize = function() {

            //Because iframes are loaded first before the host page loading, we load them empties, making this load time
            //reduced as its minimum, we start then creating the content of the iframe dynamically.
            //Reference: http://www.aaronpeters.nl/blog/iframe-loading-techniques-performance?%3E
            var iframeDoc = holder.querySelector('iframe').contentWindow.document;
            var paths = {
                dev: [
                    '//a.tvpage.com/tvpa.min.js',
                    '//cdnjs.tvpage.com/tvplayer/tvp-1.8.6.min.js',
                    static + '/js/libs/analytics.js',
                    static + '/js/libs/player.js',
                    static + '/js/index.js'
                ],
                prod: [
                    '//a.tvpage.com/tvpa.min.js',
                    '//cdnjs.tvpage.com/tvplayer/tvp-1.8.6.min.js',
                    static + '/dist/js/scripts.min.js'
                ]
            }[env];
            
            iframeDoc.open().write(getIframeHtml({
                js: paths,
                css: [ static + (debug ? '/' : '/dist/') + 'css/styles' + (debug ? '.css' : '.min.css') ],
                className: 'dynamic' + (isMobile ? " mobile" : "") + (squareStyle ? " squared" : ""),
                domain: domain,
                id: id
            }));

            iframeDoc.close();

            window.addEventListener('message', function(e) {
                if (!isValidEvent(e, "initialized"))
                    return;

                setTimeout(function(){
                    window.postMessage({
                        event: 'tvp_solo_click:data',
                        response: response
                    }, '*');
                },400);
            });

            window.addEventListener('resize', function() {
                window.postMessage({
                    event: 'tvp_solo_click:holder_resize',
                    size: [holder.offsetWidth, holder.offsetHeight]
                }, '*');
            });
        }

        return self;
    }

    function load () {
        var spots = document.querySelectorAll('.tvp-solo-click');
        if (spots.length) {
            for (var i = 0; i < spots.length; i++) {
                var widget  = Widget(spots[i]);
                widget.initialize(spots);
            }
        } else {
            var spotsCheck = 0;
            (function spotsReady() {
              setTimeout(function(){
                  if (!document.querySelectorAll('.tvp-solo-click').length && (++spotsCheck < 200)) {
                    spotsReady();
                  } else {
                    var spots = document.querySelectorAll('.tvp-solo-click');
                    for (var i = 0; i < spots.length; i++) {
                        var widget  = Widget(spots[i]);
                        widget.initialize(spots);
                    }
                  }
              },140);
            })();
        }
    }

    window.addEventListener('load', function(){
        __TVPage__ = window.__TVPage__ || {};
        __TVPage__.load = load;
        __TVPage__.trigger = function(e){
            window.postMessage({
                event: 'tvp_solo_click:' + (e + "")
            }, '*');
        };

        load();
    });

}(window, document));