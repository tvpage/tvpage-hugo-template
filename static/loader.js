//The widgets loader, so far it takes care of the aspect ratio of the iframes,
//it can also optionaly fetch the content from a widget url, it also permits
//to load the iframe scripts asynchronouse, this hides the browser spinner.
//Loader is the delegator of iframe messages.
;(function(window,document){

  if (window.DEBUG) {
    console.debug("startTime = " + performance.now());
  }

  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isset = function(o,p){
        return 'undefined' !== typeof o[p]
      },
      appendToHead = function(el){
        (document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(el);
      },
      removeEl = function(el){
        if (!el) return;
        el.parentNode.removeChild(el);
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
      },
      createIframe = function(){
        var ifr = document.createElement('iframe');
        ifr.setAttribute('allowfullscreen', '');
        ifr.setAttribute('frameborder', '0');
        ifr.setAttribute('scrolling', 'no');
        ifr.classList.add('tvp-iframe');
        return ifr;
      },
      createIframeHtml = function(options){
        var html = '<body class="' + (options.className || '') + '" data-domain="' + (options.domain || '') + '" data-id="' + (options.id || '') + '" onload="'+
        'var doc = document, head = doc.getElementsByTagName(\'head\')[0],'+
        'addScript = function(src){ var script = doc.createElement(\'script\');script.src=src;doc.body.appendChild(script);};'+
        'addCSSLink = function(href){ var link = doc.createElement(\'link\');link.type=\'text/css\';link.rel=\'stylesheet\';link.href=href;head.appendChild(link);};'+
        'window.DEBUG=' + (window.DEBUG || 0) + ';';

        if (options.js && options.js.length) {
          var js = options.js;
          for (var i = 0; i < js.length; i++) {
            html += 'addScript(\'' + js[i] + '\');';
          }
        }

        if (options.css && options.css.length) {
          var css = options.css;
          for (var i = 0; i < css.length; i++) {
            html += 'addCSSLink(\'' + css[i] + '\');';
          }
        }

        html += '">';

        if (options.html && options.html.length) {
          html += options.html;
        }

        return html;
      };

  function Widget(spot) {
    var widget = function(){};

    var cssExt = window.DEBUG ? '.css' : '.min.css',
        dataMethod = 'static',
        id = spot.getAttribute('data-id');

    if (isset(window,'__TVPage__') && isset(__TVPage__,'config') && isset(__TVPage__.config,id) &&
      isset(__TVPage__.config[id],'channel') && isset(__TVPage__.config[id].channel,'id')) {
      dataMethod = 'dynamic';
    }
    
    var domain = spot.getAttribute('data-domain'),
        type = spot.getAttribute('class').split('-').pop();
        typeStaticPath = domain + '/' + type + (window.DEBUG ? '/' : '/dist/'),
        jsPath = typeStaticPath + 'js/',
        mobileJsPath = jsPath + 'mobile/';

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

    var sidebarMobileModalJS = {
      dev: [
        '//a.tvpage.com/tvpa.min.js',
        '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
        jsPath + 'vendor/jquery.js',
        jsPath + 'libs/utils.js',
        jsPath + 'libs/analytics.js',
        jsPath + 'libs/player.js',
        mobileJsPath + 'modal/index.js'
      ],
      prod: [
        jsPath + 'scripts.min.js'
      ]
    };

    var sidebarModalJS = {
      dev: [
        '//a.tvpage.com/tvpa.min.js',
        '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
        jsPath + 'libs/utils.js',
        jsPath + 'libs/analytics.js',
        jsPath + 'libs/player.js',
        jsPath + 'modal/index.js'
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
        jsPath + 'scripts.min.js'
      ]
    };

    widget[id] = {};

    widget.run = function() {
      spot.insertAdjacentHTML('beforebegin', '<div id="' + id + '-holder" class="tvp-iframe-holder"></div>');
      
      var holder = document.getElementById(id + '-holder'),
          embedMethod = spot.getAttribute('data-embedmethod') || 'iframe',
          env = window.DEBUG ? 'dev' : 'prod';

      //Add the host (parent) css.
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      var hostCssPath = typeStaticPath;
      hostCssPath += 'css/' + (isMobile ? 'mobile/' : '') + 'host' + cssExt;
      link.href = hostCssPath;
      appendToHead(link);

      if (embedMethod === 'iframe') {
        var iframe = createIframe();



        if ('solo' === type) {
          iframe.onload = function(){
            var ifr = this;
            window.addEventListener('resize', debounce(function(){
              ifr.contentWindow.postMessage({
                event: '_tvp_widget_holder_resize',
                size: [holder.offsetWidth, holder.offsetHeight]
              }, '*');
            },50));
          };
        } 

        else if ('sidebar' === type) {

          //Whe need to receive the data from the click first, then we create the overlay & modal on the fly.
          window.addEventListener('message', function(e){
            if (!e || !isset(e, 'data') || !isset(e.data, 'event')) return;

            var eventName = e.data.event;

            if ('tvp_sidebar:first_render' === eventName || 'tvp_sidebar:grid_resize' === eventName) {
              holder.style.height = e.data.height;
            }

            if ('tvp_sidebar:modal_rendered' === eventName) {

              var iframeModal = document.getElementById('tvp-iframe-modal_'+id);
              iframeModal.style.height = e.data.height;
              var widgetData = widget[id];
              holder.classList.add('rendered');

              iframeModal.contentWindow.postMessage({
                event: '_tvp_sidebar_modal_data',
                data: widgetData.data,
                selectedVideo: widgetData.selectedVideo,
                runTime: widgetData.runTime
              }, '*');
            }

            if('tvp_sidebar:modal_resized' === eventName){
              document.getElementById('tvp-iframe-modal_'+id).style.height = e.data.height;
            }

            if ('tvp_sidebar:video_click' === eventName) {

              //The overlay & modal elements.
              var modalFrag = document.createDocumentFragment();
              
              var overlay = document.createElement('div');
              overlay.classList.add('tvp-modal-overlay');
              modalFrag.appendChild(overlay);
              
              var modal = document.createElement('div');
              modal.classList.add('tvp-modal');

              var data = e.data;
              var selectedVideo = data.selectedVideo || {};

              widget[id] = widget[id] || {};
              widget[id] = {
                data: data.videos || [],
                selectedVideo: selectedVideo,
                runTime: data.runTime || __TVPage__
              };

              modal.innerHTML = '<div class="tvp-modal-wrapper"><div class="tvp-modal-content"><div class="tvp-modal-header">'+
              '<svg class="tvp-modal-close" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">'+
              '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'+
              '<h4 class="tvp-modal-title">' + selectedVideo.title + '</h4></div><div class="tvp-modal-body"><iframe id="tvp-iframe-modal_' + id + '" src="about:blank"'+
              'allowfullscreen frameborder="0" scrolling="no" class="tvp-iframe-modal"></iframe></div></div></div>';

              modalFrag.appendChild(modal);

              var button = modalFrag.querySelector('.tvp-modal-close');
              var close = function(){
                button.removeEventListener('click',close,false);
                [modal,overlay,button].forEach(function(el){removeEl(el);});
              };
              button.addEventListener('click', close);

              var iframeModal = modalFrag.querySelector('.tvp-iframe-modal');

              document.body.appendChild(modalFrag);

              var ifrWindow = iframeModal.contentWindow;
              var iframeModalDoc = ifrWindow.document;

              var iframeContent = '<div id="' + id + '" class="tvp-clearfix iframe-content">';
              if (isMobile) {
                iframeContent += '<div class="tvp-player"><div id="tvp-player-el"><svg class="tvp-play" viewBox="0 0 200 200" alt="Play video"><polygon points="70, 55 70, 145 145, 100" fill="#e57211"></polygon></svg></div></div>'+
                '<div class="tvp-products"><div class="tvp-products-carousel"></div></div>';
              } else {
                iframeContent += '<div class="tvp-player-holder"><div class="tvp-player"><div id="tvp-player-el"></div></div></div>'+
                '<div class="tvp-products-holder"><div class="tvp-products"><a class="tvp-product"></a><a class="tvp-product"></a><a class="tvp-product"></a></div></div>';
              }
              iframeContent += '</div>';

              var jsLibs = sidebarModalJS[env];
              if (isMobile) {
                jsLibs = sidebarMobileModalJS[env];
              }
              iframeModalDoc.open().write(createIframeHtml({
                domain: domain,
                id: id,
                html: iframeContent,
                js: jsLibs,
                css: [
                  typeStaticPath + 'css/' + (isMobile ? 'mobile' : '') + '/modal/styles'+cssExt
                ]
              }));
              iframeModalDoc.close();
            }
          });
        }

        holder.appendChild(iframe);
        
        //Because iframes aare loaded first before the host page loading, we load them empties, making this load time
        //reduced as its minimum, we start then creating the content of the iframe dynamically.
        //Reference: http://www.aaronpeters.nl/blog/iframe-loading-techniques-performance?%3E
        if ('dynamic' === dataMethod) {
          var iframeDoc = iframe.contentWindow.document;
          iframeDoc.open().write(createIframeHtml({
            js: function(){
              var js;
              if ('solo' === type) {
                js = soloJS[env];
              } else if ('sidebar' === type) {
                js = sidebarJS[env];
              }
              return js
            }(),
            css: [typeStaticPath + 'css/styles'+cssExt],
            className: dataMethod,
            domain: domain,
            id: id
          }));
          iframeDoc.close();
        }
        
        //Handling the static iframe scenario, not much to do, just delay the src addition.
        else {
          function setSrc() {
            var src = spot.href;
            (-1 == navigator.userAgent.indexOf("MSIE")) ? iframe.src = src : iframe.location = src;
          }
          setTimeout(setSrc,5);
        }

      }
    }

    widget.run();
    return widget;
  }

//Load each widget spots from the page.
var spots = document.querySelectorAll('.tvp-sidebar, .tvp-solo'),
    spotsCount = spots.length;

function load(){
  while (spotsCount > 0) {
    var spot = spots[spotsCount - 1]
    Widget(spots[spotsCount - 1]);
    removeEl(spot);
    spotsCount--;
  }
};

window.addEventListener('load', load);

}(window,document));