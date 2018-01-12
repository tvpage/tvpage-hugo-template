(function(){
  function Carousel(sel, options, globalConfig){
    this.options = options || {};
    this.data = this.options.data || [];
    this.page = this.options.page || 0;
    this.endpoint = this.options.endpoint;
    this.itemsPerPage = this.options.itemsPerPage;
    this.params = this.options.params;
    this.config = globalConfig || {};
    this.eventPrefix = globalConfig.events.prefix;
    this.templates = this.options.templates;
    this.loading = false;
    this.itemClass = '.carousel-item';
    this.full = this.options.full || false;
    this.dots = this.getOption(this.options.dots, false);
    this.appendArrows = this.getOption(this.options.appendArrows, null);
    this.appendDots = this.getOption(this.options.appendDots, false);
    this.arrows = this.getOption(this.options.arrows, true);
    this.loadMore = this.getOption(this.options.loadMore, true);
    this.dotsPosition = this.getOption(this.options.dotsPosition, 'bottom');
    this.slidesToShow = this.getOption(this.options.slidesToShow, 1);
    this.slidesToScroll = this.getOption(this.options.slidesToScroll, 1);
    this.customStyleEl;
    this.slideCompare;
    this.onReadyCalled = false;

    this.el = document.getElementById(sel);
    this.el.style.position = 'relative';
  };

  Carousel.prototype.getOption = function(option, defaultValue){
    return Utils.isUndefined(option) ? defaultValue : option;
  };

  Carousel.prototype.getSlickConfig = function(){
    var options = this.options,
    slickConfig = {
      slidesToShow: this.slidesToShow,
      slidesToScroll: this.slidesToScroll,
      infinite: options.infinite || false,
      arrows: this.arrows,
      dots: this.dots,
      appendArrows: this.appendArrows,
      appendDots: this.appendDots,
      customPaging: function(s, k){
        return '<button class="btn-primary carousel-dot carousel-dot-' + k + '"></button>';
      }
    };

    if(!!options.responsive && options.responsive.length){
      slickConfig.responsive = options.responsive;
    }

    slickConfig = Utils.removeObjNulls(slickConfig);

    return slickConfig;
  };

  Carousel.prototype.handleClick = function() {
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

  Carousel.prototype.onReady = function(){
    if(this.onReadyCalled){
      return;
    }

    var onReady = this.options.onReady;

    if(Utils.isFunction(onReady)){
      onReady();
    }

    this.onReadyCalled = true;
  };

  Carousel.prototype.getArrowEls = function(){
    return [
      this.el.querySelector('.slick-prev'),
      this.el.querySelector('.slick-next')
    ].filter(Boolean);
  };

  //since the slick's setPosition callback is triggered multiple times, is probably better
  //to align the arrows again, only if the new position is diff than the existing one?
  Carousel.prototype.alignArrowsX = function(){
    var alignArrowsX = this.options.alignArrowsX;
    var firstItem = this.el.querySelector(this.itemClass);

    if((!Utils.isUndefined(alignArrowsX) && !alignArrowsX) || !firstItem){
      return;
    }

    var xOffset;
    var firstItemChild = firstItem.firstChild;
    
    if(firstItemChild){
      xOffset = parseInt(Utils.getStyle(firstItemChild,'padding-left'), 10);
      xOffset += parseInt(Utils.getStyle(firstItemChild,'margin-left'), 10);
    }

    if(Utils.isUndefined(xOffset))
      return;
    
    var arrowEls = this.getArrowEls();

    //implement on arrows
    var arrowPrev = arrowEls[0];
    if(arrowPrev){
      arrowPrev.style.left = parseInt(xOffset) + 'px';
    }

    var arrowNext = arrowEls[1];
    if(arrowNext){
      arrowNext.style.right = parseInt(xOffset) + 'px';
    }
  };

  //all alignment offered will happen relative to the slick-carousel element
  Carousel.prototype.alignArrowsY = function(){
    var that = this,
        alignArrowsY = this.options.alignArrowsY,
        toCenter,
        top,
        bottom;

    function handleStringArg(){
      if('bottom' === alignArrowsY){
        bottom = '0';
        top = 'auto';
      }      
    }

    function handleArrayArg(){
      var referenceEl = this.el.querySelector(alignArrowsY[1]);
      
      if(!referenceEl){
        return;
      }

      toCenter = 'center' === alignArrowsY[0];

      if(toCenter){
        //when a reference is passed and we need to center vertically, we need to collect the
        //parents in order to include them in the measurement.
        function whenReferenceParentsCollected(){
          top = 0;

          var parentsLength = parents.length;

          for (var i = 0; i < parentsLength; i++) {
            top += parents[i].offsetTop;
          }

          //calculation is done, now lets find the arrows and update their style. We update the CSS rule instead of straight style modification
          //so the top value remains and the user won't experience the top update (flickering)
          top += referenceEl.offsetTop + Math.floor(referenceEl.getBoundingClientRect().height / 2);

          var carouselId = that.el.id;
          var customStyleSheet = Utils.createEl('style');
          var customStyleSheetId = carouselId + '-slick';
          var customStyle = '#' + carouselId + ' .slick-arrow{top:' + top + 'px;}';

          if(that.customStyleEl){
            that.customStyleEl.innerHTML = customStyle;
          }else{
            var customStyleSheet = Utils.createEl('style');
            
            customStyleSheet.id = customStyleSheetId;
            customStyleSheet.innerHTML = customStyle;

            that.customStyleEl = customStyleSheet;
            
            document.head.appendChild(customStyleSheet);
          }

          Utils.addClass(that.el, 'arrows-ready');
        }

        //if reference offsetParent is not slick's topmost element, we collect the elements in-between and
        //we'll add that to the top value calculation
        function getCurrentParent(childEl){
          return childEl ? childEl.offsetParent : referenceEl.offsetParent;
        }

        var parentsCheck = 0;
        var parents = [];

        (function collectReferenceParents(currentParent){
          setTimeout(function() {
            currentParent = currentParent || getCurrentParent();

            if(currentParent && currentParent.id == that.el.id){
              whenReferenceParentsCollected();

              return;//important to stop here.
            }else if(++parentsCheck < 200){
              parents.push(currentParent);

              //if an element actually existed, then we go for it's parent
              if(currentParent){
                collectReferenceParents(getCurrentParent(currentParent));
              } else{
                collectReferenceParents();
              }
            }
          },50);
        })();
      }
    }

    if('string' === typeof alignArrowsY){
      handleStringArg.call(this);
    }else if(alignArrowsY && alignArrowsY.length > 1){
      handleArrayArg.call(this);
    }else if(!alignArrowsY){
      Utils.addClass(this.el, 'arrows-ready');
    }
  };

  Carousel.prototype.onSlickInit = function(){
    if(this.options.dotsCenter){
      Utils.addClass(this.el, 'dots-center');
    }

    var arrowEls = this.el.querySelectorAll('.slick-arrow');
    var arrowElsLength = arrowEls.length;
    var slickEl = this.el.querySelector('.slick-carousel');

    for (var i = 0; i < arrowElsLength; i++) {
      slickEl.appendChild(arrowEls[i]);
    }

    slickEl.style.height = 'auto';
    slickEl.style.overflow = 'visible';

    this.onReady();
  };

  Carousel.prototype.onSlickBeforeChange = function(slickArgs){
    this.slideCompare = slickArgs[2];//adding currentSlide
  };

  //if there's actually a change/movement on slides
  Carousel.prototype.onSlickAfterChange = function(slickArgs){
    if(this.slideCompare != slickArgs[2] && this.loadMore && !this.full){
      this.loadNext('render');
    }

    this.handleLazy();
  };

  Carousel.prototype.addArrowIcons = function(){
    function getIcon(d){
      var i = Utils.createEl('i');
      
      i.className = 'material-icons abs-center';
      i.innerHTML = 'keyboard_arrow_' + d;

      return i;
    }

    var arrowEls = this.getArrowEls();
    
    var prevArrow = arrowEls[0];
    if(prevArrow){
      Utils.addClass(prevArrow, 'carousel-arrow');

      prevArrow.innerHTML = '';
      prevArrow.appendChild(getIcon('left'));
    }

    var nextArrow = arrowEls[1];
    if(nextArrow){
      Utils.addClass(nextArrow, 'carousel-arrow');

      nextArrow.innerHTML = '';
      nextArrow.appendChild(getIcon('right'));
    }
  };

  Carousel.prototype.onSlickSetPosition = function(){
    this.addArrowIcons();

    this.alignArrowsX();
    this.alignArrowsY();

    setTimeout(function(opts){
      var onResize = opts.onResize;
      
      if(Utils.isFunction(onResize))
        onResize();
    }, 0, this.options);
  };

  Carousel.prototype.initSlick = function(slickEl, callback){
    this.$slickEl = $(slickEl);
    
    var that = this;

    this.$slickEl.on('init', function(){
      that.onSlickInit.call(that);

      if(Utils.isFunction(callback)){
        callback();
      }
    });
    
    this.$slickEl.on('beforeChange', function(){
      that.onSlickBeforeChange.call(that, arguments);
    });

    this.$slickEl.on('afterChange', function(){
      that.onSlickAfterChange.call(that, arguments);
    });

    this.$slickEl.on('setPosition', function(){
      that.onSlickSetPosition.call(that);
    });

    this.$slickEl.slick(this.getSlickConfig());
  };

  Carousel.prototype.startSlick = function(slickEl, callback){
    //prep before slick init goes here
    this.handleDots();

    var that = this;

    if (Utils.isUndefined($.fn.slick)) {
      $.ajax({
        dataType: 'script',
        cache: true,          
        url: this.config.baseUrl + '/slick/slick-min.js'//need to move this to a global vendors?
      }).done(function(){
        setTimeout(function(){
          that.initSlick(slickEl, callback);
        },0);
      });
    } else {
      setTimeout(function(){
        that.initSlick(slickEl, callback);
      },0);
    }
  };

  Carousel.prototype.getDataItemById = function(id){
    var itemsLength = this.data.length;

    for (var i = 0; i < itemsLength; i++) {
      var item = this.data[i];
      
      if (item.id === id)
        return item;
    }
  };

  Carousel.prototype.renderItem = function(item){
    var html = "";

    try{
      html = Utils.tmpl(this.templates.item, item);
    }catch(e){
      console.log('render error ', e)
    }

    return html;
  };

  Carousel.prototype.renderBatch = function(batch){
    var html = '';
    var batchLength = batch.length;

    for (var i = 0; i < batchLength; i++){
      html += this.renderItem(batch[i]);
    }

    return html;
  };

  Carousel.prototype.clean = function(){
    var itemsTarget = this.options.itemsTarget;
    var itemsTargetEl = this.el.querySelector(itemsTarget);

    function wipe(){
      var childEls = [
        this.itemsTargetEl,
        this.appendDotsEl
      ].filter(Boolean);

      var childElsLength = childEls.length;

      for (var i = 0; i < childElsLength; i++) {
        var childEl = childEls[i];

        if(document.body.contains(childEl)){
          Utils.remove(childEl);
        }
      }

      this.el.innerHTML = '';
      this.$slickEl = null;
      this.appendDots = null;
    }

    if(itemsTarget && itemsTargetEl && Utils.isFunction($(itemsTargetEl).slick)){
      try{
        $(itemsTargetEl).slick('unslick');
      }catch(e){
        console.log('unslick error', e);
      }
      
      wipe.call(this);
    }else{
      wipe.call(this);
    }
  };

  //we always render a dots holder as long as the user is passing one implicitily
  Carousel.prototype.handleDots = function(){
    if(this.appendDots){
      return;
    }

    var dotsId = 'dots-target-' + this.el.id;

    this.appendDotsEl = Utils.createEl('div');
    this.appendDotsEl.id = dotsId;
    
    var dotsClass = this.options.dotsClass;
    
    if(!!dotsClass)
      this.appendDotsEl.className = dotsClass;

    if('bottom' === this.dotsPosition){
      this.el.appendChild(this.appendDotsEl);
    }else{
      this.el.insertBefore(this.appendDotsEl, this.el.firstChild);
    }

    this.appendDots = '#' + dotsId;
  };

  Carousel.prototype.render = function(){
    var all = this.data;
    var allLength = all.length;

    //if no data to render
    if(!allLength && this.options.clean){
      this.clean();
      
      var onNoData = this.options.onNoData;

      if(Utils.isFunction(onNoData)){
        onNoData();
      }

      Utils.addClass(this.el, 'm-0');

      return;
    }else{
      Utils.removeClass(this.el, 'm-0');
    }

    this.parse();

    var willUpdate = this.page > 0 ? true : false;
    var pages = this.itemsPerPage > 0 ? Utils.rowerize(all, this.itemsPerPage) : [all];
    var pagesLength = pages.length;
    var pageWrapStart = this.options.pageWrapStart;
    var pageWrapEnd = this.options.pageWrapEnd;
    var hasPageWrap = pageWrapStart && pageWrapEnd;
    var moreThan1Page = this.loadMore ? allLength >= this.slidesToShow : allLength > this.slidesToShow;

    function renderPages(offset, onArray){
      var html = onArray ? [] : '';
      
      off = offset || 0;

      for (var i = 0; i < pagesLength; i++) {
        var page = pages[i + off];

        if(page){
          var pageHTML = (hasPageWrap ? pageWrapStart : '') + this.renderBatch(page) + (hasPageWrap ? pageWrapEnd : '');
          
          if(onArray){
            html.push(pageHTML);
          }else{
            html += pageHTML;
          }
        }
      }

      return html;
    }

    
    var itemsTargetEl;
    var pagesHTML = renderPages.call(this, this.page, true);
    var that = this;

    function renderBase(){
      var holderEl = Utils.createEl('div');
      holderEl.innerHTML = Utils.tmpl(this.templates.list, this.config);

      itemsTargetEl = holderEl.querySelector(this.options.itemsTarget);
    }

    function afterRender(){
      this.handleClick();
      this.handleLazy();

      var onRender = this.options.onRender;

      if(Utils.isFunction(onRender)){
        onRender();
      }
    }

    function addPagesToSlick(){
      var pagesHTMLLength = pagesHTML.length;
      var i;

      setTimeout(function(){
        for (i = 0; i < pagesHTMLLength; i++) {
          that.$slickEl.slick('slickAdd', pagesHTML[i]);
        }

        afterRender.call(that);
      },10);
    }

    //if it's a subsequent page we need to consider offset
    if(willUpdate){
      addPagesToSlick();
    }else{
      this.clean();

      renderBase.call(this);

      itemsTargetEl.innerHTML = pagesHTML[0];
      
      this.el.appendChild(itemsTargetEl);
      
      pagesHTML.shift();

      if(moreThan1Page){
        this.startSlick(itemsTargetEl, addPagesToSlick);
      }else{
        this.onReady();
      }

      afterRender.call(this);
    }
  };

  Carousel.prototype.handleLazy = function(){
    var lazyEls = this.el.querySelectorAll('.lazy-img');
    var lazyElsLength = lazyEls.length;
    var i;

    for (i = 0; i < lazyElsLength; i++) {
      var lazyEl = lazyEls[i];

      lazyEl.style.backgroundImage = 'url(' + Utils.attr(lazyEl, 'data-img') + ')';
      
      Utils.removeClass(lazyEl, 'lazy-img');
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

    //for testing
    if(this.page >0){
      data.pop();
    }

    var dataLength = data.length || 0;

    if(!this.loadMore){
      this.data = data;
    }else if(!dataLength){
      this.full = true;
      
      if(this.options.clean)
        this.data = [];

      //if no more data we don't want to move further
      return;
    }else if(dataLength < this.itemsPerPage){
      this.full = true;

      this.data = this.data.concat(data);
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
      that.onLoad.call(that, data);

      if(Utils.isFunction(that[action])){
        that[action]();
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