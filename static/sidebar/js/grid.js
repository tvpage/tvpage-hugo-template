;(function(root, doc) {
  
  function connectExchange (page){
    return $.ajax({
      url: "//local.tvpage.com/tvad/adx/spot",
      dataType: 'json',
      xhrFields: {
      },
      data: {
        p:page,
        n: 1,
        si: 1,
        li: 1,
        'X-login-id': 1
      }
    });
  }

  function Grid(el, options) {

    var tmpl = function(template, data) {
      if (template && 'object' == typeof data) {
        return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
          var keys = key.split("."),
            v = data[keys.shift()];
          for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
          return (typeof v !== "undefined" && v !== null) ? v : "";
        });
      }
    };

    this.loading = false;
    this.lastPageReached = false;
    this.page = 0;

    this.el = 'string' === typeof el ? doc.getElementById(el) : el;
    this.loadMoreBtn = this.el.getElementsByClassName('tvp-load-more')[0];
    
    this.render = function(data){
      var raw = data.slice(0),
          rows = [];
          
      while (raw.length) {
        rows.push(raw.splice(0, 2));
      }
      
      var pageFrag = doc.createDocumentFragment();
      for (var i = 0; rows.length > i; i++) {
        var row = rows[i],
            rowEl = doc.createElement('div');

        rowEl.classList.add('tvp-clearfix');
        for (var j = 0; j < row.length; j++) {
          var video = row[j];
          if ('undefined' !== typeof video.entity) {
            video.className = 'tvp-exchange';
          }
          rowEl.innerHTML += tmpl(doc.getElementById('videoTemplate').innerHTML, row[j]);
        }

        pageFrag.appendChild(rowEl);
      }

      var container = this.el.getElementsByClassName('tvp-container')[0];
      container.innerHTML = '';
      container.appendChild(pageFrag);
      this.el.classList.add('first-render');
    };
    
    if('undefined' !== typeof options.initial) {
      this.render(options.initial);
    }
    
    //Events.
    var that = this;
    this.loadMoreBtn.onclick = function() {
      if (that.loading) return;
      that.loading = true;

      if (that.lastPageReached) {
        that.page = 0;
        that.lastPageReached = false;
      } else {
        that.page++;
      }

      var scr = doc.createElement('script'),
        srcUrl = '//api.tvpage.com/v1/channels/' + options.channelid + '/videos?X-login-id=';

      srcUrl += options.loginId + '&callback=tvpcallback&p=' + that.page + '&n=' + options.itemsperpage;
      scr.src = srcUrl;
      
      //Get exchange videos
      connectExchange(that.page).done(function(exchangeVideos){
        window['tvpcallback'] = function(data) {
          that.loading = false;
          if ( !data || !data.length || (data.length < options.itemsperpage) ) {
            that.lastPageReached = true;
          } else {
            var exchangeVideosCount = exchangeVideos.length;

            while(exchangeVideosCount > 0) {
              var xVideo = exchangeVideos[exchangeVideosCount-1];
              xVideo = $.extend(xVideo, xVideo.entity);
              exchangeVideosCount--;
            }
            
            that.render($.merge(exchangeVideos, data));
          }
        };

        doc.body.appendChild(scr);
      });
    }

  }

  root.Grid = Grid;

}(window, document));