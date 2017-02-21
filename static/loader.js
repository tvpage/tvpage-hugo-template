//The selfs loader, so far it takes care of the aspect ratio of the iframes,
//it can also optionaly fetch the content from a self url, it also permits
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
      var val = o;
      if (p) val = o[p];
      return 'undefined' !== typeof val;
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
  var getIframeHtml = function(options) {
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

  //self Singleton...
  function Widget(spot, options) {
    var self = function() {};

    self.id = spot.id;
    
    spot.insertAdjacentHTML('beforebegin', '<div id="' + self.id + '-holder" class="tvp-iframe-holder">'+
    '<iframe id="src="about:blank"" allowfullscreen frameborder="0" scrolling="no"></iframe></div>');

    self.holder = document.getElementById(self.id + '-holder') || null;
    self.type = spot.className.replace('tvp-', '') || '';
    self.holder.classList.add(self.type);
    self.data = {};
    self.data[self.id] = {};
    self.dataMethod = 'static';
    self.config = {};
    
    spot.parentNode.removeChild(spot);

    if (isset(window, '__TVPage__') && isset(__TVPage__, 'config') && isset(__TVPage__.config, self.id)) {
      self.config = __TVPage__.config[self.id];
    }

    if (isset(self.config, 'channel') && isset(self.config.channel, 'id')) {
      self.dataMethod = 'dynamic';
    }

    if (isset(self.config, 'domain')) {
      self.static = self.config.domain + '/' + self.type;
      self.paths = {
        solo: {
          dev: [
            '//a.tvpage.com/tvpa.min.js',
            '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
            self.static + '/js/libs/analytics.js',
            self.static + '/js/libs/player.js',
            self.static + '/js/index.js'
          ],
          prod: [
            '//a.tvpage.com/tvpa.min.js',
            '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
            self.static + '/js/scripts.min.js'
          ]
        },
        sidebar: {
          dev: [
            self.static + '/js/libs/utils.js',
            self.static + '/js/grid.js',
            self.static + '/js/index.js'  
          ],
          prod: [
            self.static + 'js/scripts.min.js' 
          ]
        }
      };
    }

    self.initialize = function() {

      //Add target/host page css for our self
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      var hostCssPath = self.static;
      link.href = self.static + (window.DEBUG ? '/' : '/dist/') + 'css/' + (isMobile ? 'mobile/' : '') + 'host' + cssExt;
      document.getElementsByTagName('head')[0].appendChild(link);

      var iframe = self.holder.querySelector('iframe');
      
      iframe.onload = function() {
        if ('solo' === self.type || 'solo-click' === self.type) {
          var ifr = this;
          window.addEventListener('resize', debounce(function() {
            ifr.contentWindow.postMessage({
              event: '_tvp_self_holder_resize',
              size: [self.holder.offsetWidth, self.holder.offsetHeight]
            }, '*');
          }, 50));
        }
      };

      //By now, this is the central point for cross-domain messaging between iframes.
      window.addEventListener('message', function(e) {
        if (!e || !isset(e, 'data') || !isset(e.data, 'event')) return;

        var eventName = e.data.event;

        if ('tvp_sidebar:render' === eventName || 'tvp_sidebar:grid_resize' === eventName) {
          self.holder.style.height = e.data.height;
        }

        if ('tvp_sidebar:video_click' === eventName) {
          var data = e.data;
          var selectedVideo = data.selectedVideo || {};
          var runTime = (data.runTime || (isset(__TVPage__) ? __TVPage__ : {}) ).config[id];
          var id = self.id;
          
          self.data[id] = self[id] || {};
          self[id] = {
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
              el.parentNode.removeChild(el);
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

          iframeModalDoc.open().write(getIframeHtml({
            domain: domain,
            id: id,
            html: html,
            js: getModalJSFilePaths(domain, runTime.playerVersion),
            css: [
              self.static + (window.DEBUG ? '/' : '/dist/') + 'css/' + (isMobile ? 'mobile' : '') + '/modal/styles' + cssExt,
              (isMobile ? domain + '/' + type + '/css/vendor/slick.css' : '')
            ].filter(Boolean)
          }));
          iframeModalDoc.close();
        }

        var ifrIModalId = 'tvp-iframe-modal_' + id;

        if ('tvp_sidebar:modal_initialized' === eventName) {
          var selfData = self[id];
          var iframeModal = document.getElementById(ifrIModalId);
          if (iframeModal.contentWindow) {
            iframeModal.contentWindow.postMessage({
              event: '_tvp_sidebar_modal_data',
              data: selfData.data,
              selectedVideo: selfData.selectedVideo,
              runTime: selfData.runTime
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
                    event: '_tvp_self_holder_resize',
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
      if ('dynamic' === self.dataMethod) {

        var iframeDoc = iframe.contentWindow.document;
        iframeDoc.open().write(getIframeHtml({
          js: function() {
            var js, type = self.type;
            if ('solo' === type || 'solo-click' === type) {
              js = self.paths.solo[env];
            } else if ('sidebar' === type) {
              js = self.paths.sidebar[env];
            }
            return js
          }(),
          css: [self.static + (window.DEBUG ? '/' : '/dist/') + 'css/styles' + cssExt],
          className: self.dataMethod,
          domain: self.domain,
          id: self.id
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

    return self;
  }

  function load () {
    var spots = document.querySelectorAll('.tvp-sidebar, .tvp-solo, .tvp-solo-click');
    for (var i = 0; i < spots.length; i++) {

      //We want to show somehting immediately.
      //References:
      //http://stackoverflow.com/questions/7589853/how-is-insertadjacenthtml-so-much-faster-than-innerhtml
      var widget  = new Widget(spots[i],{});

      widget.initialize();
    }
  }

  window.addEventListener('load', load);

}(window, document));