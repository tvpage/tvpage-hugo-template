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
    this.loadMore = Utils.isUndefined(this.options.loadMore) ? true : this.options.loadMore;
    this.dotsPosition = Utils.isUndefined(this.options.dotsPosition) ? 'bottom' : this.options.dotsPosition;
    this.el = document.getElementById(sel);
  };

  Carousel.prototype.getSlickConfig = function(){
    var options = this.options,
    slickConfig = {
      prevArrow: '#carousel-arrow-prev',
      nextArrow: '#carousel-arrow-next',
      slidesToShow: options.slidesToShow,
      slidesToScroll: options.slidesToScroll,
      infinite: options.infinite || false,
      arrows: true
    };
1
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
        return '<button class="btn-sm carousel-dot carousel-dot-' + k + '">' + k + '</button>';
      };

      if(this.appendDots){
        slickConfig.appendDots = this.appendDots;
      }
    }

    return slickConfig;
  };

  Carousel.prototype.handleClick = function() {
    var defaultStop = this.options.clickDefaultStop;
    var onClick = Utils.isFunction(this.options.onClick) ? this.options.onClick : function(e){
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
        
        //WTF? video class here?
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
      arrowNext.style.right = parseInt(xOffset) + 'px';
    }
  };

  //all alignment offered will happen relative to the slick-carousel element
  Carousel.prototype.alignArrowsY = function(){
    var alignArrowsY = this.options.alignArrowsY,
        arrowTop,
        arrowBottom,
        isCenter;
    
    function updateArrows(){
      var arrows = that.el.querySelectorAll('.carousel-arrow');
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
      console.log('carousel el initialized: ', performance.now() - startTime);
    }

    if(this.options.dotsCenter){
      Utils.addClass(this.el, 'dots-centered');
    }

    if(this.options.dotsClass){
      Utils.addClass(this.el.querySelector('.slick-dots'), this.options.dotsClass);
    }

    var arrowEls = this.el.querySelectorAll('.carousel-arrow');
    var arrowElsLength = arrowEls.length;

    for (var i = 0; i < arrowElsLength; i++) {
      this.el.querySelector('.slick-carousel').appendChild(arrowEls[i]);
    }

    this.onReady();
  };

  Carousel.prototype.onSlickAfterChange = function(){
    if(this.loadMore && !this.full){
      this.loadNext('render');
    }
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
    
    function startSlick(){
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

  Carousel.prototype.renderItem = function(item){
    return Utils.tmpl(this.templates.item, item);
  };

  Carousel.prototype.renderBatch = function(batch){
    var html = '';
    var batchLength = batch.length;

    for (var i = 0; i < batchLength; i++){
      html += this.renderItem(batch[i]);
    }

    return html;
  };

  Carousel.prototype.buildArrow = function(dir){
    var arrowEl = document.createElement('button');
    arrowEl.type = 'button';
    arrowEl.id = 'carousel-arrow-' + dir;
    arrowEl.className = 'btn-sm carousel-arrow slick-' + dir;
    
    var iconEl = document.createElement('i');
    iconEl.className = 'material-icons';
    
    var iconElHTML = 'keyboard_arrow_';
    
    if('prev' === dir)
      iconElHTML += 'left';

    if('next' === dir)
      iconElHTML += 'right';

    iconEl.innerHTML = iconElHTML;
    
    arrowEl.appendChild(iconEl);

    return arrowEl;
  };
  
  Carousel.prototype.render = function(){
    var all = this.data;
    var allLength = all.length;

    //if no data to render
    if(!allLength && this.options.clean){
      this.el.innerHTML = '';
      this.itemsTargetEl = null;

      return;
    }

    this.parse();

    var moreThan1 = allLength > 1;
    var itemTemplate = this.templates.item;

    var pages = Utils.rowerize(all, this.itemsPerPage)
    var pagesLength = pages.length;

    var pageWrapStart = this.options.pageWrapStart;
    var pageWrapEnd = this.options.pageWrapEnd;
    var hasPageWrap = pageWrapStart && pageWrapEnd;

    //so we are only considering the page wrappers if the page is 0?
    if(0 == this.page){
      this.el.innerHTML = Utils.tmpl(this.templates.list, this.config);
      this.itemsTargetEl = this.el.querySelector(this.options.itemsTarget);

      if(hasPageWrap){
        var html = '';

        for (var i = 0; i < pagesLength; i++) {
          html += pageWrapStart + this.renderBatch(pages[i]) + pageWrapEnd;
        }

        this.itemsTargetEl.innerHTML = html;
      }else{
        this.itemsTargetEl.innerHTML = this.renderBatch(all);
      }

      //we won't start the slick slider if there's no overflow of items
      if(moreThan1){
        //if user don't pass where nav dots should be, we render a placeholder
        if(!this.appendDots && this.dots){
          this.appendDotsEl = document.createElement('div');
          this.appendDotsEl.id = 'dots-target';
          this.appendDotsEl.className = 'col';
          
          this.appendDots = '#dots-target';
          
          if('bottom' === this.dotsPosition){
            this.el.appendChild(this.appendDotsEl);
          }else{
            this.el.insertBefore(this.appendDotsEl, this.el.firstChild);
          }

          this.el.appendChild(this.buildArrow('prev'));
          this.el.appendChild(this.buildArrow('next'));
        }

        this.start();
      }else{
        this.onReady();
      }
    }else{
      //if it's a subsequent page we need to consider offset
      var pageOffset = this.page;

      if(hasPageWrap){
        var html = '';

        for (var i = 0; i < pagesLength; i++) {
          var page = pages[i + pageOffset]
          
          if(page){
            html += pageWrapStart + this.renderBatch(page) + pageWrapEnd;
          }
        }

        this.$slickEl.slick('slickAdd', html);
      }else{
        var html = '';

        for (var i = 0; i < pagesLength; i++) {
          var page = pages[i + pageOffset]
          
          if(page){
            html += this.renderBatch(page);
          }
        }

        this.$slickEl.slick('slickAdd', html);
      }
    }

    this.handleClick();
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

    if(!this.loadMore){
      this.data = data;
    }else if(!dataLength || dataLength < this.itemsPerPage){
      this.full = true;
      
      if(this.options.clean)
        this.data = [];

      return;
    }else{
      this.data = this.data.concat(data);
    }

    var onLoad = this.options.onLoad;
    if(Utils.isFunction(onLoad))
      onLoad(data);
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