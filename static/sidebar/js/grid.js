;(function(window, document) {

  var isFunction = function(obj) {
    return 'function' === typeof obj;
  };


  function Grid(el, options) {
    this.windowSize = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) <= 200 ? 'small' : 'medium';
    this.initialResize = true;
    this.eventPrefix = "tvp_" + (options.id || "").trim().replace(/-/g,'_');
    
    var isSmall = this.windowSize == 'small';
    this.itemsPerPage = isSmall ? 2 : (options.items_per_page || 6);
    this.itemsPerRow = isSmall ? 1 : (options.items_per_row || 2);
    this.loginId = (options.loginId || options.loginid) || 0;
    this.channel = options.channel || {};
    this.channelId = (options.channelid || options.channelId) || null;
    this.loading = false;
    this.isLastPage = false;
    this.page = 0;

    this.el = 'string' === typeof el ? document.getElementById(el) : el;
    this.loadBtn = this.el.querySelector('.tvp-sidebar-load');
    this.container = this.el.querySelector('.tvp-sidebar-container');
    this.sidebarTitle = this.el.querySelector('.tvp-sidebar-title');
    this.onLoad = options.onLoad && isFunction(options.onLoad) ? options.onLoad : null;
    this.onLoadEnd = options.onLoadEnd && isFunction(options.onLoadEnd) ? options.onLoadEnd : null;
    this.onItemClick = options.onItemClick && isFunction(options.onItemClick) ? options.onItemClick : null;
    
    this.render = function(){
      this.container.innerHTML = '';

      this.sidebarTitle.innerHTML = options.title_text;

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

        var pageFrag = document.createDocumentFragment();
        for (var j = 0; pageRows.length > j; j++) {
          
          var rowEl = document.createElement('div');
          rowEl.classList.add('tvp-clearfix');

          var row = pageRows[j];
          for (var k = 0; k < row.length; k++) {
            var item = row[k];
            var className = '';

            if ('undefined' !== typeof item.entity) {
              className += ' tvp-exchange';
            }

            if (that.windowSize === 'medium' && this.itemsPerRow > 1) {
              className += ' col-6';
            }

            item.className = className;

            var template = options.templates['sidebar-item'];

            item.title = Utils.trimText(item.title,50);
            rowEl.innerHTML += Utils.tmpl(template, item);
          }

          pageFrag.appendChild(rowEl);
        }

        this.container.appendChild(pageFrag);
        if (window.parent) {
          window.parent.postMessage({
            event: this.eventPrefix + ':render',
            height: this.el.offsetHeight + 'px'
          }, '*');
        }
      }
    };

    var that = this;
    this.load = function(callback){
      that.loading = true;
      if (this.onLoad) {
        this.onLoad();
      }

      var channel = that.channel || {};
      var params = channel.parameters || {};
      var src = '//api.tvpage.com/v1/channels/' + (channel.id || that.channelId) + '/videos?X-login-id=' + that.loginId;
      for (var p in params) {
        src += '&' + p + '=' + params[p];
      }
      var cbName = options.callbackName || 'tvp_' + Math.floor(Math.random() * 555);
      src += '&p=' + that.page + '&n=' + that.itemsPerPage + '&callback='+cbName;
      var script = document.createElement('script');
      script.src = src;
      window[cbName || 'callback'] = function(data){
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
      document.body.appendChild(script);
    };

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
        if (window.parent) {
          window.parent.postMessage({
            event: that.eventPrefix + ':resize',
            height: that.el.offsetHeight + 'px'
          }, '*');
        }
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
        if (data[i].id === id) {
          selected = data[i];
        }
      }

      if (window.parent) {
        window.parent.postMessage({
          runTime: 'undefined' !== typeof window.__TVPage__ ? __TVPage__ : null,
          event: that.eventPrefix + ':video_click',
          selectedVideo: selected,
          videos: data
        }, '*');
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

    //By default at Grid creation we load & render.
    this.load(function(data){
      that.render(data);
    });

    window.addEventListener('resize', Utils.debounce(this.resize,100));
  }

  window.Grid = Grid;

}(window, document));