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

  Rail.prototype.handleHover = function(){
    var defaultStop = this.options.overDefaultStop;
    var optOnOver = this.options.onOver;
    var onOver = Utils.isFunction(optOnOver) ? optOnOver : function(e){
      if(defaultStop){
        Utils.stopEvent(e);
      }
    };

    var items = this.el.querySelectorAll(this.itemClass);
    var itemsLength = items.length;

    for (var i = 0; i < itemsLength; i++) {
      items[i].removeEventListener('mouseover', onOver, false);
      items[i].addEventListener('mouseover', onOver, false);
    }    
  };

  Rail.prototype.onReady = function(){
    var onReady = this.options.onReady;
    
    if(Utils.isFunction(onReady)){
      onReady();
    }

    this.handleHover();
  };

  Rail.prototype.render = function(){
    var all = this.data;
    var allLength = all.length;

    //if no data to render
    if(!allLength){
      return;
    }

    this.parse();

    var moreThan2 = allLength > 2;
    var pages = Utils.rowerize(all, this.itemsPerPage);
    var pagesLength = pages.length;

    function renderPageRows(pageRows){
      var html = '<div class="row">';
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

    if(moreThan2){
      var snapReferenceHeight = document.querySelector(this.options.snapReference).offsetHeight;
      var snapReferenceHeightCheck = 0;
      var snapReferenceHeightCheckLimit = 1000;
      var that = this;

      (function getReferenceHeight(currentParent){
        setTimeout(function() {

          if(snapReferenceHeight > 0){
            //the actual rail element, the one powered by PS
            var productRailEl = Utils.createEl('div');
            productRailEl.style.height = snapReferenceHeight + 'px';
            productRailEl.className = 'rail';   
            productRailEl.innerHTML = renderPages.call(that);

            //we need this holder to wrap/hide PS scrollbars
            var productRailElHolderEl = Utils.createEl('div');
            productRailElHolderEl.style.position = 'relative';
            productRailElHolderEl.className = 'o-hidden';
            productRailElHolderEl.appendChild(productRailEl);
            
            that.railEl = productRailEl;
            
            that.el.appendChild(productRailElHolderEl);

            Ps.initialize(productRailEl, {
              suppressScrollX: true
            });

            that.onReady();

            return;//important to stop here.
          }else if(++snapReferenceHeightCheck < snapReferenceHeightCheckLimit){
            getReferenceHeight();
          }
        },50);
      })();
    }else{
      this.el.innerHTML = renderPages.call(this);
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
        o: this.config.products_order_by,
        od: this.config.products_order_direction,
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