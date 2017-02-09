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
        typeStaticPath = domain + '/' + type + (window.DEBUG ? '/' : '/dist/');

    widget.run = function() {
      spot.insertAdjacentHTML('beforebegin', '<div id="' + id + '-holder" class="tvp-iframe-holder"></div>');
      
      var holder = document.getElementById(id + '-holder'),
          embedMethod = spot.getAttribute('data-embedmethod') || 'iframe';

      if (embedMethod === 'iframe') {

        //Add the host (parent) css.
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        var hostCssPath = typeStaticPath;
        hostCssPath += 'css/' + (isMobile ? 'mobile/' : '') + 'host' + cssExt;
        link.href = hostCssPath;
        appendToHead(link);

        var iframe = document.createElement('iframe');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('name', location.origin);
        iframe.classList.add('tvp-iframe');

        if ('sidebar' === type) {

          //Whe need to receive the data from the click first, then we create the overlay & modal on the fly.
          window.addEventListener('message', function(e){
            if (!e || !isset(e, 'data') || !isset(e.data, 'event')) return;

            var eventName = e.data.event;
            if ('_tvp_sidebar_video_click' === eventName) {
              var close = function(){
                overlay.removeEventListener('click',close,false);
                overlay.remove();
                modal.remove();
              };

              //The overlay & modal elements.
              var modalFrag = document.createDocumentFragment();
              var overlay = document.createElement('div');
              
              overlay.classList.add('tvp-modal-overlay');
              overlay.addEventListener('click',close);
              modalFrag.appendChild(overlay);
                
              var data = e.data;
              var selectedVideo = data.selectedVideo || {};
              var modal = document.createElement('div');
              
              modal.classList.add('tvp-modal');
              modal.innerHTML = '<svg class="tvp-modal-close" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">'+
              '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'+
              '<div class="tvp-modal-guts"><p class="tvp-modal-title">'+selectedVideo.title+'</p><iframe id="tvp-iframe-modal_' + id + '" src="'+ domain + '/tvpwidget/'+
              id + '-modal' + (isMobile ? '-mobile' : '') + '" allowfullscreen frameborder="0" scrolling="no" class="tvp-iframe-modal"></iframe></div>';
              modalFrag.appendChild(modal);
              modalFrag.querySelector('.tvp-modal-close').addEventListener('click', close);

              var iframe = modalFrag.querySelector('.tvp-iframe-modal');
              iframe.onload = function(){
                this.contentWindow.postMessage({
                  event: '_tvp_sidebar_modal_data',
                  videos: data.videos || [],
                  selectedVideo: selectedVideo
                }, '*');
              };

              document.body.appendChild(modalFrag);

            } else if ('_tvp_sidebar_modal_rendered' === eventName) {
              document.getElementById('tvp-iframe-modal_'+id).style.height = e.data.height;
            }
          });

        }        

        holder.classList.add(type);
        holder.appendChild(iframe);
        
        //Because iframes aare loaded first before the host page loading, we load them empties, making this load time
        //reduced as its minimum, we start then creating the content of the iframe dynamically.
        //Reference: http://www.aaronpeters.nl/blog/iframe-loading-techniques-performance?%3E
        if ('dynamic' === dataMethod) {
          var html = '<body class="' + dataMethod + ' is-iframe" data-domain="'+domain+'" data-id="' + id + '" onload="'+
          'var d = document, head = d.getElementsByTagName(\'head\')[0],'+
          'injScr = function(sr){ var s=d.createElement(\'script\');s.src=sr;head.appendChild(s);};';

          var libs = [
            '\'//a.tvpage.com/tvpa.min.js\'',
            '\'//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js\''
          ];
          
          if (window.DEBUG) {
            libs = libs.concat([
              '\'' + typeStaticPath + 'js/libs/analytics.js\'',
              '\'' + typeStaticPath + 'js/libs/player.js\'',
              '\'' + typeStaticPath + 'js/index.js\''
            ]);
          } else {
            libs = libs.concat(['\'' + typeStaticPath + 'js/scripts.min.js\'']);
          }

          for (var i = 0; i < libs.length; i++) {
            html += 'injScr(' + libs[i] + ');';
          }

          html += 'var css=d.createElement(\'link\');css.rel=\'stylesheet\';css.type=\'text/css\';';
          html += 'css.href=\'' + typeStaticPath + 'css/styles'+cssExt+'\';head.appendChild(css);';

          if (window.DEBUG) {
            html += 'window.DEBUG=1;';
          }

          html += '">';
          
          var iframeDoc = iframe.contentWindow.document;
          iframeDoc.open().write(html);
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

        //Handling widget's iframe aspect ratio.
        var handleSizing = function(){
          if ('sidebar' === type) {
            window.addEventListener('message', function(e){
              if (!e || !isset(e, 'data') || !isset(e.data, 'event')) return;
              var eventName = e.data.event;
              if ('_tvp_widget_first_render' === eventName || '_tvp_widget_grid_resize' === eventName) {
                holder.style.height = e.data.height;
              }
            });
          } else if ('solo' === type) {
            iframe.onload = function(){
              var ifr = this;
              window.addEventListener('resize', debounce(function(){
                ifr.contentWindow.postMessage({
                  event: '_tvp_widget_holder_resize',
                  size: [holder.offsetWidth, holder.offsetHeight]
                }, '*');
              },50));
            };
          } else {
            console.log('type: ' + type + ' unknown');
          }
        };

        handleSizing();

      } else {

        holder.classList.add('inline');

        __TVPage__.inline = __TVPage__.inline || [];
        __TVPage__.inline.push(id);
        if (!__TVPage__.inline.length) return;

        //Appending libs to be used for inline.
        var libsFrag = document.createDocumentFragment(),
            devLibs = {
              tvpsolo: typeStaticPath + 'js/index.js',
              player: typeStaticPath + 'js/libs/player.js',
              analytics: typeStaticPath + 'js/libs/analytics.js',
              tvpp: '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
              tvpa: '//a.tvpage.com/tvpa.min.js'
            },
            prodLibs = {
              tvpsolo: typeStaticPath + 'js/scripts.min.js',
              tvpp: '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
              tvpa: '//a.tvpage.com/tvpa.min.js'
            };
        
        var libs = window.DEBUG ? devLibs : prodLibs,
            libsCount = Object.keys(libs).length;

        while (libsCount > 0) {
          var key = Object.keys(libs)[libsCount-1];
          if (document.getElementById(key)) break;
          var scr = document.createElement('script');
          scr.id = key;
          scr.async = true;
          scr.src = libs[key].replace(/'/g,'');
          libsFrag.appendChild(scr);
          libsCount--;
        }

        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = typeStaticPath + '/css/styles' + cssExt;
        libsFrag.appendChild(link);
        appendToHead(libsFrag);
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
    spot.remove();
    spotsCount--;
  }
};

window.addEventListener('load', load);

}(window,document));