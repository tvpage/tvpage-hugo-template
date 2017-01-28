//The widgets loader, so far it takes care of the aspect ratio of the iframes,
//it can also optionaly fetch the content from a widget url, it also permits
//to load the iframe scripts asynchronouse, this hides the browser spinner.
;(function(root,doc){

  var DEBUG = 0;

  var spots = doc.querySelectorAll('.tvp-sidebar, .tvp-solo'),
      spotsCount = spots.length,
      pre = 'tvp-iframe',
      redefine = function(o,p){return 'undefined' !== typeof o[p]},
      getIfr = function(){
        var i = doc.createElement('iframe');
        i.setAttribute('allowfullscreen', '');
        i.classList.add(pre);
        i.setAttribute('frameborder', '0');
        return i;
      };

function Widget(spot) {
  var widget = function(){};

  //Define the data method.
  var dataMethod = 'static';
  var id = spot.getAttribute('data-id');
  if (redefine(root,'__TVPage__') && redefine(__TVPage__,'config') && redefine(__TVPage__.config,id) &&
    redefine(__TVPage__.config[id],'channel') && redefine(__TVPage__.config[id].channel,'id')) {
    dataMethod = 'dynamic';
  }
  
  var domain = spot.getAttribute('data-domain'),
      type = id.split('-').shift();

  widget.run = function() {
    spot.insertAdjacentHTML('beforebegin', '<div id="' + id + '-holder" class="' + pre + '-holder"></div>');
    var holder = doc.getElementById(id + '-holder'),
        embedMethod = spot.getAttribute('data-embedmethod') || 'iframe';
    
    if (embedMethod === 'iframe') {
      var lazy = true, iframe = getIfr();
      holder.appendChild(iframe);

      //Reference for the performance boost technique
      //http://www.aaronpeters.nl/blog/iframe-loading-techniques-performance?%3E
      if (lazy && 'dynamic' === dataMethod) {
        var html = '<body class="' + dataMethod + ' is-iframe" data-domain="'+domain+'" data-id="' + id + '" data-src="' + (spot.href || '') + '" onload="'+
        'var d = document, head = d.getElementsByTagName(\'head\')[0],'+
        'injScr = function(sr){ var s=d.createElement(\'script\');s.src=sr;head.appendChild(s);};';

        var libs = {tvpsolo: '\''+domain+'\/playerpack'+(DEBUG ? '' : '.min')+'.js\'',tvppack: '\''+domain+'\/' + type + '\/lib'+(DEBUG ? '' : '.min')+'.js\''},
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
          var s = spot.href,
              ifr = holder.firstChild;
          (-1 == navigator.userAgent.indexOf("MSIE")) ? ifr.src = s : ifr.location = s;
        }
        setTimeout(setSrc,0);
      }
    } else {
      __TVPage__.inline = __TVPage__.inline || [];
      __TVPage__.inline.push(id);
      __TVPage__.inlineCount = __TVPage__.inline.length || 0;
      if (! __TVPage__.inlineCount) return;

      //Adding the libs to be used in the iframe.
      var libs = {tvpsolo: domain + '/playerpack'+(DEBUG ? '' : '.min')+'.js',tvppack: domain + '/'+type +'/lib'+(DEBUG ? '' : '.min')+'.js'},
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
      ( doc.getElementsByTagName('head')[0]||doc.getElementsByTagName('body')[0] ).appendChild(libsFrag);
    }
  }

  widget.run();

  return widget;
}

//Sdd the css for host page
var style = doc.createElement('style');
style.innerHTML = '.' + pre + '-holder{height:0;position:relative;padding-top:56.26%;background-color:black;}\
.' + pre + '{top:0;left:0;width:100%;height:100%;position:absolute;}';
doc.getElementsByTagName('head')[0].appendChild(style);

//We process each of the widget spots from the page...
var start = function(){
  while (spotsCount > 0) {
    var spot = spots[spotsCount - 1]
    
    Widget(spots[spotsCount - 1])

    spot.remove();
    spotsCount--;
  }
};

start();

}(window,document));