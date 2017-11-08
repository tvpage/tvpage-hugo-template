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
    this.itemClass = '.carousel-item';
    this.full = this.options.full || false;
    this.el = document.getElementById(sel);
  };

  Carousel.prototype.getSlickConfig = function(){
    var options = this.options;
    var isMaxBullets = Number(this.options.carousel_max_bullets) < this.data.length;

    var slickConfig = {
      slidesToShow: this.options.slidesToShow,
      slidesToScroll: this.options.slidesToScroll,
      dots: isMaxBullets ? false : this.config.navigation_bullets,
      infinite: this.options.infinite || false,
      arrows: true
    };

    if(!!this.options.responsive && this.options.responsive.length){
      slickConfig.responsive = this.options.responsive;
    }

    if (this.config.navigation_bullets_append_to) {
      slickConfig.appendDots = this.config.navigation_bullets_append_to;
    }

    return slickConfig;
  };

  Carousel.prototype.handleClick = function() {    
    var that = this;
    var items = this.el.querySelectorAll(this.itemClass);
    var itemsLength = items.length;

    var onClick = Utils.isFunction(onClick) ? onClick : function(e){
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

  Carousel.prototype.start = function(){
    var that = this;
    var startSlick = function() {
      that.$slickEl = $(that.itemsTargetEl);
      
      that.$slickEl.on('init', function(event, slick) {
        if(that.config.debug) {
          console.log('carousel el initialized: ', that.itemsTargetEl, performance.now() - startTime);
        }

        that.onReady();
      });

      that.$slickEl.on('afterChange', function(event, slick){
        console.log('# Slick "afterChange" was called!');

        //prob not the best place to have this
        // if(!this.full){
        //   that.loadNext('render');
        // }
      });

      that.$slickEl.on('setPosition', function(event, slick){
        
        //Needs to be generic
        //var imageIcon = that.el.querySelector('.video-image-icon');

        //if(imageIcon){

          //the reference?
          //var imageIconRect = imageIcon.getBoundingClientRect();  
          //var iconCenter = Math.floor(imageIconRect.top + (imageIconRect.height / 2));

          //Remove the carousel's top
          //iconCenter = iconCenter - that.el.getBoundingClientRect().top;

          // var arrows = that.el.querySelectorAll('.slick-arrow');
          // var arrowsLength = arrows.length;
  
          // for (var i = 0; i < arrowsLength; i++) {
          //   var arrow = arrows[i];
          //   arrow.style.top = iconCenter - (arrow.getBoundingClientRect().height / 2) + 'px';
          //   arrow.style.opacity = 1;
          //   arrow.style.visibility = 'visible';
          // }
        //}

        var arrows = that.el.querySelectorAll('.slick-arrow');
        var arrowsLength = arrows.length;

        for (var i = 0; i < arrowsLength; i++) {
          var arrow = arrows[i];
          //arrow.style.top = iconCenter - (arrow.getBoundingClientRect().height / 2) + 'px';
          arrow.style.opacity = 1;
          arrow.style.visibility = 'visible';
        }

        Utils.sendMessage({
          event: that.eventPrefix + ':resize',
          height: Utils.getWidgetHeight()
        });

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
        var html = '';

        for (var i = 0; i < pages.length; i++) {
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
