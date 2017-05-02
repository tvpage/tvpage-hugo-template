;(function(window, document) {
  
  var jsonpCall = function(src, params, cb){
    var s = document.createElement('script');
    var cbName = 'tvp_' + Math.floor(Math.random()*555);

    window[cbName] = cb;
    src || "";

    var firstParam = true;
    params = params || {};
    for (var p in params) {
      if (firstParam) {
        src += '?';
        firstParam = false;
      } else {
        src += '&';
      }
      src += p + '=' + params[p];
    }

    src += '&callback='+cbName;
    s.src = src;

    document.body.appendChild(s);
  };

  function Grid(el, options) {
    this.options = options || {};
    this.campaign = this.options.campaign || null;
    this.windowSize = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) <= 200 ? 'small' : 'medium';
    this.initialResize = true;
    this.eventPrefix = "tvp_" + (options.id || "").trim().replace(/-/g,'_');
    this.isSmall = this.windowSize == 'small';
    this.page = 0;
    this.isLastPage = false;
    this.itemsPerPage = this.isSmall ? 2 : (options.items_per_page || 6);
    this.itemsPerRow = this.isSmall ? 1 : (options.items_per_row || 2);
    this.loginId = (options.loginId || options.loginid) || 0;
    this.channel = options.channel || {};
    this.channelId = (options.channelid || options.channelId) || null;
    this.loading = false;
    this.el = 'string' === typeof el ? document.getElementById(el) : el;
    this.loadBtn = this.el.querySelector('.tvp-sidebar-load');
    this.container = this.el.querySelector('.tvp-sidebar-container');
    this.sidebarTitle = this.el.querySelector('.tvp-sidebar-title');
    this.onLoad = options.onLoad && Utils.isFunction(options.onLoad) ? options.onLoad : null;
    this.onLoadEnd = options.onLoadEnd && Utils.isFunction(options.onLoadEnd) ? options.onLoadEnd : null;
    this.onItemClick = options.onItemClick && Utils.isFunction(options.onItemClick) ? options.onItemClick : null;

    this.emitMessage = function(data){
      if (!window.parent) return;
      window.parent.postMessage(data || {}, '*');   
    };
    
    this.renderTitle = function(){
      if (options.title_text && options.title_text.trim().length) {
        this.sidebarTitle.innerHTML = options.title_text;
      } else {
        this.sidebarTitle.parentNode.removeChild(this.sidebarTitle);
      }
    };
    
    this.render = function(){
      this.container.innerHTML = '';
      this.renderTitle();

      var all = this.data.slice(0),
          pages = [];
      while (all.length) {
        pages.push(all.splice(0, this.itemsPerPage));
      }
      
      for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        var pageFrag = document.createDocumentFragment();
        
        var pageRows = [];
        while (page.length) {
          pageRows.push(page.splice(0, this.itemsPerRow));
        }
        
        for (var j = 0; pageRows.length > j; j++) {
          
          var rowEl = document.createElement('div');
          rowEl.classList.add('tvp-clearfix');

          var row = pageRows[j];
          for (var k = 0; k < row.length; k++) {
            var item = row[k];
            var itemIsSpot = 'undefined' !== typeof item.entity;
            
            var className = itemIsSpot ? ' tvp-ad' : '';
            if (this.windowSize === 'medium' && this.itemsPerRow > 1) {
              className += ' col-6';
            }
            item.className = className;
            
            if (itemIsSpot) {
              item.entity.title = Utils.trimText(item.entity.title,50);
            } else {
              item.title = Utils.trimText(item.title,50);
            }
            
            rowEl.innerHTML += Utils.tmpl(options.templates[ itemIsSpot ? 'sidebar-item-ad' : 'sidebar-item'], item);
          }

          pageFrag.appendChild(rowEl);
        }

        this.container.appendChild(pageFrag);
        this.emitMessage({
          event: this.eventPrefix + ':render',
          height: this.el.offsetHeight + 'px'
        });
      }
    };

    var that = this;

    this.next = function(){
      if (this.isLastPage) {
        this.page = 0;
        this.isLastPage = false;
      } else {
        this.page++;
      }
    };

    this.resize = function(){
      var newSize = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) <= 200 ? 'small' : 'medium';
      var notify = function(){
        if (that.initialResize) return;
        that.emitMessage({
          event: that.eventPrefix + ':resize',
          height: that.el.offsetHeight + 'px'
        });
      };
      if (that.windowSize !== newSize) {
        that.windowSize = newSize;
        var isSmall = newSize === 'small';
        that.itemsPerPage = isSmall ? 2 : (options.itemsPerPage || 6);
        that.itemsPerRow = isSmall ? 1 : (options.itemsPerRow || 2);
        //reset page to 0 if we detect a resize, so we don't have trouble loading the grid
        that.page = 0;
        that.isLastPage = false;
        
        that.load(function(){
          that.render();
          notify();
        });
      } else {
        notify();
      }
      that.initialResize = false;
    };

    this.el.onclick = function(e) {
      var target = e.target;
      if (!target.classList.contains('tvp-video')) return;

      var id = target.id.split('-').pop(),
          selected = {};

      var data = that.data;
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        if ("undefined" !== typeof item.entity) {
          if (id === item.entity.id) {
            selected = item;
          }
        } else  {
          if (id === item.id) {
            selected = item;
          }
        }
      }

      that.emitMessage({
        runTime: 'undefined' !== typeof window.__TVPage__ ? __TVPage__ : null,
        event: that.eventPrefix + ':video_click',
        selectedVideo: selected,
        videos: data
      });
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

    this.load = function(callback){
      that.loading = true;
      
      if (this.onLoad) {
        this.onLoad();
      }
      
      var endWith = function(data){
        if ( !data.length || (data.length < that.itemsPerPage) ) {
          that.isLastPage = true;
        }
        
        that.data = data;
        callback(data);
        
        that.loading = false;
        if (that.onLoadEnd) {
          that.onLoadEnd();
        }
      };

      var src = this.options.api_base_url + '/channels/' + (that.channel.id || that.channelId) + '/videos';
      var params = that.channel.parameters || {};
      params.p = that.page;
      params.n = that.itemsPerPage;
      params["X-login-id"] = that.loginId;
      
      if (this.campaign && 0 === that.page) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', that.options.videoSpotsEndpoint, true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState == XMLHttpRequest.DONE) {
            var videoSpots = [];
            if (200 === xhr.status && xhr.responseText.length) {
              videoSpots = JSON.parse(xhr.responseText);
            }
            
            var itemsNeeded = params.n - videoSpots.length;
            params.n = itemsNeeded > 0 ? itemsNeeded : 10000;
            
            jsonpCall(src, params, function(channelVideos){
              endWith(videoSpots.concat(channelVideos));
            });
          }
        };
        xhr.send();
      } else {
        jsonpCall(src, params, function(data){
          endWith(data || []);
        });
      }
    };

    //By default at Grid creation we load & render.
    this.load(function(data){
      if (!data.length) return;
      that.render(data);
      that.emitMessage({ event: that.eventPrefix + ':render' });
    });

    window.addEventListener('resize', Utils.debounce(this.resize,100));
  }

  window.Grid = Grid;

}(window, document));