//The widgets loader, so far it takes care of the aspect ratio of the iframes,
//it can also optionaly fetch the content from a widget url, it also permits
//to load the iframe scripts asynchronouse, this hides the browser spinner.
;(function(root,doc){

  if (root.DEBUG) {
    console.debug("startTime = " + performance.now());
  }

  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isset = function(o,p){
        return 'undefined' !== typeof o[p]
      },
      appendToHead = function(el){
        (doc.getElementsByTagName('head')[0]||doc.getElementsByTagName('body')[0]).appendChild(el);
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

    var libsExt = root.DEBUG ? '.js' : '.min.js',
        dataMethod = 'static',
        id = spot.getAttribute('data-id');

    if (isset(root,'__TVPage__') && isset(__TVPage__,'config') && isset(__TVPage__.config,id) &&
      isset(__TVPage__.config[id],'channel') && isset(__TVPage__.config[id].channel,'id')) {
      dataMethod = 'dynamic';
    }
    
    var domain = spot.getAttribute('data-domain'),
        type = id.split('-').shift();

    widget.run = function() {
      spot.insertAdjacentHTML('beforebegin', '<div id="' + id + '-holder" class="tvp-iframe-holder"></div>');
      
      var holder = doc.getElementById(id + '-holder'),
          embedMethod = spot.getAttribute('data-embedmethod') || 'iframe';
      
      if (embedMethod === 'iframe') {
        var link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = domain+'/'+type+'/css/host'+(isMobile?'-mobile':'')+'.css';
        appendToHead(link);

        var iframe = doc.createElement('iframe');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('scrolling', 'no');
        iframe.classList.add('tvp-iframe');
        
        holder.classList.add(type);
        holder.appendChild(iframe);
        
        iframe.onload = function(){
          if (root.DEBUG) {
            this.contentWindow['DEBUG'] = 1;
          }

          if ('sidebar' === type) {
            var ifrBody = this.contentWindow.document.body,
                content = ifrBody.firstChild,
                resize = function() { 
                  holder.style.height = content.offsetHeight + 'px';
                };

            var checks = 0;
            (function contentReady() {
              setTimeout(function() {
                if (!content.classList.contains('first-render')) {
                  (++checks < 20) ? contentReady() : console.log('limit reached');
                } else {
                  resize();
                }
              },200);
            })();
            
            root.addEventListener('resize', debounce(resize,50));
          }

          if ('solo' === type) {
            var that = this;
            root.addEventListener('resize', debounce(function(){
              if(isset(that.contentWindow, '_tvp_'+id) && !that.contentWindow['_tvp_'+id+'isFullScreen']){
                that.contentWindow['_tvp_'+id].resize(holder.offsetWidth,holder.offsetHeight);
              }
            },50));
          }
        };
        
        //Because iframes aare loaded first before the host page loading, we load them empties, making this load time
        //reduced as its minimum, we start then creating the content of the iframe dynamically.
        //Reference: http://www.aaronpeters.nl/blog/iframe-loading-techniques-performance?%3E
        if ('dynamic' === dataMethod) {
          var html = '<body class="' + dataMethod + ' is-iframe" data-domain="'+domain+'" data-id="' + id + '" onload="'+
          'var d = document, head = d.getElementsByTagName(\'head\')[0],'+
          'injScr = function(sr){ var s=d.createElement(\'script\');s.src=sr;head.appendChild(s);};';

          var libs = [
            '\'//a.tvpage.com/tvpa.min.js\'',
            '\'//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js\'',
            '\'' + domain + '/analytics' + libsExt + '\'',
            '\'' + domain + '/player' + libsExt + '\'',
            '\'' + domain + '/' + type + '/js/main' + libsExt + '\''
          ];

          for (var i = 0; i < libs.length; i++) {
            html += 'injScr(' + libs[i] + ');';
          }

          html += 'var css=d.createElement(\'link\');css.rel=\'stylesheet\';css.type=\'text/css\';';
          html += 'css.href='+('\''+domain+'/' + type)+'/styles.css\';head.appendChild(css);';

          if (root.DEBUG) {
            html += 'window.DEBUG=1;';
          }

          html += '">';
          
          var iframeDoc = iframe.contentWindow.document;
          iframeDoc.open().write(html);
          iframeDoc.close();

        } else {
          function setSrc() {
            var src = spot.href;
            (-1 == navigator.userAgent.indexOf("MSIE")) ? iframe.src = src : iframe.location = src;
          }
          setTimeout(setSrc,5);
        }
      } else {

        holder.classList.add('inline');

        __TVPage__.inline = __TVPage__.inline || [];
        __TVPage__.inline.push(id);
        if (!__TVPage__.inline.length) return;

        //Appending libs to be used for inline.
        var libsFrag = doc.createDocumentFragment(),
            libs = {
              tvpsolo: domain + '/'+ type + '/js/main' + libsExt,
              player: domain + '/player' + libsExt,
              analytics: domain + '/analytics' + libsExt,
              tvpp: '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.5-min.js',
              tvpa: '//a.tvpage.com/tvpa.min.js'
            },
            libsCount = Object.keys(libs).length;

        while (libsCount > 0) {
          var key = Object.keys(libs)[libsCount-1];
          if (doc.getElementById(key)) break;
          var scr = doc.createElement('script');
          scr.id = key;
          scr.async = true;
          scr.src = libs[key].replace(/'/g,'');
          libsFrag.appendChild(scr);
          libsCount--;
        }

        var link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = domain+'/'+type+'/styles.css';
        libsFrag.appendChild(link);
        appendToHead(libsFrag);
      }
    }

    widget.run();

    return widget;
  }

//Load each widget spots from the page.
var spots = doc.querySelectorAll('.tvp-sidebar, .tvp-solo'),
    spotsCount = spots.length;

function load(){
  while (spotsCount > 0) {
    var spot = spots[spotsCount - 1]
    Widget(spots[spotsCount - 1]);
    spot.remove();
    spotsCount--;
  }
};

root.addEventListener('load', load);

}(window,document));