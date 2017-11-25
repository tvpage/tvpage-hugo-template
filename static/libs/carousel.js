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
    this.appendDots = this.getOption(this.options.appendDots, false);
    this.maxDots = 5;
    this.limitDots = this.getOption(this.options.limitDots, false);
    this.loadMore = this.getOption(this.options.loadMore, true);
    this.dotsPosition = this.getOption(this.options.dotsPosition, 'bottom');
    this.slideCompare;
    this.slidesToShow = this.getOption(this.options.slidesToShow, 1);
    this.slidesToScroll = this.getOption(this.options.slidesToScroll, 1);
    this.el = document.getElementById(sel);
    this.el.style.position = 'relative';
  };

  Carousel.prototype.getOption = function(option, defaultValue){
    return Utils.isUndefined(option) ? (defaultValue || null) : option;
  };

  Carousel.prototype.getOption = function(option, defaultValue){
    return Utils.isUndefined(option) ? (defaultValue || null) : option;
  };

  Carousel.prototype.getSlickConfig = function(){
    var options = this.options,
    slickConfig = {
      slidesToShow: this.slidesToShow,
      slidesToScroll: this.slidesToScroll,
      infinite: options.infinite || false,
      arrows: true,
      appendArrows: '#carousel-arrows-' + this.el.id,
      appendDots: this.appendDots
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
        return '<button class="btn-primary carousel-dot carousel-dot-' + k + '"></button>';
      };
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

  Carousel.prototype.getArrowEls = function(){
    return [
      this.appendArrowsEl.querySelector('.slick-prev'),
      this.appendArrowsEl.querySelector('.slick-next')
    ].filter(Boolean);
  };

  //since the slick's setPosition callback is triggered multiple times, is probably better
  //to align the arrows again, only if the new position is diff than the existing one?
  Carousel.prototype.alignArrowsX = function(){
    var alignArrowsX = this.options.alignArrowsX;
    var xOffset;

    //we snap the arrow to the slide item by default, that's why we need to get the first and last item of the page
    if(Utils.isUndefined(alignArrowsX)){
      var firstItem = this.el.querySelector(this.itemClass);
      
      if(firstItem && !Utils.isUndefined(firstItem.firstChild)){
        xOffset = Utils.getStyle(firstItem.firstChild,'padding-left');
      }
    }

    this.arrowsXOffset = xOffset;

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
    var alignArrowsY = this.options.alignArrowsY,
        top,
        bottom,
        toCenter;

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
        var parentsCheck = 0;
        var parents = [];
        var currentParent = referenceEl.offsetParent;
        var that = this;

        function arrowsReady(el){
          arrowsEls = el.querySelectorAll('.slick-arrow');

          for (var i = 0; i < arrowsEls.length; i++) {
            Utils.addClass(arrowsEls[i], 'ready');
          }
        }

        //if reference offsetParent is not slick's topmost element, we collect the elements in-between and
        //we'll add that to the top value calculation
        (function collectParents(){
          setTimeout(function() {
            if(currentParent && currentParent.id == that.el.id){
              top = 0;

              var parentsLength = parents.length;
              for (var i = 0; i < parentsLength; i++) {
                top += parents[i].offsetTop;
              }

              top += referenceEl.offsetTop + Math.floor(referenceEl.getBoundingClientRect().height / 2);

              //calculation is done, now lets find the arrows and update their style.
              if(that.appendArrowsEl.childNodes.length){
                that.appendArrowsEl.style.top = top;
                arrowsReady(that.appendArrowsEl);
              }else{
                //There's currently an issue with Slick, by some reason this is appending the arrows inside the slick element,
                //basically not respecting the passed appendArrows setting.
                var slickArrows = that.el.querySelectorAll('.slick-arrow');

                for (var i = 0; i < slickArrows.length; i++) {
                  slickArrows[i].style.top = top;
                }

                arrowsReady(that.el);
              }

              return;
            }else if(++parentsCheck < 30){
              parents.push(currentParent);

              if(currentParent)
                currentParent = currentParent.offsetParent;

              collectParents();
            }
          },100);
        })();

      }
    }

    if('string' === typeof alignArrowsY){
      handleStringArg.call(this);
    }else if(alignArrowsY && alignArrowsY.length > 1){
      handleArrayArg.call(this);
    
    //default handling
    }else{
      var arrows = this.el.querySelectorAll('.slick-arrow');
      var arrowsLength = arrows.length;

      for (var i = 0; i < arrowsLength; i++) {
        arrows[i].style.opacity = 1;
        arrows[i].style.visibility = 'visible';
      }
    }
  };

  Carousel.prototype.onSlickInit = function(){
    if(this.config.debug) {
      console.log('carousel el initialized: ' + this.el.id, performance.now() - startTime);
    }

    if(this.options.dotsCenter){
      Utils.addClass(this.el, 'dots-centered');
    }

    var arrowEls = this.el.querySelectorAll('.slick-arrow');
    var arrowElsLength = arrowEls.length;

    for (var i = 0; i < arrowElsLength; i++) {
      this.el.querySelector('.slick-carousel').appendChild(arrowEls[i]);
    }

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
      prevArrow.innerHTML = '';
      prevArrow.appendChild(getIcon('left'));
    }

    var nextArrow = arrowEls[1];
    if(nextArrow){
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
    }, 10, this.options);
  };

  Carousel.prototype.initSlick = function(slickEl){
    var that = this;

    this.$slickEl = $(slickEl);
      
    this.$slickEl.on('init', function(){
      that.onSlickInit.call(that);
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

    var slickConfig = this.getSlickConfig();

    if(this.config.debug){
      console.log('creating slick with: ', slickConfig)
    }

    this.$slickEl.slick(slickConfig);
  };

  Carousel.prototype.startSlick = function(slickEl){
    var that = this;

    if (Utils.isUndefined($.fn.slick)) {
      $.ajax({
        dataType: 'script',
        cache: true,          
        url: this.config.baseUrl + '/slick/slick-min.js'//need to move this to a global vendors?
      }).done(function(){
        setTimeout(function(){
          that.initSlick(slickEl);
        },0);
      });
    } else {
      setTimeout(function(){
        that.initSlick(slickEl);
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

  Carousel.prototype.clean = function(){
    var itemsTarget = this.options.itemsTarget;
    var itemsTargetEl = this.el.querySelector(itemsTarget);

    function wipe(){
      this.el.innerHTML = '';
      this.$slickEl = null;
      this.appendDots = null;//need a deper reset?
      
      var childEls = [
        this.itemsTargetEl,
        this.appendArrowsEl,
        this.appendDotsEl 
      ];
      var childElsLength = childEls.length;

      for (var i = 0; i < childElsLength; i++) {
        if(childEls[i]){
          childEls[i].remove();
        }
      }
    }

    if(itemsTarget && itemsTargetEl && Utils.isFunction($(itemsTargetEl).slick)){
      $(itemsTargetEl).slick('unslick');
      wipe.call(this);
    }else{
      wipe.call(this);
    }
  };
  
  Carousel.prototype.handleArrows = function(){
    this.appendArrowsEl = document.createElement('div');
    this.appendArrowsEl.className = 'carousel-arrows';
    this.appendArrowsEl.id = 'carousel-arrows-' + this.el.id;
    
    this.el.appendChild(this.appendArrowsEl);
  };

  Carousel.prototype.handleDots = function(){
    if(!this.dots || this.appendDots && this.dots){
      return;
    }else{
      this.appendDotsEl = document.createElement('div');
      this.appendDotsEl.id = 'dots-target';
      this.appendDotsEl.className = 'col';

      Utils.addClass(this.appendDotsEl, this.options.dotsClass || '');

      this.appendDots = '#dots-target';
      if('bottom' === this.dotsPosition){
        this.el.appendChild(this.appendDotsEl);
      }else{
        this.el.insertBefore(this.appendDotsEl, this.el.firstChild);
      }
    }
  };

  Carousel.prototype.render = function(){
    var willUpdate = this.page > 0 ? 1 : 0;
    var all = this.data;
    var allLength = all.length;

    //if no data to render
    if(!allLength && this.options.clean){
      this.clean();
      return;
    }

    this.parse();

    var moreThan1 = allLength > 1;
    var pages = Utils.rowerize(all, this.itemsPerPage)
    var pagesLength = pages.length;
    var pageWrapStart = this.options.pageWrapStart;
    var pageWrapEnd = this.options.pageWrapEnd;
    var hasPageWrap = pageWrapStart && pageWrapEnd;

    function renderPages(offset){
      var html = '';
      
      off = offset || 0;

      for (var i = 0; i < pagesLength; i++) {
        var page = pages[i + off];
        
        if(page){
          html += (hasPageWrap ? pageWrapStart : '') + this.renderBatch(page) + (hasPageWrap ? pageWrapEnd : '');
        }
      }

      return html;
    }

    //if it's a subsequent page we need to consider offset
    if(willUpdate){
      this.$slickEl.slick('slickAdd', renderPages.call(this, this.page));
      this.handleClick();
    }else{
      this.clean();

      var holderEl = Utils.createEl('div');

      holderEl.innerHTML = Utils.tmpl(this.templates.list, this.config);

      // this.el.innerHTML = Utils.tmpl(this.templates.list, this.config);
      
      var itemsTargetEl = holderEl.querySelector(this.options.itemsTarget);
      
      itemsTargetEl.innerHTML = renderPages.call(this);

      this.el.appendChild(itemsTargetEl);

      this.handleDots();
      this.handleArrows();
      this.startSlick(itemsTargetEl);

      //we won't start the slick slider if there's no overflow of items
      //if user don't pass where nav dots should be, we render a placeholder
      // if(moreThan1){
        
      // }else{
      //   this.onReady();
      // }      
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