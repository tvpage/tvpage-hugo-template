(function(){
  function Rail(sel, options, globalConfig){
    this.options = options || {};    
    this.data = this.options.data || [];
    this.templates = this.options.templates;
    this.config = globalConfig || {};
    this.endpoint = this.options.endpoint;
    this.itemClass = '.rail-item';
    this.el = document.getElementById(sel);
    this.railEl;
    this.itemsPerPage = 1;
    this.itemsPerRow = 1;
  }

  Rail.prototype.parse = function(){
    var dataLength = this.data.length;

    for (var i = 0; i < dataLength; i++){
      if(Utils.isFunction(this.options.parse))
        this.options.parse(this.data[i]);
    }
  };

  Rail.prototype.getDataItemById = function(id){
    var itemsLength = this.data.length;

    for (var i = 0; i < itemsLength; i++) {
      var item = this.data[i];
      
      if (item.id === id)
        return item;
    }
  };

  Rail.prototype.handleLeave = function(){
    var defaultStop = this.options.leaveDefaultStop;
    var optOnLeave = this.options.onLeave;
    var onLeave = Utils.isFunction(optOnLeave) ? optOnLeave : function(e){
      if(defaultStop){
        Utils.stopEvent(e);
      }
    };

    this.el.removeEventListener('mouseleave', onLeave, false);
    this.el.addEventListener('mouseleave', onLeave, false);
  };

  Rail.prototype.handleItemOver = function(){
    var defaultStop = this.options.itemOverDefaultStop;
    var optOnItemOver = this.options.onItemOver;
    var onItemOver = Utils.isFunction(optOnItemOver) ? optOnItemOver : function(e){
      if(defaultStop){
        Utils.stopEvent(e);
      }
    };

    var items = this.el.querySelectorAll(this.itemClass);
    var itemsLength = items.length;

    for (var i = 0; i < itemsLength; i++) {
      items[i].removeEventListener('mouseover', onItemOver, false);
      items[i].addEventListener('mouseover', onItemOver, false);
    }
  };

  Rail.prototype.onReady = function(){
    var onReady = this.options.onReady;
    
    if(Utils.isFunction(onReady)){
      onReady();
    }

    this.handleItemOver();
    this.handleLeave();
  };

  Rail.prototype.clean = function(){
    if(this.ps){
      this.ps.destroy();
      this.ps = null;  
    }

    this.el.innerHTML = "";
  };

  Rail.prototype.render = function(){
    var all = this.data;
    var allLength = all.length;

    //if no data to render
    if(!allLength && this.options.clean){
      this.clean();

      var onNoData = this.options.onNoData;

      if(Utils.isFunction(onNoData)){
        onNoData();
      }

      return;
    }

    this.parse();

    var moreThan2 = allLength > 2;
    var pages = Utils.rowerize(all, this.itemsPerPage);
    var pagesLength = pages.length;

    function renderPageRows(pageRows){
      var html = '<div class="row">';
      var pageRowsLength = pageRows.length;
      var i;

      for (i = 0; i < pageRowsLength; i++) {
        html += Utils.tmpl(this.templates.item, pageRows[i]);
      }

      html += '</div>';

      return html;
    }

    function renderPages(){
      var html = '';
      var i;
      var j;

      for (i = 0; i < pagesLength; i++) {
        var page = pages[i];
        var pageRows = Utils.rowerize(page, this.itemsPerRow);
        var pageRowsLength = pageRows.length;

        for (j = 0; j < pageRowsLength; j++) {
          html += renderPageRows.call(this, pageRows[j]);
        }
      }

      return html;
    }
   
    //the actual rail element, the one powered by PS
    function renderRailEl(height, html){
      var railEl = Utils.createEl('div');

      railEl.style.height = height + 'px';
      railEl.className = 'rail pr-3 relative';
      railEl.innerHTML = html;

      var allRailItems = railEl.querySelectorAll('.rail-item');
      
      if(allRailItems && allRailItems.length){
        Utils.removeClass(allRailItems[allRailItems.length-1], 'mb-2');
      }

      return railEl;
    }

    //the actual rail element, the one powered by PS
    function renderRailElHolder(){
      var railElHolderEl = Utils.createEl('div');

      railElHolderEl.className = 'o-hidden relative'; 

      return railElHolderEl;
    }

    if(moreThan2){
      var snapReferenceHeight = document.querySelector(this.options.snapReference).offsetHeight;
      var snapReferenceHeightCheck = 0;
      var snapReferenceHeightCheckLimit = 1000;
      var that = this;

      (function getReferenceHeight(currentParent){
        setTimeout(function() {
          if(snapReferenceHeight > 0){
            var railEl = renderRailEl(snapReferenceHeight, renderPages.call(that));

            that.railEl = railEl;

            var railElHolderEl = renderRailElHolder();
            railElHolderEl.appendChild(railEl);

            that.clean();

            that.el.appendChild(railElHolderEl);

            that.ps = Ps.initialize(railEl, {
              suppressScrollX: true,
              wheelSpeed: 2,
              wheelPropagation: true,
              minScrollbarLength: 20              
            });

            that.onReady();

            return;//important to stop here.
          }else if(++snapReferenceHeightCheck < snapReferenceHeightCheckLimit){
            getReferenceHeight();
          }
        },10);
      })();
    }else{
      var railEl = renderRailEl('auto', renderPages.call(this));
      
      this.railEl = railEl;
      
      var railElHolderEl = renderRailElHolder();
      railElHolderEl.appendChild(railEl);
      
      this.clean();
      
      this.el.appendChild(railElHolderEl);

      this.onReady();
    }
  };

  Rail.prototype.init = function(){
  };

  Rail.prototype.onLoad = function(data){
    this.loading = false;

    this.data = data;

    var onLoad = this.options.onLoad;
    if(Utils.isFunction(onLoad))
      onLoad(data);
  };

  Rail.prototype.load = function(action, callback){
    this.loading = true;

    var that = this;

    Utils.loadScript({
      base: this.endpoint,
      params: {
        'X-login-id': this.config.loginId,
        
        //BAD this should be passed as a setting
        // o: this.config.products_order_by,
        // od: this.config.products_order_direction,

        callback: 'tvpcallback'
      }
    },function(data){
      that.loading = false;

      if(that.onLoad){
        that.onLoad(data);
      }

      if(Utils.isFunction(that[action])){
        that[action]();
      }
      
      that.data = data;

      if(Utils.isFunction(callback)){
        callback(data);
      }
    });
  };
  
  window.Rail = Rail;
}())