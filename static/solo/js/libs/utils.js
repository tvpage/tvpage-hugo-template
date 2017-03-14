;(function(window, document) {

  function Utils() {

    this.random = function(){
      return 'tvp_' + Math.floor(Math.random() * 50005);
    };

    this.isset = function(o, p) {
      var val = o;
      if (p) val = o[p];
      return 'undefined' !== typeof val;
    };

    this.isEmpty = function(obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) return false;
      }
      return true;
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

    this.assety = function(data, options) {
      var assets = [];
      for (var i = 0; i < data.length; i++) {
        var video = data[i];

        if (this.isEmpty(video)) break;

        var asset = video.asset;
        asset.assetId = video.id;
        asset.assetTitle = video.title;
        asset.loginId = video.loginId;

        if (this.isset(video, 'events') && video.events.length) {
          asset.analyticsLogUrl = video.analytics;
          asset.analyticsObj = video.events[1].data;
        } else {
          asset.analyticsObj = {
            pg: this.isset(video, 'parentId') ? video.parentId : (this.isset(options, 'channel') ? options.channel.id : 0),
            vd: video.id,
            li: video.loginId
          };
        }

        if (!asset.sources) asset.sources = [{
          file: asset.videoId
        }];
        asset.type = asset.type || 'youtube';
        assets.push(asset);
      }
      return assets;
    };

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
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };      
    };
  }
  window.Utils = new Utils();
}(window, document));
