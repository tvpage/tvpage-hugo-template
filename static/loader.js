//The widgets loader, so far it takes care of the aspect ratio of the iframes,
//it can also optionaly fetch the content from a widget url, it also permits
//to load the iframe scripts asynchronouse, this hides the browser spinner.
;(function(root,doc){

  if (root.DEBUG) {
    root.DEBUG_start = performance.now();
  }

  var isset = function(o,p){
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
        type = id.split('-').shift(),
        cssLib = domain+'/'+type+'/styles.css';

    widget.run = function() {
      spot.insertAdjacentHTML('beforebegin', '<div id="' + id + '-holder" class="' + pre + '-holder"></div>');
      
      var holder = doc.getElementById(id + '-holder'),
          embedMethod = spot.getAttribute('data-embedmethod') || 'iframe';
      
      if (embedMethod === 'iframe') {
        var lazy = true;
        var iframe = doc.createElement('iframe');
        iframe.setAttribute('allowfullscreen', '');
        iframe.classList.add('tvp-iframe');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('scrolling', 'no');
        holder.classList.add(type);
        holder.appendChild(iframe);
        
        iframe.onload = function(){
          if (root.DEBUG) console.debug("Iframe loaded at: " + (performance.now() - root.DEBUG_start) + " ms");
          
          if ('solo' === type) {
            if (root.DEBUG) console.debug("Dynamic resize not required for solo");
            return;
          }

          var content = this.contentWindow.document.body.firstChild,
              resize = function() { holder.style.height = content.offsetHeight + 'px';};
          resize();
          root.addEventListener('resize', debounce(resize,50));
        };
        

        //Reference for the performance boost technique
        //http://www.aaronpeters.nl/blog/iframe-loading-techniques-performance?%3E
        if (lazy && 'dynamic' === dataMethod) {
          var html = '<body class="' + dataMethod + ' is-iframe" data-domain="'+domain+'" data-id="' + id + '" data-src="' + (spot.href || '') + '" onload="'+
          'var d = document, head = d.getElementsByTagName(\'head\')[0],'+
          'injScr = function(sr){ var s=d.createElement(\'script\');s.src=sr;head.appendChild(s);};';

          var libs = {
                tvpsolo: '\''+domain+'\/playerpack'+libsExt+'\'',
                tvppack: '\''+domain+'\/' + type + '\/lib'+libsExt+'\'',
                player: '\''+domain+'\/player'+libsExt+'\''
              },
              libsCounter = Object.keys(libs).length;

          while (libsCounter > 0) {
            var key = Object.keys(libs)[libsCounter-1];
            html += 'injScr(' + libs[key] + ');';
            libsCounter--;
          }

          html += 'var css=d.createElement(\'link\');css.rel=\'stylesheet\';css.type=\'text/css\';';
          html += 'css.href='+('\''+domain+'\/' + type)+'\/styles.css\';head.appendChild(css);'
          html += '">';
          
          var iframeDoc = iframe.contentWindow.document;
          iframeDoc.open().write(html);
          iframeDoc.close();

        } else {
          function setSrc() {
            var src = spot.href;
            (-1 == navigator.userAgent.indexOf("MSIE")) ? iframe.src = src : iframe.location = src;
          }
          setTimeout(setSrc,0);
        }
      } else {

        holder.classList.add('inline');

        __TVPage__.inline = __TVPage__.inline || [];
        __TVPage__.inline.push(id);
        __TVPage__.inlineCount = __TVPage__.inline.length || 0;
        if (! __TVPage__.inlineCount) return;

        //Adding the libs to be used in the iframe.
        var libs = {
              tvppack: domain + '/playerpack'+libsExt,
              tvpsolo: domain + '/'+type +'/lib'+libsExt,
              player: domain + '/player'+libsExt
            },
            libsFrag = doc.createDocumentFragment(),
            libsCounter = Object.keys(libs).length;

        while (libsCounter > 0) {
          var key = Object.keys(libs)[libsCounter-1];
          if (doc.getElementById(key)) break;
          var scr = doc.createElement('script');
          scr.id = 'tvpa';
          scr.type = 'text/javascript';
          scr.async = true;
          scr.src = libs[key].replace(/'/g,'');
          libsFrag.appendChild(scr);
          libsCounter--;
        }

        var link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssLib;
        libsFrag.appendChild(link);
        appendToHead(libsFrag);
      }
    }

    widget.run();

    return widget;
  }

//Adding the css for host page
var style = doc.createElement('style'),
    pre = 'tvp-iframe',
    holderClass = '.' + pre + '-holder';

style.innerHTML = holderClass + '{height:0;position:relative;transition:height ease-out 0.0001s;}'+
holderClass + '.solo{padding-top:56.25%;}'+
holderClass + '.inline{padding-top:0;}'+
'.' + pre + '{top:0;left:0;width:100%;height:100%;position:absolute;}';
appendToHead(style);

if (root.DEBUG) {
  console.debug("CSS added to host page at: " + (performance.now() - root.DEBUG_start) + " ms");
}

//Load each widget spots from the page.
var spots = doc.querySelectorAll('.tvp-sidebar, .tvp-solo'),
    spotsCount = spots.length;

var load = function(){
  while (spotsCount > 0) {
    var spot = spots[spotsCount - 1]
    Widget(spots[spotsCount - 1]);
    spot.remove();
    spotsCount--;
  }
};

load();

}(window,document));