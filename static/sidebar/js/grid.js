;(function(root, doc) {

  var debounce = function(func,wait,immediate) {
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

  function Grid(el, options) {
    this.xchg = options.xchg || true;
    this.windowSize = (window.innerWidth || doc.documentElement.clientWidth || doc.body.clientWidth) <= 200 ? 'small' : 'medium';
    
    var isSmall = this.windowSize == 'small';
    this.itemsPerPage = isSmall ? 2 : options.itemsperpage;
    this.itemsPerRow = isSmall ? 1 : options.itemsperrow;
    this.loginId = options.loginId || '';
    this.channelId = options.channelid || '';
    this.loading = false;
    this.isLastPage = false;
    this.page = 0;
    this.el = 'string' === typeof el ? doc.getElementById(el) : el;
    this.loadBtn = this.el.getElementsByClassName('tvp-sidebar-load')[0];
    this.container = this.el.getElementsByClassName('tvp-sidebar-container')[0];
    
    this.render = function(){
      this.container.innerHTML = '';

      var all = this.data.slice(0),
          pages = [];
      
      while (all.length) {
        pages.push(all.splice(0, this.itemsPerPage));
      }
      
      for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        var pageRows = [];
        while (page.length) {
          pageRows.push(page.splice(0, this.itemsPerRow));
        }

        var pageFrag = doc.createDocumentFragment();
        for (var j = 0; pageRows.length > j; j++) {
          
          var rowEl = doc.createElement('div');
          rowEl.classList.add('tvp-clearfix');

          var row = pageRows[j];
          for (var k = 0; k < row.length; k++) {
            var video = row[k];
            
            var classes = '';
            if ('undefined' !== typeof video.entity) {
              classes += ' tvp-exchange';
            }

            if (that.windowSize === 'medium') {
              classes += ' col-6';
            }

            video.className = classes;
            rowEl.innerHTML += tmpl(doc.getElementById('videoTemplate').innerHTML, video);
          }

          pageFrag.appendChild(rowEl);
        }

        this.container.appendChild(pageFrag);
        this.container.classList.remove('loading');
        this.el.classList.add('first-render');
      }
    };

    var that = this;
    this.load = function(callback){
      that.loading = true;
      that.container.classList.add('loading');

      var getChannelVideos = function(cb){
        var scr = doc.createElement('script'),
        srcUrl = '//api.tvpage.com/v1/channels/' + that.channelId + '/videos?X-login-id=';
        srcUrl += that.loginId + '&callback=tvpcallback&p=' + that.page + '&n=' + that.itemsPerPage;
        scr.src = srcUrl;
        window['tvpcallback'] = cb;
        doc.body.appendChild(scr);
      };

      if (this.xchg) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '//api2.tvpage.com/prod/channels?X-login-id=1', true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState == XMLHttpRequest.DONE) {
            getChannelVideos(function(data){
              var xchg = [];
              if (xhr.status === 200) {
                xchg = xhr.responseText;
                var xchgCount = xchg.length;
                while(xchgCount > 0) {
                  var xchgVideo = xchg[xchgCount-1];
                  xchgVideo = $.extend(xchgVideo, xchgVideo.entity);
                  xchgCount--;
                }
              }
              
              if (!data.length) {
                that.isLastPage = true;
              }

              that.data = data;
              callback($.merge(xchg, data));
              that.loading = false;
            });
          }
        };
        xhr.send({p: 0,n: 1000,si: 1,li: 1,'X-login-id': 1});
      } else {
        getChannelVideos(function(data){
          if ( !data.length || (data.length < that.itemsPerPage) ) {
            that.isLastPage = true;
          }

          that.data = data;
          callback(data);
          that.loading = false;
        });
      }
    };

    this.next = function(){
      if (this.isLastPage) {
        this.page = 0;
        this.isLastPage = false;
      } else {
        this.page++;
      }
    };

    this.resize = function(callback){
      var newSize = (window.innerWidth || doc.documentElement.clientWidth || doc.body.clientWidth) <= 200 ? 'small' : 'medium';
      var end = function(){
        if (!callback || 'function' !== typeof callback) return;
        setTimeout(callback,0);
      };
      if (that.windowSize === newSize) {
        end();
      } else {
        that.windowSize = newSize;
        var isSmall = newSize === 'small';
        that.itemsPerPage = isSmall ? 2 : options.itemsperpage;
        that.itemsPerRow = isSmall ? 1 : options.itemsperrow;
        that.load(function(){
          that.render();
          end();
        });
      }
    };

    this.loadBtn.onclick = function() {
      if (that.loading) return;
      that.next();
      that.load(function(data){
        if (data.length) {
          that.render(data);
        } else {
          that.next();
          that.load(function(nextData){
            that.render(nextData);
          });
        }
      });
    };

    this.load(function(data){
      that.render(data);
    });

  }

  root.Grid = Grid;

}(window, document));