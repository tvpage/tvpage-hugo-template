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
    this.slideCompare;

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
      appendArrows: this.appendArrows,
      appendDots: this.appendDots,
      customPaging: function (s, k) {
        return '<button class="btn-primary carousel-dot carousel-dot-' + k + '"></button>';
      }
    };

    if(!!options.responsive && options.responsive.length){
      slickConfig.responsive = options.responsive;
    }

    slickConfig.dots = this.config.navigation_bullets && this.dots;

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
    Utils.removeClass(this.el, 'hide-abs');

    var absPosReady = this.options.absPosReady || false;

    if(absPosReady){
      this.el.style = "position:absolute;bottom:0;left:0;right:0;";
    }

    var onReady = this.options.onReady;

    if(Utils.isFunction(onReady)){
      onReady();
    }

    this.handleClick();
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

          top += referenceEl.offsetTop + Math.floor(referenceEl.getBoundingClientRect().height / 2);

          //calculation is done, now lets find the arrows and update their style. We update the CSS rule instead of straight style modification
          //so the top value remains and the user won't experience the top update (flickering)
          var allStyleSheets = document.styleSheets;
          var allStyleSheetsLength = allStyleSheets.length;
          var slickStyleSheet;
          var slickStyleSheetId = 'slick/' + (Utils.isMobile ? 'mobile/' : '')  + 'custom.css';

          for (var i = 0; i < allStyleSheetsLength; i++) {
            var styleSheetHref = allStyleSheets[i].href;
            
            if(styleSheetHref && -1 !== styleSheetHref.search(slickStyleSheetId)){
              slickStyleSheet = allStyleSheets[i];
            }
          }

          if(!slickStyleSheet){
            if(that.config.debug) {
              console.log("can't find slick's stylesheets");
            }

            return;
          }

          var cssRules = (slickStyleSheet.cssRules || slickStyleSheet.rules) || [];

          for (var i = 0; i < cssRules.length; i++) {
            var rule = cssRules[i];

            if(rule.selectorText == '.slick-arrow'){
              
              rule.style.top = top;
            }
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
    if(this.config.debug) {
      Utils.logSnapshot('carousel el initialized: ' + this.el.id);
    }

    if(this.options.dotsCenter){
      Utils.addClass(this.el, 'dots-centered');
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
        if(this.config.debug){
          console.log('unslick error', e);
        }
      }
      
      wipe.call(this);
    }else{
      wipe.call(this);
    }
  };

  Carousel.prototype.handleDots = function(){
    //we always render a dots holder as long as the user is passing one implicitily
    if(this.appendDots){
      return;
    }

    var dotsId = 'dots-target-' + this.el.id;

    this.appendDotsEl = document.createElement('div');
    this.appendDotsEl.id = dotsId;
    this.appendDotsEl.className = 'col';

    var dotsClass = this.options.dotsClass;
    
    if(!!dotsClass){
      Utils.addClass(this.appendDotsEl, this.options.dotsClass);
    }

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
      
      return;
    }

    this.parse();

    var willUpdate = this.page > 0 ? true : false;
    var moreThanOne = allLength > 1;
    var pages = this.itemsPerPage > 0 ? Utils.rowerize(all, this.itemsPerPage) : [all];
    var pagesLength = pages.length;
    var pageWrapStart = this.options.pageWrapStart;
    var pageWrapEnd = this.options.pageWrapEnd;
    var hasPageWrap = pageWrapStart && pageWrapEnd;

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

    //if it's a subsequent page we need to consider offset
    if(willUpdate){
      var pagesHTML = renderPages.call(this, this.page, true);
      var pagesHTMLLength = pagesHTML.length;

      for (var i = 0; i < pagesHTMLLength; i++) {
        this.$slickEl.slick('slickAdd', pagesHTML[i]);
      }

      this.handleClick();
    }else{
      this.clean();

      var holderEl = Utils.createEl('div');

      holderEl.innerHTML = Utils.tmpl(this.templates.list, this.config);
      
      var itemsTargetEl = holderEl.querySelector(this.options.itemsTarget);

      itemsTargetEl.innerHTML = renderPages.call(this);

      this.el.appendChild(itemsTargetEl);

      //we won't start the slick slider if there's no overflow of items
      //if user don't pass where nav dots should be, we render a placeholder
      if(moreThanOne){
        this.handleDots();
        this.startSlick(itemsTargetEl);
      }else{
        this.onReady();
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