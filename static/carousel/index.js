var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
var templates = isMobile ? config.templates.mobile : config.templates;
var apiBaseUrl = config.api_base_url;
var baseUrl = config.baseUrl;
var debug = config.debug;
var widgetId = config.id;
var eventsPrefix = config.events.prefix;
var holderEl;

//we add the preconnect hints as soon as we can
(function(urls){
  var urlsLength = urls.length;  
  var i;
  
  for (i = 0; i < urlsLength; i++) {
    var link = document.createElement('link');
  
    link.rel = 'preconnect';
    link.href = urls[i];
  
    document.head.appendChild(link);
  }
}([
  apiBaseUrl,
  baseUrl
]))

//helpers
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

  var callbackName = 'tvp_callback_' + config.runId;

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

  o.context.className = isMobile ? 'mobile widget-body' : 'widget-body';

  o.context.onload = '' +
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
function getFirstHTML(){
  var styleId = 'tvp-' + config.type + '-host';
  var css = config.css;
  var hostStyles = isMobile && css.mobile ? css.mobile.host : css.host;

  return (getById(styleId) ? '' : '<style id="' + styleId + '">' + hostStyles + '</style>') + 
  tmpl(templates.holder, {
    iframe: templates.iframe
  });
}

function widgetHolderResize(height){
  holderEl.style.height = height + 'px';
}

function widgetModalRender(){
  var modalTargetEl = createEl('div');
  modalTargetEl.id = widgetId + '-modal-target';
  
  var modalAppendToEl = document.body;

  if(config.modalAppendTo){
    modalAppendToEl = document.querySelector(config.modalAppendTo);
  }
  
  modalAppendToEl.appendChild(modalTargetEl);
  
  modalTargetEl.insertAdjacentHTML('beforebegin', templates.modal.iframe);
  
  remove(modalTargetEl);
  
  iframeModal = getById('tvp-' + widgetId + '-modal-iframe');

  if(config.modalPosition){
    iframeModal.style.position = config.modalPosition;
  }
  
  var iframeModalDocument = iframeModal.contentWindow.document;
  var iframeModalFiles = debug ? config.files.modal.debug : config.files.modal;
  
  iframeModalDocument.open().write(getIframeHtml({
    context: config,
    html: templates.modal.base,
    style: 'body{background:none transparent}' + config.css.custom,
    js: iframeModalFiles.javascript,
    css: iframeModalFiles.css
  }));
  
  iframeModalDocument.close();
}

//here's the first HTML write we do to the host page, this is the fastest way to do it
//refer to https://jsperf.com/insertadjacenthtml-perf/3
function widgetRender(){
  function render(){
    var targetEl = getById(config.targetEl);

    if(targetEl){
      targetEl.insertAdjacentHTML('beforebegin', getFirstHTML());  
      
      remove(targetEl);

      holderEl = getById(widgetId + '-holder');
    }else{
      throw new Error('missing target element');
    }

    var iframeDocument = holderEl.querySelector('iframe').contentWindow.document;
    var iframeFiles = debug ? config.files.debug : config.files;

    iframeDocument.open().write(getIframeHtml({
      context: config,
      html: templates.base,
      style: config.css.base + config.css.custom,
      js: iframeFiles.javascript,
      css: iframeFiles.css
    }));
  
    iframeDocument.close();
    
    saveProfileLog(config, 'widget_rendered');
  }

  //we will poll if the target element is not in the page immediately, this is required to cover
  //scenarios where customer add this element lazily.
  if(getById(config.targetEl)){
    render();
  }else{
    var targetElCheckCounter = 0;
    
    (function checkTargetEl(){
      setTimeout(function() {
        var ready = true;

        if(!getById(config.targetEl))
          ready = false;
    
        if(ready){
          render();
        }else if(++targetElCheckCounter < 1000){
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
    
    holderEl.classList.remove('tvp-hide');
    holderEl.classList.add('tvp-show');
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
  var channelParam;

  if(channelParams){
    for (channelParam in channelParams)
      videosLoadParams[channelParam] = channelParams[channelParam];
  }

  loadScript(
    apiBaseUrl + '/channels/' + config.channelId + '/videos', 
    videosLoadParams, 
    onWidgetLoad
  );
}

//handle the widget events
window.addEventListener("message", function(e){
  var event = ((e || {}).data || {}).event;
  var events = config.events;
  
  if(!event)
    return;

  if(events.resize === event){
    onWidgetResize(e);
  }

  if(events.initialized === event){
    onWidgetInitialized(e);
  }

  if(events.modal.open === event){
    onWidgetModalOpen(e);
  }

  if(events.modal.close === event){
    onWidgetModalClose(e);
  }

  if (config.__windowCallbackFunc__)
    config.__windowCallbackFunc__(e);
});

//event handlers
function onWidgetResize(e) {
  widgetHolderResize(e.data.height);
}

var iframeModal;

function onWidgetModalOpen(e){
  iframeModal.classList.add('tvp-show');
}

function onWidgetModalClose(e){
  iframeModal.classList.remove('tvp-show');
}

//entry point
widgetRender();
widgetLoad();

//modal stuff
widgetModalRender();