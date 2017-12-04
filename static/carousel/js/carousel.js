(function() {
  var body = document.body;

  var Carousel = function(el, options) {
    this.options = options || {};
    this.itemsPerPage = Utils.isUndefined(this.options.items_per_page) ? null : this.options.items_per_page;
    this.channel = this.options.channel || {};
    this.loading = false;
    this.eventPrefix = ("tvp_" + this.options.id).replace(/-/g, '_');
    this.el = 'string' === typeof el ? document.getElementById(el) : el;
    this.container = this.el.querySelector('.tvp-carousel-content');
    this.$carousel = null;
    this.itemMetaData = this.options.item_meta_data || null;
    this.onClick = Utils.isFunction(this.options.onClick) ? this.options.onClick : null;
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

  Carousel.prototype.centerArrows = function(slick) {
    var playButtonRect = this.el.querySelector('.tvp-video-play').getBoundingClientRect();
    var playButtonCenter = Math.ceil(playButtonRect.top + (playButtonRect.height / 2));
    var arrows = document.querySelectorAll(".tvp-carousel-arrow");
    
    for (var i = 0; i < arrows.length; i++) {
      var arrow = arrows[i];

      var arrowSvg = arrow.querySelector("svg");
      arrow.style.top = Math.floor(playButtonCenter - ((arrowSvg.clientHeight || arrowSvg.getBoundingClientRect().height) / 2)) + "px";

      if (i === 0) {
        if (slick.currentSlide === 0) {
          arrow.classList.add('inactive');
        } else {
          arrow.classList.remove('inactive');
        }
      } else if (!this.options.infinite && i === 1) {
        var lastSlide = slick.currentSlide >= slick.slideCount - slick.options.slidesToShow;
        lastSlide ? arrow.classList.add('inactive') : arrow.classList.remove('inactive');
      }
    }
  };

  Carousel.prototype.getSlickConfig = function(){
    var centerPadding = this.options.carousel_center_padding;
    var reachMax = Number(this.options.carousel_max_bullets) < this.data.length;
    
    var config = {
      slidesToShow: Number(this.options.items_to_show),
      slidesToScroll: Number(this.options.items_to_scroll),
      dots: reachMax ? false : this.options.navigation_bullets,
      infinite: this.options.infinite,
      arrows: false,
      responsive: [{
        breakpoint: 480,
        settings: {
          arrows: false,
          slidesToShow: Number(this.options.items_to_show_480),
          slidesToScroll: Number(this.options.items_to_scroll_480),
          dots: reachMax ? false : this.options.navigation_bullets_480,
          centerMode: this.options.carousel_center_mode_480,
          centerPadding: centerPadding
        }
      }, {
        breakpoint: 667,
        settings: {
          slidesToShow: Number(this.options.items_to_show_667),
          slidesToScroll: Number(this.options.items_to_scroll_667),
          dots: reachMax ? false : this.options.navigation_bullets_667,
          arrows: false,
          centerMode: this.options.carousel_center_mode_667,
          centerPadding: centerPadding
        }
      }]
    };

    if (this.options.navigation_bullets_append_to) {
      config.appendDots = this.options.navigation_bullets_append_to;
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

    //Start slick carousel
    var that = this;
    var startSlick = function() {
      that.$carousel = $(that.container);
      
      that.$carousel.on('init', function(event, slick) {
        that.el.querySelector('.slick-list').style.margin = "0 -" + (parseInt(that.options.item_padding_right) + 1) + "px";
      });

      that.$carousel.on('setPosition', Utils.debounce(function(event, slick) {
        that.centerArrows(slick);
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
        setTimeout(startSlick, 100);
      });
    } else {
      setTimeout(startSlick, 100);
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
    this.el.querySelector(".tvp-carousel-title").innerHTML = this.options.title_text || "Watch Videos";
    
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

    this.load(function(data) {
      var hasData = data.length > 0;
      if (hasData)
        that.render(data);

      Utils.sendMessage({
        event: that.eventPrefix + ":" + (hasData ? 'render' : 'norender')
      });
    });
  };

  window.Carousel = Carousel;

}());