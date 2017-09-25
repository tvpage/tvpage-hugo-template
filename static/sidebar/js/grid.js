(function() {

  var body = document.body;
  var getWindowSize = function() {
    return (window.innerWidth || document.documentElement.clientWidth || body.clientWidth) <= 200 ? 'small' : 'medium';
  };

  var Grid = function (el, options) {
    this.options = options || {};
    this.windowSize = getWindowSize();
    this.initialResize = true;
    this.eventPrefix = "tvp_" + (options.id || "").trim().replace(/-/g,'_');
    this.itemsPerPage = this.windowSize === 'small' ? 2 : (options.items_per_page || 6);
    this.itemsPerRow = this.windowSize === 'small' ? 1 : (options.items_per_row || 2);
    this.loginId = (options.loginId || options.loginid) || 0;
    this.channel = options.channel || {};
    this.channelId = (options.channelid || options.channelId) || null;
    this.loading = false;
    this.isLastPage = false;
    this.page = 0;
    this.el = 'string' === typeof el ? document.getElementById(el) : el;
    this.loadBtn = this.el.querySelector('.tvp-sidebar-load');
    this.container = this.el.querySelector('.tvp-sidebar-container');
    this.titleEl = this.el.querySelector('.tvp-sidebar-title');
    this.onLoad = Utils.isFunction(options.onLoad) ? options.onLoad : null;
    this.onLoadEnd = Utils.isFunction(options.onLoadEnd) ? options.onLoadEnd : null;
    this.onItemClick = Utils.isFunction(options.onItemClick) ? options.onItemClick : null;
  }

  Grid.prototype.renderTitle = function(){
    var titleText = this.options.title_text;
    if (titleText.trim().length) {
      this.titleEl.innerHTML = titleText;
    } else {
      this.titleEl.parentNode.removeChild(this.titleEl);
    }
  };

  Grid.prototype.renderItem = function(item){
    var className = '';
    if (this.windowSize === 'medium' && this.itemsPerRow > 1) {
      className += ' col-6';
    }

    item.className = className;
    item.title = Utils.trimText(item.title,50);

    return Utils.tmpl(this.options.templates['sidebar-item'], item);
  };

  Grid.prototype.render = function(){
    this.renderTitle();

    var all = this.data.slice(0);
    var pages = [];

    while (all.length) {
      pages.push(all.splice(0, this.itemsPerPage));
    }
    
    for (var i = 0; i < pages.length; i++) {
      var page = pages[i];
      var pageRows = [];
      var pageFrag = document.createDocumentFragment();

      while (page.length) {
        pageRows.push(page.splice(0, this.itemsPerRow));
      }

      for (var j = 0; pageRows.length > j; j++) {
        
        var rowEl = document.createElement('div');
        rowEl.className = 'tvp-clearfix';

        var row = pageRows[j];
        for (var k = 0; k < row.length; k++) {
          rowEl.innerHTML += this.renderItem(row[k]);
        }

        pageFrag.appendChild(rowEl);
      }

      this.container.innerHTML = '';
      this.container.appendChild(pageFrag);

      Utils.sendMessage({
        event: this.eventPrefix + ':render',
        height: this.el.offsetHeight + 'px'
      });
    }
  };

  Grid.prototype.load = function(callback){
    this.loading = true;
    if (this.onLoad) {
      this.onLoad();
    }

    var channel = this.channel || {};
    var params = channel.parameters || {};
    params.o = this.options.videos_order_by;
    params.od = this.options.videos_order_direction;

    var src = this.options.api_base_url + '/channels/' + (channel.id || this.channelId) + '/videos?X-login-id=' + this.loginId;
    for (var p in params) {
      src += '&' + p + '=' + params[p];
    }
    var cbName = this.options.callbackName || 'tvp_' + Math.floor(Math.random() * 555);
    src += '&p=' + this.page + '&n=' + this.itemsPerPage + '&callback='+cbName;
    var script = document.createElement('script');
    script.src = src;
    
    var that = this;
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
    body.appendChild(script);
  };

  Grid.prototype.next = function(){
    if (this.isLastPage) {
      this.page = 0;
      this.isLastPage = false;
    } else {
      this.page++;
    }
  };

  Grid.prototype.resize = function(){
    var that = this;
    var notify = function(){
      if (!that.initialResize){
        Utils.sendMessage({
          event: that.eventPrefix + ':resize',
          height: that.el.offsetHeight + 'px'
        });
      }
    };

    var newSize = getWindowSize();

    if (this.windowSize !== newSize) {
      this.windowSize = newSize;
      this.itemsPerPage = newSize === 'small' ? 2 : (options.itemsPerPage || 6);
      this.itemsPerRow = newSize === 'small' ? 1 : (options.itemsPerRow || 2);
      this.page = 0;
      this.isLastPage = false;

      this.load(function(){
        that.render();
        notify();
      });
    } else {
      notify();
    }

    this.initialResize = false;
  };

  Grid.prototype.initialize = function(){
    var that = this;

    this.el.onclick = function(e) {
      var target = e.target;
      if (!Utils.hasClass(target,'tvp-video'))
        return;

      var id = target.id.split('-').pop();
      var selected = {};
      var data = that.data;

      for (var i = 0; i < data.length; i++) {
        if (data[i].id === id)
          selected = data[i];
      }
      
      Utils.sendMessage({
        runTime: 'undefined' !== typeof window.__TVPage__ ? __TVPage__ : null,
        event: that.eventPrefix + ':video_click',
        selectedVideo: selected,
        videos: data
      });
    };

    this.loadBtn.onclick = function() {
      if (that.loading)
        return;

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
      if (data.length) {
        that.render(data);
        Utils.sendMessage({
          event: that.eventPrefix + ':render'
        });
      }
    });

    window.addEventListener('resize', function(){
      Utils.debounce(that.resize,100)
    });
  };

  window.Grid = Grid;

}());