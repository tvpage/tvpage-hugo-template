(function() {
    var body = document.body;
  
    var Carousel = function(el, options) {
      this.options = options || {};
      this.itemsPerPage = Utils.isset(this.options.items_per_page) ? this.options.items_per_page : null;
      this.loginId = (this.options.loginId || this.options.loginid) || 0;
      this.channel = this.options.channel || {};
      this.channelId = this.options.channelid || null;
      this.loading = false;
      this.eventPrefix = ("tvp_" + this.options.id).replace(/-/g, '_');
      this.el = 'string' === typeof el ? document.getElementById(el) : el;
      this.el.querySelector(".tvp-carousel-title").innerHTML = this.options.title_text || "Watch Videos";
      this.container = this.el.querySelector('.tvp-carousel-content');
      this.$carousel = null;
      this.itemMetaData = this.options.item_meta_data || null;
      this.onClick = Utils.isFunction(this.options.onClick) ? this.options.onClick : null;
  
      if (!!this.options.item_play_button_show_on_hover) {
        this.container.classList.add("show-on-hover");
      }
  
      if (!!this.options.item_meta_data) {
        this.el.classList.add("metadata");
      }
  
      if (!!this.options.background) {
        this.container.style.cssText += 'background-color:' + this.options.background + ';'
      }
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
  
        //Managing state in the carousel arrows?
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
  
      if ('undefined' === typeof $.fn.slick) {
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
      var params = channel.parameters || {};
      var src = this.options.api_base_url + '/channels/' + (channel.id || this.channelId) + '/videos?X-login-id=' + this.loginId;
      for (var p in params) {
        src += '&' + p + '=' + params[p];
      }
      var cbName = this.options.callbackName || 'tvp_' + Math.floor(Math.random() * 555);
      src += '&p=0' + '&n=' + this.itemsPerPage;
      src += '&o=' + this.options.videos_order_by + '&od=' + this.options.videos_order_direction;
      src += '&callback=' + cbName;
  
      var script = document.createElement('script');
      script.src = src;
  
      var that = this;
  
      window[cbName || 'callback'] = function(data) {
        that.data = data;
        callback(data);
        that.loading = false;
        if (that.onLoadEnd) {
          that.onLoadEnd();
        }
      };
      body.appendChild(script);
    };
  
    Carousel.prototype.initialize = function() {
  
      this.el.onclick = function(e) {
        var target = e.target;
  
        if (Utils.hasClass(target, 'tvp-video')) {
          var id = target.getAttribute('data-id'),
            selected = {};
          var data = that.data;
          for (var i = 0; i < data.length; i++) {
            if (data[i].id === id) {
              selected = data[i];
            }
  
          }
          if (that.onClick) {
            that.onClick(selected, data);
          }
  
          if (Utils.isIOS) {
            that.$carousel.slick('getSlick').options.tvpModalopened = true;
            window.modalOpened = true;
          }
        } else if (Utils.hasClass(target, 'tvp-carousel-arrow')) {
          if (Utils.hasClass(target, 'next')) {
            that.$carousel.slick('slickNext');
          } else {
            that.$carousel.slick('slickPrev');
          }
  
        }
      };
  
      var that = this;
  
      this.load(function(data) {
        var hasData = data.length > 0;
  
        if (hasData)
          that.render(data);
  
        Utils.sendMessage({
          event: that.eventPrefix + ":" + (hasData ? 'render' : 'norender')
        });
      });
  
      window.parent.addEventListener("message", function(e) {
        if (!e || !Utils.isset(e, 'data') || !Utils.isset(e.data, 'event') || that.eventPrefix + ':modal_close' !== e.data.event || !Utils.isIOS)
          return;
  
        that.$carousel.slick('getSlick').options.tvpModalopened = false;
        window.modalOpened = false;
      });
    };
  
    window.Carousel = Carousel;
  
  }());