var apiBaseUrl = config.api_base_url;
var baseUrl = config.baseUrl;


//we add the preconnect hints as soon as we can
(function addHTMLHints(){
  var domains = [
    apiBaseUrl,
    baseUrl
  ];
  
  var domainsLength = domains.length;
  var i;

  for (i = 0; i < domainsLength; i++) {
    var link = document.createElement('link');

    link.rel = 'preconnect';
    link.href = domains[i];

    document.head.appendChild(link);
  }
})();

//helpers
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function getById(id){
  return document.getElementById(id);
}

function createEl(t){
  return document.createElement(t);
}

function remove(el){
  el.parentNode.removeChild(el);
}

function saveProfileLog(c, m){
  if(!window.performance || !c)
    return;

  c.profiling[m] = performance.now();
}

function tmpl(t,d){
  return t.replace(/\{([\w\.]*)\}/g, function(str, key) {
    var keys = key.split("."),
      v = d[keys.shift()];
    for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
    return (typeof v !== "undefined" && v !== null) ? v : "";
  });
}

function loadScript(url, params, callback){
  if(!url)
    throw new Error('need url');

  params = params || {};
  
  var script = createEl('script');
  var param;
  var counter = 0;

  for (param in params) {
    url += (counter > 0 ? '&' : '?') + param + '=' + params[param];

    ++counter;
  }

  var callbackName = 'tvp_callback_' + Math.random().toString(36).substring(7);

  window[callbackName] = function(data){
    if('function' === typeof callback)
      callback(data);
  };

  script.src = url + '&callback=' + callbackName;

  document.body.appendChild(script);
}

//builds the document html for an iframe.
function getIframeHtml(o){
  function load(arr, type){
    arr = arr.filter(Boolean);
    
    var ret = '';
    var arrLength = arr.length;
    var i;

    for (i = 0; i < arrLength; i++)
      ret += 'append' + type + '(\'' + arr[i] + '\');';

    return ret;
  };

  var html = config.templates.iframeContent.trim();
  
  if(o.style){
    html += '<style>' + o.style + '</style>';
  }

  html += o.html || '';

  o.context.onload = '' +

  //take measurements,decide the best
  '(function(d){' +
    'var h = d.head;' +

    'function createEl(t){' +
    '  return d.createElement(t);' +
    '}' +

    'function appendScript(u){'+
    '  var s = createEl(\'script\');' +
    '  s.src = u;'+
    '  h.appendChild(s);' +
    '}' +

    'function appendLink(u){'+
    '  var l = createEl(\'link\');'+
    '  l.rel = \'stylesheet\';'+
    '  l.href = u;'+
    '  h.appendChild(l);' +
    '}' +
  
    load(o.js, 'Script') +
    load(o.css, 'Link') +

  '}(document))';

  return tmpl(html, o.context);
};

//we have a generic host css per widget type that we only include once.
function getInitialHtml(){
  var html = "";
  var styleId = 'tvp-' + config.type + '-host';
  var css = config.css;
  var hostStyles = isMobile ? css.mobile.host : css.host;
  var templates = isMobile ? config.mobile.templates : config.templates;

  if(!getById(styleId)){
    html += '<style id="' + styleId + '">' + hostStyles + '</style>';
  }

  html += tmpl('<div id="{id}-holder" class="tvp-{type}-holder tvp-hide">' + templates.iframe + '</div>', config);

  return html;
}

//build the player url
function getPlayerUrl(){
  var url = "https://cdnjs.tvpage.com/tvplayer/tvp-" + config.player_version + ".min.js";
  
  if (config.player_url && (config.player_url + "").trim().length) {
      url = config.player_url;
  }

  return url;
}

function widgetHolderResize(height){
  config.holder.style.height = height + 'px';
}

//here's the first HTML write we do to the host page, this is the fastest way to do it
//refer to https://jsperf.com/insertadjacenthtml-perf/3
function widgetRender(){
  function render(){

    (function(targetEl){
      targetEl.insertAdjacentHTML('beforebegin', getInitialHtml());  

      remove(targetEl);

      config.holder = getById(config.id + '-holder');
    }(getById(config.targetEl)))
  
    var debug = config.debug;
    var baseUrl = config.baseUrl;
    var jsPath = config.paths.javascript;
    var templates = isMobile ? config.mobile.templates : config.templates;
    var libsPath = baseUrl + '/libs';
    var cssPath = config.paths.css
    var iframe = config.holder.querySelector("iframe");
    var iframeDocument = iframe.contentWindow.document;
  
    iframeDocument.open().write(getIframeHtml({
      context: config,
      html: templates.base,
      className: isMobile ? 'mobile' : '',
      style: config.css.base,
      js: [
        '//www.youtube.com/iframe_api',
        '//a.tvpage.com/tvpa.min.js',

        //when or how do we need this?
        //'//imasdk.googleapis.com/js/sdkloader/ima3.js',

        //getPlayerUrl(),
        baseUrl + '/playerlib-debug.min.js',
        
        debug ? jsPath + '/vendor/jquery.js' : '',
        debug ? libsPath + '/analytics.js' : '',
        debug ? libsPath + '/carousel.js' : '',
        debug ? libsPath + '/player.js' : '',
        
        debug ? '' : jsPath + "/scripts.min.js"
      ],
      css: [
        debug ? baseUrl + '/slick/slick.css' : '',
        debug && isMobile ? baseUrl + '/slick/mobile/custom.css' : '',
        debug && !isMobile ? baseUrl + '/slick/custom.css' : '',
        debug ? '' : cssPath + '/styles.min.css'
      ]
    }));
  
    iframeDocument.close();
    
    saveProfileLog(config, 'widget_rendered');
  }

  //we will poll if the target element is not in the page immediately, this is required to cover
  //scenarios where customer add this element lazily.
  if(getById(config.targetEl)){
    render();
  }else{
    var targetElCheck = 0;
    var targetElCheckLimit = 1000;
    
    (function checkTargetEl(){
      setTimeout(function() {
        var ready = true;

        if(!getById(config.targetEl))
          ready = false;
    
        if(ready){
          render();
        }else if(++targetElCheck < targetElCheckLimit){
          checkTargetEl()
        }else{
          throw new Error("targetEl doesn't exist on page");
        }
      },5);
    })();
  }
}

function onWidgetLoad(data){
  saveProfileLog(config, 'data_returned');

  if(data && data.length){
    config.channel.videos = data;

    if(window.postMessage){
      window.parent.postMessage({
        event: config.events.prefix + ':widget_data_returned'
      }, '*');
    }
    
    config.holder.classList.remove('tvp-hide');
    config.holder.classList.add('tvp-show');
  }
};

//api calls/loading, is here were we call the most important api(s) and it's the start 
//of everything.
function widgetLoad(){
  var videosLoadParams = {
    p: 0,
    n: config.items_per_page,
    o: config.videos_order_by,
    od: config.videos_order_direction,
    'X-login-id': config.loginId
  };

  var channelParams = config.channel.parameters;

  if(channelParams){
    for (var channelParam in channelParams)
      videosLoadParams[channelParam] = channelParams[channelParam];
  }

  loadScript(apiBaseUrl + '/channels/' + config.channelId + '/videos', videosLoadParams, onWidgetLoad);
}

//first thing that is called
widgetRender();
widgetLoad();

//handle the widget events
window.addEventListener("message", function(e){
  e = e || {};

  var event = (e.data || {}).event;

  if(!event)
    return;

  var eventArr = event.split(':');
  var eventName = '';

  if(eventArr[0] === config.events.prefix){
    eventName = eventArr[1];
  }

  if('widget_resize' === eventName){
    onWidgetResize(e);
  }

  if('widget_initialized' === eventName){
    onWidgetInitialized(e);
  }

  if (config.__windowCallbackFunc__)
    config.__windowCallbackFunc__(e);
});

//event handlers
function onWidgetResize(e) {
  widgetHolderResize(e.data.height);
}