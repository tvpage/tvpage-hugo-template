//The widgets loader, so far it takes care of the aspect ratio of the iframes,
//it can also optionaly fetch the content from a widget url, it also permits
//to load the iframe scripts asynchronouse, this hides the browser spinner.
//Loader is the delegator of iframe messages.
(function(window, document) {

  if (window.DEBUG) {
    console.debug("startTime = " + performance.now());
  }

  var env = window.DEBUG ? 'dev' : 'prod',
    cssExt = window.DEBUG ? '.css' : '.min.css',
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isset = function(o, p) {
      return 'undefined' !== typeof o[p]
    },
    removeEl = function(el) {
      if (!el) return;
      el.parentNode.removeChild(el);
    },
    debounce = function(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this,
          args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    },
    createIframe = function() {
      var ifr = document.createElement('iframe');
      ifr.setAttribute('allowfullscreen', '');
      ifr.setAttribute('frameborder', '0');
      ifr.setAttribute('scrolling', 'no');
      ifr.classList.add('tvp-iframe');
      return ifr;
    };

  //It smartly returns the JS files that sidebar modal shall use
  var getModalJSFilePaths = function(domain, pVersion) {
    var files = [
      '//a.tvpage.com/tvpa.min.js',
      '//appcdn.tvpage.com/player/assets/tvp/tvp-' + (pVersion || '1.8.4') + '-min.js',
      (isMobile ? domain + '/sidebar/js/vendor/jquery.js' : '')
    ];

    if ('dev' === env) {
      var devPath = domain + '/sidebar/js';
      files = files.concat([
        devPath + '/libs/utils.js',
        devPath + '/libs/analytics.js',
        devPath + '/libs/player.js',
        devPath + (isMobile ? '/mobile' : '') + '/modal/index.js'
      ]);
    } else {
      files = files.concat([
        domain + '/sidebar/dist/js' + (isMobile ? '/mobile' : '') + '/modal/scripts.min.js'
      ]);
    }

    return files.filter(Boolean);
  };

  //Dynamically creates an iframe & appends it's required CSS & JS libraries.
  var createIframeHtml = function(options) {
    var html = '<head><base target="_blank" /></head><body class="' + (options.className || '') + '" data-domain="' + (options.domain || '') + '" data-id="' + (options.id || '') + '" onload="' +
      'var doc = document, head = doc.getElementsByTagName(\'head\')[0],' +
      'addJS = function(s){ var sc = doc.createElement(\'script\');sc.src=s;doc.body.appendChild(sc);};' +
      'addCSS = function(h){ var l = doc.createElement(\'link\');l.type=\'text/css\';l.rel=\'stylesheet\';l.href=h;head.appendChild(l);};' +
      'window.DEBUG=' + (window.DEBUG || 0) + ';';

    var js = options.js || [];
    if (js && js.length) {
      for (var i = 0; i < js.length; i++) {
        html += 'addJS(\'' + js[i] + '\');';
      }
    }

    var css = options.css || [];
    if (css && css.length) {
      for (var i = 0; i < css.length; i++) {
        html += 'addCSS(\'' + css[i] + '\');';
      }
    }

    html += '">';

    var content = options.html || '';
    if (content && content.length) {
      html += content;
    }
    return html;
  };

  function Widget(options) {
    var widget = function() {};

    //Define the data method to be used.
    var id = options.id || '';
    widget.id = id;
    widget.data = {};
    widget.data[id] = {};
    widget.dataMethod = 'static';
    widget.type = options.type || '';
    widget.holder = options.holder || null;
    
    if (isset(window, '__TVPage__') && isset(__TVPage__, 'config') && isset(__TVPage__.config, widget.id)) {
      widget.config = __TVPage__.config[widget.id];
    }

    if (isset(widget.config, 'channel') && isset(widget.config.channel, 'id')) {
      widget.dataMethod = 'dynamic';
    }
    
    if (window.DEBUG) {
      console.log("EMBED METHOD", widget.dataMethod);
    }

    var domain = widget.config.domain;

    var staticPath = domain + '/' + widget.type;
    widget.staticPath = staticPath;
    widget.paths = {
      solo: {
        dev: [
          '//a.tvpage.com/tvpa.min.js',
          '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
          staticPath + '/js/libs/analytics.js',
          staticPath + '/js/libs/player.js',
          staticPath + '/js/index.js'
        ],
        prod: [
          '//a.tvpage.com/tvpa.min.js',
          '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
          staticPath + '/js/scripts.min.js'
        ]
      },
      sidebar: {
        dev: [
          staticPath + '/js/libs/utils.js',
          staticPath + '/js/grid.js',
          staticPath + '/js/index.js'  
        ],
        prod: [
          staticPath + 'js/scripts.min.js' 
        ]
      }
    };

    widget.initialize = function() {

      //Add target/host page css for our widget
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      var hostCssPath = widget.staticPath;
      link.href = widget.staticPath + (window.DEBUG ? '/' : '/dist/') + 'css/' + (isMobile ? 'mobile/' : '') + 'host' + cssExt;
      document.getElementsByTagName('head')[0].appendChild(link);

      var iframe = widget.holder.querySelector('iframe');
      
      iframe.onload = function() {
        if ('solo' === widget.type || 'solo-click' === widget.type) {
          var ifr = this;
          window.addEventListener('resize', debounce(function() {
            ifr.contentWindow.postMessage({
              event: '_tvp_widget_holder_resize',
              size: [widget.holder.offsetWidth, widget.holder.offsetHeight]
            }, '*');
          }, 50));
        }
      };

      //By now, this is the central point for cross-domain messaging between iframes.
      window.addEventListener('message', function(e) {
        if (!e || !isset(e, 'data') || !isset(e.data, 'event')) return;

        var eventName = e.data.event;

        if ('tvp_sidebar:render' === eventName || 'tvp_sidebar:grid_resize' === eventName) {
          widget.holder.style.height = e.data.height;
        }

        if ('tvp_sidebar:video_click' === eventName) {
          var data = e.data;
          var selectedVideo = data.selectedVideo || {};
          var runTime = (data.runTime || __TVPage__).config[id];
          var id = widget.id;
          
          widget.data[id] = widget[id] || {};
          widget[id] = {
            data: data.videos || [],
            selectedVideo: selectedVideo,
            runTime: runTime
          };

          var modalFrag = document.createDocumentFragment();

          var overlay = document.createElement('div');
          overlay.classList.add('tvp-modal-overlay');
          modalFrag.appendChild(overlay);
          var modal = document.createElement('div');
          modal.classList.add('tvp-modal');
          modal.innerHTML = '<div class="tvp-modal-wrapper"><div class="tvp-modal-content"><div class="tvp-modal-header">' +
            '<svg class="tvp-modal-close" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>' +
            '<h4 class="tvp-modal-title">' + selectedVideo.title + '</h4></div><div class="tvp-modal-body"><iframe id="tvp-iframe-modal_' + id + '" src="about:blank"' +
            'allowfullscreen frameborder="0" scrolling="no" class="tvp-iframe-modal"></iframe></div></div></div>';

          modalFrag.appendChild(modal);

          var button = modalFrag.querySelector('.tvp-modal-close');
          var close = function() {
            button.removeEventListener('click', close, false);
            [modal, overlay, button].forEach(function(el) {
              removeEl(el);
            });
          };
          button.addEventListener('click', close);

          var iframeModal = modalFrag.querySelector('.tvp-iframe-modal');

          document.body.appendChild(modalFrag);

          var iframeModalDoc = iframeModal.contentWindow.document;
          var html = '<div id="' + id + '" class="tvp-clearfix iframe-content">';

          if (isMobile) {
            html += '<div class="tvp-player"><div id="tvp-player-el"></div></div>' +
              '<div class="tvp-products"><div class="tvp-products-carousel"></div></div>';
          } else {
            html += '<div class="tvp-player-holder"><div class="tvp-player"><div id="tvp-player-el"></div></div></div>' +
              '<div class="tvp-products-holder"><div class="tvp-products"><a class="tvp-product"></a><a class="tvp-product"></a><a class="tvp-product"></a></div></div>';
          }
          html += '</div>';

          iframeModalDoc.open().write(createIframeHtml({
            domain: domain,
            id: id,
            html: html,
            js: getModalJSFilePaths(domain, runTime.playerVersion),
            css: [
              widget.staticPath + (window.DEBUG ? '/' : '/dist/') + 'css/' + (isMobile ? 'mobile' : '') + '/modal/styles' + cssExt,
              (isMobile ? domain + '/' + type + '/css/vendor/slick.css' : '')
            ].filter(Boolean)
          }));
          iframeModalDoc.close();
        }

        var ifrIModalId = 'tvp-iframe-modal_' + id;

        if ('tvp_sidebar:modal_initialized' === eventName) {
          var widgetData = widget[id];
          var iframeModal = document.getElementById(ifrIModalId);
          if (iframeModal.contentWindow) {
            iframeModal.contentWindow.postMessage({
              event: '_tvp_sidebar_modal_data',
              data: widgetData.data,
              selectedVideo: widgetData.selectedVideo,
              runTime: widgetData.runTime
            }, '*');
          }

          window.addEventListener(
            'onorientationchange' in window ? 'orientationchange' : 'resize',
            debounce(function() {
              setTimeout(function() {
                var iframeModal = document.getElementById(ifrIModalId);
                if (iframeModal.contentWindow && iframeModal.parentNode) {
                  var ref = iframeModal.parentNode;
                  iframeModal.contentWindow.postMessage({
                    event: '_tvp_widget_holder_resize',
                    size: [ref.offsetWidth, Math.floor(ref.offsetWidth * (9 / 16))]
                  }, '*');
                }
              }, 100);
            }, 50), false);
        }

        if ('tvp_sidebar:modal_resized' === eventName) {
          document.getElementById(ifrIModalId).style.height = e.data.height;
        }

        if ('tvp_sidebar:player_next' === eventName) {
          document.querySelector('.tvp-modal-title').innerHTML = e.data.next.assetTitle;
        }
      });

      //holder.appendChild(iframe);

      //Because iframes are loaded first before the host page loading, we load them empties, making this load time
      //reduced as its minimum, we start then creating the content of the iframe dynamically.
      //Reference: http://www.aaronpeters.nl/blog/iframe-loading-techniques-performance?%3E
      if ('dynamic' === widget.dataMethod) {

        var iframeDoc = iframe.contentWindow.document;
        iframeDoc.open().write(createIframeHtml({
          js: function() {
            var js, type = widget.type;
            if ('solo' === type || 'solo-click' === type) {
              js = widget.paths.solo[env];
            } else if ('sidebar' === type) {
              js = widget.paths.sidebar[env];
            }
            return js
          }(),
          css: [widget.staticPath + (window.DEBUG ? '/' : '/dist/') + 'css/styles' + cssExt],
          className: widget.dataMethod,
          domain: widget.domain,
          id: id
        }));
        iframeDoc.close();
      }

      //Handling the static iframe scenario, not much to do, just delay the src addition.
      else {
        function setSrc() {
          var src = spot.href;
          (-1 == navigator.userAgent.indexOf("MSIE")) ? iframe.src = src: iframe.location = src;
        }
        setTimeout(setSrc, 5);
      }
    }

    return widget;
  }

  function load () {
    var spots = document.querySelectorAll('.tvp-sidebar, .tvp-solo, .tvp-solo-click');
    for (var i = 0; i < spots.length; i++) {

      var spot = spots[i];
      var spotId = spot.id;

      //http://stackoverflow.com/questions/7589853/how-is-insertadjacenthtml-so-much-faster-than-innerhtml
      spot.insertAdjacentHTML('beforebegin', '<div id="' + spotId + '-holder" class="tvp-iframe-holder"><iframe id="src="about:blank"" allowfullscreen frameborder="0" scrolling="no"></iframe></div>');

      var holder = document.getElementById(spotId + '-holder');
      var type = spot.className.replace('tvp-', '');
      holder.classList.add(type);

      var widget  = new Widget({
        type: type,
        holder: holder,
        id: spotId
      }); 

      widget.initialize();

      removeEl(spot);
    }
  }

  window.addEventListener('load', load);

}(window, document));