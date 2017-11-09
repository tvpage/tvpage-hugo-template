(function(){

  function Carousel(sel, options, config){
    this.options = options || {};    
    this.data = this.options.data || [];
    this.page = this.options.page || 0;
    this.endpoint = this.options.endpoint;
    this.itemsPerPage = this.options.itemsPerPage;
    this.params = this.options.params;
    this.config = config || {};
    this.eventPrefix = config.events.prefix;
    this.templates = this.options.templates;
    this.loading = false;
    this.itemClass = '.tvp-carousel-item';
    this.full = this.options.full || false;
    this.dots = Utils.isUndefined(this.options.dots) ? false : this.options.dots;
    this.maxDots = 5;
    this.limitDots = Utils.isUndefined(this.options.limitDots) ? true : this.options.limitDots;
    this.el = document.getElementById(sel);
  };

  Carousel.prototype.getSlickConfig = function(){
    var options = this.options,
    slickConfig = {
      prevArrow:'<button type="button" class="btn-sm btn-primary slick-prev"></button>',
      nextArrow:'<button type="button" class="btn-sm btn-primary slick-next"></button>',
      slidesToShow: options.slidesToShow,
      slidesToScroll: options.slidesToScroll,
      infinite: options.infinite || false,
      arrows: true
    };

    if(!!options.responsive && options.responsive.length){
      slickConfig.responsive = options.responsive;
    }

    if(this.config.navigation_bullets && this.dots){
      slickConfig.dots = true;

      if(this.limitDots && this.maxDots < Utils.rowerize(this.data, this.itemsPerPage).length){
        slickConfig.dots = false;
      }
    }

    //dots/bullets pagination
    if(slickConfig.dots){

      slickConfig.customPaging = function (slick, k) {
        return '<button class="btn-sm btn-primary carousel-dot-' + k + '">' + k + '</button>';
      };

      if(this.config.navigation_bullets_append_to){
        slickConfig.appendDots = this.config.navigation_bullets_append_to;
      }else{
        console.log("?")
      }
    }

    return slickConfig;
  };

  Carousel.prototype.handleClick = function() {
    var that = this;
    var items = this.el.querySelectorAll(this.itemClass);
    var itemsLength = items.length;
    
    var onClick = Utils.isFunction(this.options.onClick) ? this.options.onClick : function(e){
      if(that.options.clickDefaultStop){
        Utils.stopEvent(e);
      }

      var target = Utils.getRealTargetByClass(e.target, that.itemClass.substr(1));
      var id = target.getAttribute('data-id');

      Utils.sendMessage({
        event: that.eventPrefix + ":carousel_click",
        clicked: id
      });
    };

    for (var i = 0; i < itemsLength; i++) {
      items[i].removeEventListener('click', onClick, false);
      items[i].addEventListener('click', onClick, false);
    }
  };

  Carousel.prototype.onReady = function(){
    var onReady = this.options.onReady;
    
    if(Utils.isFunction(onReady)){
      onReady();
    }
  };

  Carousel.prototype.showArrow = function(arrow){
    arrow.style.opacity = 1;
    arrow.style.visibility = 'visible';
  };

  Carousel.prototype.start = function(){
    var that = this;
    var startSlick = function() {
      that.$slickEl = $(that.itemsTargetEl);
      
      that.$slickEl.on('init', function(event, slick) {
        if(that.config.debug) {
          console.log('carousel el initialized: ', that.itemsTargetEl, performance.now() - startTime);
        }

        if(that.options.dotsCenter){
          that.el.classList.add('dots-centered');
        }

        that.onReady();
      });

      that.$slickEl.on('afterChange', function(event, slick){
        console.log('# Slick "afterChange" was called!');

        //not the best place to do this... is very bouncy, should we try again and checking id loading
        if(!this.full){
          that.loadNext('render');
        }
      });

      that.$slickEl.on('setPosition', function(event, slick){
        var arrowsVerticalAlign = that.options.arrowsVerticalAlign,
            arrowTop,
            arrowBottom;
        
        if('string' === typeof arrowsVerticalAlign){

          if('bottom' === arrowsCenteredTo){
            arrowBottom = '0';
            arrowTop = 'auto';
          }

        }else if(arrowsVerticalAlign.length > 1){
          var referenceEl = that.el.querySelector(arrowsVerticalAlign[1]);
          
          if(referenceEl){
            var position = arrowsVerticalAlign[0];

            if('center' === position){
             arrowTop = referenceEl.offsetTop + Math.floor(referenceEl.getBoundingClientRect().height / 2); 
            }
          }
        }

        //implement on arrows
        var arrows = that.el.querySelectorAll('.slick-arrow');
        var arrowsLength = arrows.length;

        for (var i = 0; i < arrowsLength; i++) {
          var arrow = arrows[i];

          if(arrowTop)
            arrow.style.top = arrowTop;
          
          if(arrowBottom)
            arrow.style.bottom = arrowBottom;

          that.showArrow(arrow);
        }

        setTimeout(function(){
          Utils.sendMessage({
            event: that.eventPrefix + ':carousel_resize',
            height: Utils.getWidgetHeight()
          });
        },10);

      });

      that.$slickEl.slick(that.getSlickConfig());
    };

    if (Utils.isUndefined($.fn.slick)) {
      $.ajax({
        dataType: 'script',
        cache: true,          
        url: this.config.baseUrl + '/carousel/js/vendor/slick-min.js'//need to move this to a global vendors?
      }).done(startSlick);
    } else {
      startSlick();
    }
  };

  Carousel.prototype.getItemById = function(id){
    var itemsLength = this.data.length;

    for (var i = 0; i < itemsLength; i++) {
      var item = this.data[i];
      if (item.id === id)
        return item;
    }
  };

  Carousel.prototype.renderBatch = function(batch){
    var html = '';
    var batchLength = batch.length;
    var itemTemplate = this.templates.item;

    for (var i = 0; i < batchLength; i++){
      html += Utils.tmpl(itemTemplate, batch[i]);
    }

    return html;
  };

  Carousel.prototype.render = function(){
    var all = this.data;
    var allLength = all.length;

    if(!allLength && this.options.clean){
      
      this.el.innerHTML = '';
      this.itemsTargetEl = null;

      return;
    }

    var moreThan1 = allLength > 1;
    var itemTemplate = this.templates.item;

    if(0 === this.page){
      this.el.innerHTML = Utils.tmpl(this.templates.list, this.config);
      this.itemsTargetEl = this.el.querySelector(this.options.itemsTarget);
      
      var pageWrapStart = this.options.pageWrapStart;
      var pageWrapEnd = this.options.pageWrapEnd;
      var hasPageWrap = pageWrapStart && pageWrapEnd;

      if(hasPageWrap){
        var pages = Utils.rowerize(all, this.itemsPerPage)
        var pagesLength = pages.length;
        var html = '';

        for (var i = 0; i < pagesLength; i++) {
          html += pageWrapStart + this.renderBatch(pages[i]) + pageWrapEnd;
        }

        this.itemsTargetEl.innerHTML = html;
      }else{
        this.itemsTargetEl.innerHTML = this.renderBatch(all);
      }

      if(moreThan1){
        this.start();
      }else{
        this.onReady();
      }
    }else{

      var iOffset = this.itemsPerPage * this.page;

      for (var i = 0; i < allLength; i++) {
        this.$slickEl.slick('slickAdd', Utils.tmpl(this.templates.item, all[ (i + iOffset) % all.length ]));
      }
    }
  };

  Carousel.prototype.parse = function(){
    var dataLength = this.data.length;

    for (var i = 0; i < dataLength; i++){
      if(Utils.isFunction(this.options.parse))
        this.options.parse(this.data[i]);
    }
  };

  Carousel.prototype.onLoad = function(data){
    this.loading = false;

    var dataLength = data.length || 0;
    
    if(!dataLength){

      //this shall trun off any subsequent loading tasks
      this.full = true;

      if(this.options.clean)
        this.data = [];

      return;

    }else if(this.full){
      this.data = data;
    }else{
      this.data = this.data.concat(data);
    }

    this.parse();
  };

  Carousel.prototype.load = function(action,cback){
    if(this.loading)
      return;

    this.loading = true;

    var that = this;
    var loadParams = {
      'X-login-id': this.config.loginId,
      p: this.page
    };

    if(!this.full){
      loadParams.n = this.itemsPerPage;
    }

    Utils.loadScript({
      base: this.endpoint,
      params: Utils.extend(this.params || {}, loadParams)
    },function(data){
      that.onLoad.call(that, data);

      if(Utils.isFunction(that[action])){
        that[action]();

        if('render' === action){
          that.handleClick();
        }
      }

      if(Utils.isFunction(cback)){
        cback(data);
      }
    });

    return this;
  };

  Carousel.prototype.loadNext = function(action){
    if(this.full){
      return;
    }
    
    ++this.page;

    this.load(action);
  };

  Carousel.prototype.initialize = function(){
  };

  window.Carousel = Carousel;

}())
