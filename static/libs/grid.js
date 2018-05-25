(function() {
  function Grid(el, options, globalConfig) {
    this.options = options || {};
    this.data = this.options.data || [];
    this.config = globalConfig || {};
    this.eventPrefix = globalConfig.events.prefix;
    this.templates = this.options.templates;
    this.channel = this.config.channel || {};
    this.loading = false;
    this.el = 'string' === typeof el ? document.getElementById(el) : el;
    this.loadMoreButton = Utils.getById('load-more');
    this.itemClass = '.sidebar-item';
    this.itemsPerPage = this.config.items_per_page || 6;
    this.itemsPerRow = this.config.items_per_row || 2;
    this.onLoad = Utils.isFunction(options.onLoad) ? options.onLoad : null;
    this.onItemClick = Utils.isFunction(options.onItemClick) ? options.onItemClick : null;
    this.onReadyCalled = false;
    this.page = 0;
    this.isLastPage = false;
  }

  Grid.prototype.parse = function(){
    var dataLength = this.data.length;

    for (var i = 0; i < dataLength; i++){
      if(Utils.isFunction(this.options.parse))
        this.options.parse(this.data[i]);
    }
  };

  Grid.prototype.onReady = function(){
    if(this.onReadyCalled){
      return;
    }

    var onReady = this.options.onReady;
    
    if(Utils.isFunction(onReady)){
      onReady();
    }

    //update the load btn
    if(this.data.length >= this.itemsPerPage){
      Utils.addClass(this.loadMoreButton, 'ready');

      this.handleLoadMoreClick();
    }else{
      Utils.remove(this.loadMoreButton);
    }

    this.onReadyCalled = true;
  };

  Grid.prototype.render = function(){
    var all = this.data;
    var allLength = all.length;

    //if no data to render
    if(!allLength){
      return;
    }

    this.parse();

    var pages = Utils.rowerize(all, this.itemsPerPage);
    var pagesLength = pages.length;

    function renderPageRows(pageRows){
      var html = '<div class="row mt-2">';
      var pageRowsLength = pageRows.length;

      for (var i = 0; i < pageRowsLength; i++) {
        html += Utils.tmpl(this.templates.item, pageRows[i]);
      }

      html += '</div>';

      return html;
    }

    function renderPages(){
      var html = '';

      for (var i = 0; i < pagesLength; i++) {
        var page = pages[i];
        var pageRows = Utils.rowerize(page, this.itemsPerRow);
        var pageRowsLength = pageRows.length;

        for (var j = 0; j < pageRowsLength; j++) {
          html += renderPageRows.call(this, pageRows[j]);
        }  
      }

      return html;
    }

    this.el.innerHTML = Utils.tmpl(this.templates.list, this.config);

    var containerEl = this.el.querySelector('#sidebar-container');
    containerEl.innerHTML = renderPages.call(this);

    this.onReady();
    this.handleClick();
  };

  Grid.prototype.load = function(callback){
    this.loading = true;

    var that = this;

    Utils.loadScript({
      base: this.config.api_base_url + '/channels/' + this.config.channelId + '/videos',
      params: Utils.extend(this.channel.parameters || {}, {
        'X-login-id': this.config.loginId,
        p: this.page,
        n: this.itemsPerPage,
        o: this.config.videos_order_by,
        od: this.config.videos_order_direction,
        callback: 'tvpcallback'
      })
    },function(data){
      if(that.onLoad){
        that.onLoad(data);
      }

      if(!data.length || (data.length < that.itemsPerPage)) {
        that.isLastPage = true;
      }

      that.loading = false;

      that.data = data;

      callback(data);
    });
  };

  Grid.prototype.next = function(){
    if (this.isLastPage) {
      this.page = 0;
      this.isLastPage = false;
    } else {
      this.page++;
    }
  };

  Grid.prototype.handleClick = function(){
    var defaultStop = this.options.clickDefaultStop;
    var optOnClick = this.options.onClick;
    var onClick = Utils.isFunction(optOnClick) ? optOnClick : function(e){
      if(defaultStop){
        Utils.stopEvent(e);
      }
    };

    var items = this.el.querySelectorAll(this.itemClass);
    var itemsLength = items.length;

    for (var i = 0; i < itemsLength; i++) {
      items[i].removeEventListener('click', onClick, false);
      items[i].addEventListener('click', onClick, false);
    }
  };

  Grid.prototype.handleLoadMoreClick = function(){
    var that = this;

    function loadMoreClick(){
      if (that.loading)
        return;

      that.next();

      that.load(function(data){
        if (data.length) {
          that.render(data);
        } else {
          //whatt?
          that.next();

          that.load(function(nextData){
            that.render(nextData);
          });
        }
      });
    }

    this.loadMoreButton.removeEventListener('click', loadMoreClick, false);
    this.loadMoreButton.addEventListener('click', loadMoreClick, false);
  };

  Grid.prototype.initialize = function(){
  };

  window.Grid = Grid;
}());