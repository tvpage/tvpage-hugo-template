;(function(window,document) {

  function Utils() {
    var _this = this;

    this.debounce = function(func,wait,immediate){
      var timeout;  
      return function() {
        var context = this,
        args = arguments,
        later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        },
        callNow = immediate && !timeout;
        if(timeout){
          clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };      
    };


    this.formatDuration = function(secs) {
      if ("undefined" === typeof secs) return;
      var date = new Date(0, 0, 0);
      date.setSeconds(Number(secs));
      var hour = (date.getHours() ? date.getHours() : ''),
          minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(),
          seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
      return (hour + minutes + ':' + seconds);
    };

    this.getByClass = function(c){
      return document.getElementsByClassName(c || '')[0];
    };

    this.hasClass = function(obj,arr) {
        if (!obj || !arr || !arr.length) return;
        var has = false;
        for (var i = 0; i < arr.length; i++) {
          if(has) break;
          has = obj.classList.contains(arr[i]);
        }
        return has;
    };


    this.addEvent = function(element, event, arr, func) {
      element.removeEventListener(event, clickHandler, false);
      element.addEventListener(event, clickHandler, false);
      function clickHandler(e){
        var that = this;
        var type;
        var checkEl = function (el) {
          if (el && el !== that) {
            for (var i = 0; i < arr.length; i++) {
              if (el.classList.contains(arr[i])) {
                type = arr[i]
                return el;
              }
            }
            return checkEl(el.parentNode);
          }
          return false;
        }
        var el = checkEl(e.target);
        if (el !== false) {
          func.call(this, type, el, e);
        }
      }
    };


    this.getSettings = function(){
      var getConfig = function(g){
        if (_this.isset(g) && _this.isset(g,'__TVPage__') && _this.isset(g.__TVPage__, 'config')) {
          return g.__TVPage__.config;
        } else {
          return;
        }
      };
      var config = getConfig(parent);
      var id = document.body.getAttribute('data-id');
      if (!_this.isset(config, id)) return;
      var settings = config[id];
      settings.name = id;
      return settings;
    };

    this.jsonpCall = function(opts,callback){
        var script = document.createElement('script');
        script.src = opts.src;
        if (!callback || 'function' !== typeof callback) return;
        window[opts.cbName || 'callback'] = callback;
        var b = opts.body || document.body;
        b.appendChild(script);
    };

    this.random = function(){
      return 'tvp_' + Math.floor(Math.random() * 50005);
    };

    this.removeExisting = function(doc, el){
      var existing = doc.getElementsByClassName(el)[0];
      if (existing) existing.parentElement.removeChild(existing);
    };

    this.render = function(idEl,target){
      if (!idEl || !target) return;
      var frag = document.createDocumentFragment(),
          main = document.createElement('div');

      main.classList.add('tvp-player');
      main.innerHTML =  '<div id="tvp-player-el-'+idEl+'" class="tvp-player-el"></div></div>';
      frag.appendChild(main);
      target.appendChild(frag);
    };

    this.isFunction = function(obj){
        return 'undefined' !== typeof obj;
    };

    this.isset = function(o,p){
      if (!arguments.length) return;
      var val = o;
      if (p) val = o[p];
      return 'undefined' !== typeof val;
    };

    this.loadData = function(settings,cbName,callback){
     return _this.jsonpCall({
        src: function(){
          var channel = settings.channel || {},
              params = channel.parameters || {},
              url = settings.api_base_url + '/channels/' + (channel.id || (settings.channelid || settings.channelId)) + '/videos?X-login-id=' + (settings.loginid || settings.loginId);

          for (var p in params) {
            if(params.hasOwnProperty(p)){
              url += '&' + p + '=' + params[p];
            }
          }
          url += '&n=' + (_this.isset(settings,'items_per_page') ? settings.items_per_page : 6) + '&p=' + (_this.isset(settings,'channelVideosPage') ? settings.channelVideosPage : 0);
          url += '&callback=' + cbName;
          return url;
        }(),
        cbName: cbName
      },callback);
    };

    this.tmpl = function(template, data) {
      if (!template && 'object' !== typeof data) return;
      return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
        var keys = key.split("."),
          v = data[keys.shift()];
        for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
        return (typeof v !== "undefined" && v !== null) ? v : "";
      });
    };

    this.trimText = function(text, limit) {
      var t = text || '';
      var l = limit ? Number(limit) : 0;
      if (text.length > l) {
        t = t.substring(0, Number(l)) + '...';
      }
      return t;
    };
  }

  window.Utils = new Utils();

}(window, document));