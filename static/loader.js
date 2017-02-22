//The widgets loader, so far it takes care of the aspect ratio of the iframes,
//it can also optionaly fetch the content from a widget url, it also permits
//to load the iframe scripts asynchronouse, this hides the browser spinner.
//Loader is the delegator of iframe messages.
(function(window, document) {

  if (window.DEBUG) {
    console.debug("startTime = " + performance.now());
  }

  var env = window.DEBUG ? 'dev' : 'prod',
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isset = function(o, p) {
      var val = o;
      if (p) val = o[p];
      return 'undefined' !== typeof val;
    },
    appendToHead = function(el) {
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(el);
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

  function Widget(spot) {
    var widget = function() {};

    var cssExt = window.DEBUG ? '.css' : '.min.css',
      dataMethod = 'static',
      id = spot.getAttribute('data-id');

    if (isset(window, '__TVPage__') && isset(__TVPage__, 'config') && isset(__TVPage__.config, id) &&
      isset(__TVPage__.config[id], 'channel') && isset(__TVPage__.config[id].channel, 'id')) {
      dataMethod = 'dynamic';
    }

    var domain = spot.getAttribute('data-domain'),
      type = spot.getAttribute('class').replace('tvp-','');

    var typeStaticPath = domain + '/' + type + (window.DEBUG ? '/' : '/dist/');
    var jsPath = typeStaticPath + 'js/';

    var sidebarJS = {
      dev: [
        jsPath + 'libs/utils.js',
        jsPath + 'grid.js',
        jsPath + 'index.js'
      ],
      prod: [
        jsPath + 'scripts.min.js'
      ]
    };

    var soloJS = {
      dev: [
        '//a.tvpage.com/tvpa.min.js',
        '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
        jsPath + 'libs/analytics.js',
        jsPath + 'libs/player.js',
        jsPath + 'index.js'
      ],
      prod: [
        '//a.tvpage.com/tvpa.min.js',
        '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
        jsPath + 'scripts.min.js'
      ]
    };

    widget[id] = {};

    widget.run = function() {
      spot.insertAdjacentHTML('beforebegin', '<div id="' + id + '-holder" class="tvp-iframe-holder"></div>');

      var holder = document.getElementById(id + '-holder'),
        embedMethod = spot.getAttribute('data-embedmethod') || 'iframe';

      //Add the host (parent) css.
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      var hostCssPath = typeStaticPath;
      hostCssPath += 'css/' + (isMobile ? 'mobile/' : '') + 'host' + cssExt;
      link.href = hostCssPath;
      appendToHead(link);

      holder.classList.add(type);
      if (embedMethod === 'iframe') {
        var iframe = createIframe();

        if ('solo' === type || 'solo-click' === type) {
          iframe.onload = function() {
            var ifr = this;
            window.addEventListener('resize', debounce(function() {
              ifr.contentWindow.postMessage({
                event: '_tvp_widget_holder_resize',
                size: [holder.offsetWidth, holder.offsetHeight]
              }, '*');
            }, 50));
          };
        } else if ('sidebar' === type) {

          //Whe need to receive the data from the click first, then we create the overlay & modal on the fly.
          window.addEventListener('message', function(e) {
            if (!e || !isset(e, 'data') || !isset(e.data, 'event')) return;

            var eventName = e.data.event;
            if ('tvp_sidebar:render' === eventName || 'tvp_sidebar:grid_resize' === eventName) {
              holder.style.height = e.data.height;
            }

            if ('tvp_sidebar:video_click' === eventName) {
              var data = e.data;
              var selectedVideo = data.selectedVideo || {};
              var dataVideos = isset(data,'videos') ? data.videos : [];
              var runTime = (data.runTime || __TVPage__).config[id];

              widget[id] = widget[id] || {};
              widget[id] = {
                data: data.videos || [],
                selectedVideo: selectedVideo,
                runTime: runTime
              };

              var modalFrag = document.createDocumentFragment();

              //we shorten the lenght of long titles and add 3 point at the end
                for (var i = 0; i < dataVideos.length; i++) {
                  var trimmedTitle = dataVideos[i].title.length > 62 ? dataVideos[i].title.substring(0, 62) + "..." : dataVideos[i].title;
                  dataVideos[i].title = trimmedTitle;
                }

              var overlay = document.createElement('div');
              overlay.classList.add('tvp-modal-overlay');
              modalFrag.appendChild(overlay);
              var modal = document.createElement('div');
              modal.classList.add('tvp-modal');
              modal.innerHTML = '<div class="tvp-modal-wrapper"><div class="tvp-modal-content"><div class="tvp-modal-header">' +
                '<svg class="tvp-modal-close" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'+
                '<div class="tvp-title"><h4 class="tvp-modal-title">' + selectedVideo.title + '</h4><p>Related Products</p></div>' +
                '</div><div class="tvp-modal-body"><iframe id="tvp-iframe-modal_' + id + '" src="about:blank"' +
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
                  typeStaticPath + 'css/' + (isMobile ? 'mobile' : '') + '/modal/styles' + cssExt,
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
        }

        holder.appendChild(iframe);

        //Because iframes are loaded first before the host page loading, we load them empties, making this load time
        //reduced as its minimum, we start then creating the content of the iframe dynamically.
        //Reference: http://www.aaronpeters.nl/blog/iframe-loading-techniques-performance?%3E
        if ('dynamic' === dataMethod) {
          var iframeDoc = iframe.contentWindow.document;
          iframeDoc.open().write(createIframeHtml({
            js: function() {
              var js;
              if ('solo' === type || 'solo-click' === type) {
                js = soloJS[env];
              } else if ('sidebar' === type) {
                js = sidebarJS[env];
              }
              return js
            }(),
            css: [typeStaticPath + 'css/styles' + cssExt],
            className: dataMethod,
            domain: domain,
            id: id
          }));
          iframeDoc.close();
        }

        //Handling the static iframe scenario, not much to do, just delay the src addition.
        else {
          setTimeout(function() {
            var src = spot.href;
            (-1 == navigator.userAgent.indexOf("MSIE")) ? iframe.src = src: iframe.location = src;
          },5);
        }

      }
    }

    widget.run();
    return widget;
  }

  //Load each widget spots from the page.
  var spots = document.querySelectorAll('.tvp-sidebar, .tvp-solo, .tvp-solo-click'),
    spotsCount = spots.length;

  function load() {
    while (spotsCount > 0) {
      var i = spotsCount - 1,
          spot = spots[ i ];
      
      new Widget(spots[ i ]);
      
      removeEl(spot);

      spotsCount--;
    }
  };

  window.addEventListener('load', load);

}(window, document));