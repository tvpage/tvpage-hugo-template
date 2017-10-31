(function() {
  var body = document.body;

  var Carousel = function(el, options) {
    this.options = options || {};
    this.itemsPerPage = this.options.items_per_page || null;
    this.itemMetaData = this.options.item_meta_data || null;
    this.onClick = Utils.isFunction(this.options.onClick) ? this.options.onClick : null;
    this.channel = this.options.channel || {};
    this.loading = false;
    this.eventPrefix = options.eventPrefix;
    this.el = 'string' === typeof el ? document.getElementById(el) : el;
    this.container = this.el.querySelector('.carousel-content');
    this.$carousel = null;
  }
  
  Carousel.prototype.getHeight = function() {
    var opts = this.options;
    
    var navBulletsHeight = 0;
    if (opts.navigation_bullets || opts.mobile_navigation_bullets) {
      navBulletsHeight = parseInt(opts.navigation_bullets_margin_bottom, 10);
    }

    var heightOffset = 0;
    if (Utils.isset(opts.height_offset)) {
      heightOffset = parseInt(opts.height_offset, 10);
    }

    return (this.el.offsetHeight + navBulletsHeight + heightOffset) + 'px';
  };

  Carousel.prototype.getItemPlayButtonCenter = function(){
    var buttonRect = this.el.querySelector('.tvp-video-play').getBoundingClientRect();
    return Math.ceil(buttonRect.top + (buttonRect.height / 2));
  };

  Carousel.prototype.getArrowTopValue = function(arrow){
    var arrowSvg = arrow.querySelector("svg");
    var arrowSvgHeight = arrowSvg.clientHeight || arrowSvg.getBoundingClientRect().height;
    return Math.floor(this.getItemPlayButtonCenter() - (arrowSvgHeight / 2));
  };

  Carousel.prototype.updatePrevArrow = function(slick){
    var arrow = this.el.querySelector('.tvp-carousel-arrow.prev');

    arrow.style.top = this.getArrowTopValue(arrow) + "px";

    if(0 === slick.currentSlide){
      arrow.classList.add('inactive');
    }else{
      arrow.classList.remove('inactive');
    }
  };

  Carousel.prototype.updateNextArrow = function(slick){
    var arrow = this.el.querySelector('.tvp-carousel-arrow.next');

    arrow.style.top = this.getArrowTopValue(arrow) + "px";

    if (!slick.options.infinite && slick.currentSlide >= (slick.slideCount - slick.options.slidesToShow)){
      arrow.classList.add('inactive');
    } else {
      arrow.classList.remove('inactive');
    }
  };

  Carousel.prototype.reachedBulletsMax = function(){
    return Number(this.options.carousel_max_bullets) < this.data.length;
  };

  Carousel.prototype.getSlickConfig480 = function(){
    var options = this.options;

    return {
      breakpoint: 480,
      settings: {
        arrows: false,
        slidesToShow: Number(options.items_to_show_480),
        slidesToScroll: Number(options.items_to_scroll_480),
        dots: this.reachedBulletsMax() ? false : options.navigation_bullets_480,
        centerMode: options.carousel_center_mode_480,
        centerPadding: options.carousel_center_padding
      }
    };
  };

  Carousel.prototype.getSlickConfig667 = function(){
    var options = this.options;
    
    return {
      breakpoint: 667,
      settings: {
        slidesToShow: Number(options.items_to_show_667),
        slidesToScroll: Number(options.items_to_scroll_667),
        dots: this.reachedBulletsMax() ? false : options.navigation_bullets_667,
        arrows: false,
        centerMode: options.carousel_center_mode_667,
        centerPadding: options.carousel_center_padding
      }
    };
  };

  Carousel.prototype.getSlickConfig = function(){
    var options = this.options;
    var config = {
      slidesToShow: Number(options.items_to_show),
      slidesToScroll: Number(options.items_to_scroll),
      dots: this.reachedBulletsMax() ? false : options.navigation_bullets,
      infinite: options.infinite,
      arrows: false,
      responsive: [
        this.getSlickConfig480(),
        this.getSlickConfig667()
      ]
    };

    if (options.navigation_bullets_append_to) {
      config.appendDots = options.navigation_bullets_append_to;
    }

    return config;
  };

  Carousel.prototype.render = function() {
    var all = this.data.slice(0);
    var frag = document.createDocumentFragment();

    for (var i = 0; i < all.length; i++) {
      var item = all[i];

      item.title = Utils.trimText(item.title, Number(this.options.video_item_max_chars));
      item.mediaDuration = Utils.formatDuration(item.duration);
      item.publishedDate = Utils.formatDate(item.date_created);

      var rowEl = document.createElement('div');
      rowEl.innerHTML += Utils.tmpl(this.options.templates["carousel-item"], item);

      frag.appendChild(rowEl);
    }

    this.container.innerHTML = '';
    this.container.appendChild(frag);

    var that = this;
    var startSlick = function() {
      that.$carousel = $(that.container);
      
      that.$carousel.on('init', function(event, slick) {
        that.el.querySelector('.slick-list').style.margin = "0 -" + (parseInt(that.options.item_padding_right) + 1) + "px";

        //Clear the skeleton
        var skeleton = document.getElementById('skeleton');
        if(skeleton)
          skeleton.parentNode.removeChild(skeleton);
        
        that.el.classList.remove('hide');
      });

      that.$carousel.on('setPosition', Utils.debounce(function(event, slick) {
        // that.updatePrevArrow(slick);
        // that.updateNextArrow(slick);
        Utils.sendMessage({
          event: that.eventPrefix + ':resize',
          height: that.getHeight()
        });
      },100));

      that.$carousel.slick(that.getSlickConfig());
    };

    if (Utils.isUndefined($.fn.slick)) {
      $.ajax({
        dataType: 'script',
        cache: true,
        url: body.getAttribute('data-domain') + '/carousel/js/vendor/slick-min.js'
      }).done(function() {
        startSlick();
      });
    } else {
      startSlick();
    }
  };

  Carousel.prototype.load = function(callback) {
    this.loading = true;
    if (this.onLoad) {
      this.onLoad();
    }

    var channel = this.channel || {};
    var channelId = channel.id || this.options.channelid;

    Utils.loadScript({
      base: this.options.api_base_url + '/channels/' + channelId + '/videos',
      params: Utils.extend(channel.parameters || {}, {
        'X-login-id': this.options.loginId || this.options.loginid || 0,
        p: 0,
        n: this.itemsPerPage,
        o: this.options.videos_order_by,
        od: this.options.videos_order_direction,
        callback: 'tvpcallback'
      })
    });

    var that = this;
    window['tvpcallback'] = function(data) {
      that.data = data;
      callback(data);
      that.loading = false;
      if (that.onLoadEnd) {
        that.onLoadEnd();
      }
    };
  };

  Carousel.prototype.runTimeUpdates = function() {
    if (!!this.options.item_play_button_show_on_hover) {
      this.container.classList.add("show-on-hover");
    }

    if (!!this.options.background) {
      this.container.style.cssText += 'background-color:' + this.options.background + ';'
    }

    if (!!this.options.item_meta_data) {
      this.el.classList.add("metadata");
    }
  };

  Carousel.prototype.handleClick = function() {
    var that = this;
    this.el.addEventListener('click',function(e) {
      var target = e.target;

      if (Utils.hasClass(target, 'tvp-video')) {
        var id = target.getAttribute('data-id');
        var selected = {};
        var data = that.data;
        
        for (var i = 0; i < data.length; i++) {
          if (data[i].id === id)
            selected = data[i];
        }
        
        if (that.onClick) {
          that.onClick(selected, data);
        }
      }
      
      if (Utils.hasClass(target, 'tvp-carousel-arrow')) {
        if (Utils.hasClass(target, 'next')) {
          that.$carousel.slick('slickNext');
        } else {
          that.$carousel.slick('slickPrev');
        }
      }
    });
  };

  Carousel.prototype.initialize = function() {
    this.runTimeUpdates();
    this.handleClick();

    var that = this;
    var start = function(d){
      that.data = d;
      that.render();

      Utils.sendMessage({
        event: that.eventPrefix + ":render"
      });
    };

    if(Utils.hasKey(this.channel,'videos') && this.channel.videos.length) {
      start(this.channel.videos);
    } else {
      this.load(function(data) {
        if(data.length > 0){
          start(data);
        } else {
          Utils.sendMessage({
            event: that.eventPrefix + ":norender"
          });
        }
      });
    }
  };

  window.Carousel = Carousel;

}());