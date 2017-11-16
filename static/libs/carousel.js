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
    this.appendDots = Utils.isUndefined(this.options.appendDots) ? false : this.options.appendDots;
    this.maxDots = 5;
    this.limitDots = Utils.isUndefined(this.options.limitDots) ? false : this.options.limitDots;
    this.el = document.getElementById(sel);
  };

  Carousel.prototype.getSlickConfig = function(){
    var options = this.options,
    slickConfig = {
      prevArrow:'<button type="button" class="btn-sm slick-prev"></button>',
      nextArrow:'<button type="button" class="btn-sm slick-next"></button>',
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
        return '<button class="btn-sm carousel-dot-' + k + '">' + k + '</button>';
      };

      if(this.appendDots){
        slickConfig.appendDots = this.appendDots;
      }
    }

    return slickConfig;
  };

  Carousel.prototype.handleClick = function() {
    var that = this;
    var onClick = Utils.isFunction(this.options.onClick) ? this.options.onClick : function(e){
      if(that.options.clickDefaultStop){
        Utils.stopEvent(e);
      }

      var target = Utils.getRealTargetByClass(e.target, that.itemClass.substr(1));
      var id = target.getAttribute('data-id');

      //later remove this, probably only the carousel widget is using it, lets fix it
      Utils.sendMessage({
        event: that.eventPrefix + ":carousel_click",
        clicked: id
      });
    };

    var items = this.el.querySelectorAll(this.itemClass);
    var itemsLength = items.length;

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

    this.handleClick();
  };

  //since the slick's setPosition callback is triggered multiple times, is probably better
  //to align the arrows again, only if the new position is diff than the existing one?
  Carousel.prototype.alignArrowsX = function(){
    var alignArrowsX = this.options.alignArrowsX;
    var xOffset;

    //we snap the arrow to the slide item by default, that's why we need to get the first
    //and last item of the page
    if(Utils.isUndefined(alignArrowsX)){
      var firstItem = this.el.querySelector(this.itemClass);
      if(firstItem){
        var firstItemEl = firstItem.querySelector('.video');
        
        if(firstItemEl){
          xOffset = Utils.getStyle(firstItemEl,'padding-left');
        }
      }
    }

    if(Utils.isUndefined(xOffset))
      return;

    //implement on arrows
    var arrowPrev = this.el.querySelector('.slick-prev');
    if(arrowPrev){
      arrowPrev.style.left = xOffset;
    }

    var arrowNext = this.el.querySelector('.slick-next');
    if(arrowNext){
      arrowNext.style.right = (parseInt(xOffset) - 1) + 'px';
    }
  };

  //all alignment offered will happen relative to the slick-carousel element
  Carousel.prototype.alignArrowsY = function(){
    var alignArrowsY = this.options.alignArrowsY,
        arrowTop,
        arrowBottom,
        isCenter;
    
    var updateArrows = function(){
      var arrows = that.el.querySelectorAll('.slick-arrow');
      var arrowsLength = arrows.length;

      for (var i = 0; i < arrowsLength; i++) {
        var arrow = arrows[i];

        if(arrowTop || arrowBottom)
          arrow.style.transform = 'initial';

        if(arrowTop){
          arrow.style.top = isCenter ? arrowTop - arrow.getBoundingClientRect().height / 2 : arrowTop;
        }
        
        if(arrowBottom)
          arrow.style.bottom = arrowBottom;

        //show arrows
        arrow.style.opacity = 1;
        arrow.style.visibility = 'visible';
      }
    };

    if('string' === typeof alignArrowsY){

      if('bottom' === alignArrowsY){
        arrowBottom = '0';
        arrowTop = 'auto';
      }

    }else if(alignArrowsY && alignArrowsY.length > 1){
      var referenceEl = this.el.querySelector(alignArrowsY[1]);
      
      if(!referenceEl){
        return;
      }

      isCenter = 'center' === alignArrowsY[0];

      if(isCenter){

        var that = this;        
        var parentsCheck = 0;
        var parents = [];
        var currentParent = referenceEl.offsetParent;

        //if reference offsetParent is not slick's topmost element, we collect the elements in-between and
        //we'll add that to the top value calculation
        (function collectParents(){
          setTimeout(function() {
            if(currentParent && Utils.hasClass(currentParent, 'slick-carousel')){
              arrowTop = 0;

              var parentsLength = parents.length;
              
              for (var i = 0; i < parentsLength; i++) {
                arrowTop += parents[i].offsetTop;
              }

              //adding the center of the element
              arrowTop += Math.floor(referenceEl.getBoundingClientRect().height / 2);

              updateArrows();
              return;
            }else if(++parentsCheck < 30){
              parents.push(currentParent);

              if(currentParent)
                currentParent = currentParent.offsetParent;

              collectParents();
            }
          },0);
        })();

      }
    }
  };

  Carousel.prototype.onSlickInit = function(){
    if(this.config.debug) {
      console.log('carousel el initialized: ', this.itemsTargetEl, performance.now() - startTime);
    }

    if(this.options.dotsCenter){
      Utils.addClass(this.el, 'dots-centered');
    }

    if(this.options.dotsClass){
      Utils.addClass(this.el.querySelector('.slick-dots'), this.options.dotsClass);
    }

    this.onReady();
  };

  Carousel.prototype.onSlickAfterChange = function(){
    console.log('# Slick "afterChange" was called!');
    
    //not the best place to do this... is very bouncy, should we try again and checking id loading
    // if(!this.full){
    //   this.loadNext('render');
    // }
  };

  Carousel.prototype.onSlickSetPosition = function(){
    this.alignArrowsX();
    this.alignArrowsY();

    setTimeout(function(opts){
      var onResize = opts.onResize;
      if(Utils.isFunction(onResize))
        onResize();
    }, 10, this.options);
  };

  Carousel.prototype.start = function(){
    var that = this;
    
    var startSlick = function() {
      that.$slickEl = $(that.itemsTargetEl);
      
      that.$slickEl.on('init', function(){
        that.onSlickInit.call(that);
      });
      
      that.$slickEl.on('afterChange', function(){
        that.onSlickAfterChange.call(that);
      });

      that.$slickEl.on('setPosition', function(){
        that.onSlickSetPosition.call(that);
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
      setTimeout(function(){
        that.onLoad.call(that, data);
        
        if(Utils.isFunction(that[action])){
          that[action]();
        }
  
        if(Utils.isFunction(cback)){
          cback(data);
        }
      },0);
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
