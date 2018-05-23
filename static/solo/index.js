//we add the preconnect hints as soon as we can
(function addHTMLHints(){
  var domains = [
    config.api_base_url,
    config.baseUrl
  ];
  var domainsLength = domains.length;

  for (var i = 0; i < domainsLength; i++) {
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

function isEvent(e){
  return e && e.data && e.data.event;
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

function loadScript(options, cback){
  var opts = options || {};
  var script = createEl('script');
  var params = opts.params || {};
  var c = 0;
  var src = opts.base || '';

  for (var param in params) {
    src += (c > 0 ? '&' : '?') + param + '=' + params[param];
    ++c;
  }

  var cName = 'tvp_callback_' + Math.random().toString(36).substring(7);

  window[cName] = function(data){
    if('function' === typeof cback)
      cback(data);
  };

  script.src = src + '&callback=' + cName;

  document.body.appendChild(script);
}

//builds the document html for an iframe.
function getIframeHtml(o){
  function load(arr, type){
    arr = arr.filter(Boolean);

    var ret = '';
    var arrLength = arr.length;

    for (var i = 0; i < arrLength; i++){
      ret += 'append' + type + '(\'' + arr[i] + '\');';
    }

    return ret;
  };

  var html = config.templates.iframeContent.trim();

  html += '<div id="bscheck" class="invisible"></div>';

  if(o.style){
    html += '<style>' + o.style + '</style>';
  }

  html += o.html || '';

  o.context.onload = '' +
  'var d=document,' +
  '    h=d.head;' +

  'function appendScript(u){'+
  '  var s=d.createElement(\'script\');' +
  '  s.src=u;'+
  '  h.appendChild(s);' +
  '}' +

  'function appendLink(u){'+
  '  var l=d.createElement(\'link\');'+
  '  l.rel=\'stylesheet\';'+
  '  l.href=u;'+
  '  h.appendChild(l);' +
  '};' +
  load(o.js, 'Script') +
  load(o.css, 'Link');

  return tmpl(html, o.context);
};

//we have a generic host css per widget type that we only include once.
function getInitialHtml(){
  var html = "";
  var styleId = 'tvp-' + config.type + '-host';
  var css = config.css;
  var hostStyles = isMobile && css.mobile ? css.mobile.host : css.host;
  var templates = isMobile ? config.mobile.templates : config.templates;

  if(!getById(styleId)){
    html += '<style id="' + styleId + '">' + hostStyles + '</style>';
  }

  html += tmpl('<div id="{id}-holder" class="tvp-{type}-holder">' + templates.iframe + '</div>', config);

  return html;
}

//build the player url
function getPlayerUrl(){
  var playerUrl = config.player_url;

  playerUrl = playerUrl ? playerUrl.trim() : 'https://cdnjs.tvpage.com/tvplayer/tvp-' + config.player_version + '.min.js';

  return playerUrl;
}

//here's the first HTML write we do to the host page, this is the fastest way to do it
//refer to https://jsperf.com/insertadjacenthtml-perf/3
function widgetRender(){
  function render(){
    var targetEl = getById(config.targetEl);
    targetEl.insertAdjacentHTML('beforebegin',getInitialHtml());

    remove(targetEl);

    config.holder = getById(config.id + "-holder");

    var debug = config.debug;
    var baseUrl = config.baseUrl;
    var jsPath = config.paths.javascript;
    var templates = isMobile ? config.mobile.templates : config.templates;
    var libsPath = baseUrl + '/libs';
    var cssPath = config.paths.css
    var iframe = config.holder.querySelector("iframe");
    var iframeDocument = iframe.contentWindow.document;

    iframeDocument.open().write(getIframeHtml({
      id: config.id,
      domain: baseUrl,
      context: config,
      html: templates.base,
      style: config.css.base,
      className: isMobile ? 'mobile' : '',
      js: [
        '//www.youtube.com/iframe_api',
        '//a.tvpage.com/tvpa.min.js',
        '//imasdk.googleapis.com/js/sdkloader/ima3.js',
        "//cdnjs.tvpage.com/tvplayer/local/tvp-3.1.6.1.min.js",
        //getPlayerUrl(),
        debug ? jsPath + "/vendor/perfect-scrollbar.min.js" : "",
        debug ? libsPath + "/analytics.js" : "",
        debug ? libsPath + "/player.js" : "",
        debug ? jsPath + "/menu.js" : "",
        debug ? jsPath + "/index.js" : "",
        debug ? "" : jsPath + "/scripts.min.js"
      ],
      css: [
        debug ? cssPath + "/styles.css" : "",
        debug ? cssPath + "/vendor/perfect-scrollbar.min.css" : "",
        debug ? "" : cssPath + "/styles.min.css"
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

    widgetRender();
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
    'X-login-id': "1759121",
    //'X-login-id': config.loginId
  };

  var channelParams = config.channel.parameters;

  if(channelParams){
    for (var channelParam in channelParams)
      videosLoadParams[channelParam] = channelParams[channelParam];
  }

  loadScript({
    //base: config.api_base_url + '/channels/' + config.channelId + '/videos',
    base: config.api_base_url + '/channels/155524389/videos',
    params: videosLoadParams
  }, onWidgetLoad);
}

widgetLoad();

//handle the widget events
window.addEventListener("message", function(e){
  if(!isEvent(e)){
    return;
  }

  var eventName = '';
  var eventArr = e.data.event.split(':');

  if(eventArr && eventArr.length && eventArr[0] === config.events.prefix){
    eventName = eventArr[1];
  }

  if('widget_resize' === eventName){
    onWidgetResize(e);
  }

  if (config.__windowCallbackFunc__)
    config.__windowCallbackFunc__(e);
});

//event handlers
function onWidgetResize(e) {
  config.holder.style.height = e.data.height + 'px';
}