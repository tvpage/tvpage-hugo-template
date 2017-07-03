;(function(window, document) {

  var isFunction = function(obj) {
    return 'function' === typeof obj;
  };

  function Grid(el, options) {
    this.options = options || {};
    this.windowSize = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) <= 200 ? 'small' : 'medium';
    this.initialResize = true;
    this.eventPrefix = "tvp_" + (options.id || "").trim().replace(/-/g,'_');
    var isSmall = this.windowSize == 'small';
    this.itemsPerPage = isSmall ? 2 : (options.items_per_page || 6);
    this.itemsPerRow = isSmall ? 1 : (options.items_per_row || 2);
    this.loginId = (options.loginId || options.loginid) || 0;
    this.channel = options.channel || {};
    this.channelId = (options.channelid || options.channelId) || null;
    this.loading = false;
    this.isLastPage = false;
    this.page = 0;

    this.el = 'string' === typeof el ? document.getElementById(el) : el;
    this.loadBtn = this.el.querySelector('.tvp-sidebar-load');
    this.container = this.el.querySelector('.tvp-sidebar-container');
    this.sidebarTitle = this.el.querySelector('.tvp-sidebar-title');
    this.onLoad = options.onLoad && isFunction(options.onLoad) ? options.onLoad : null;
    this.onLoadEnd = options.onLoadEnd && isFunction(options.onLoadEnd) ? options.onLoadEnd : null;
    this.onItemClick = options.onItemClick && isFunction(options.onItemClick) ? options.onItemClick : null;
    this.customStyle = function(className, property, code){
        if(document.getElementsByClassName(className).length==0){
          return;
        }
        switch (property){
          case "color":
            var elements =document.getElementsByClassName(className);
            for (var i = 0; i < elements.length; i++) {
              elements[i].style.color = code;
            }
            
            break;
          case "font-size":
            var elements = document.getElementsByClassName(className);
            for (var i = 0; i < elements.length; i++) {
              elements[i].style.fontSize = code;
            }
            break;
          case "font-weight":
            var elements = document.getElementsByClassName(className);
            for (var i = 0; i < elements.length; i++) {
              elements[i].style.fontWeight = code;
            }
            break;
          case "padding":
            var elements = document.getElementsByClassName(className);
            for (var i = 0; i < elements.length; i++) {
              elements[i].style.padding = code;
            }
            break;
          case "font-family":
            var elements = document.getElementsByClassName(className);
            for (var i = 0; i < elements.length; i++) {
              elements[i].style.fontFamily = code;
            }
            break;
          case "background":
            if(code!=="none" && code!==undefined){
              var elements = document.getElementsByClassName(className);
              for (var i = 0; i < elements.length; i++) {
                elements[i].style.background = code;
              }
            }
            break;
          case "text-align":
            var elements = document.getElementsByClassName(className);
            for (var i = 0; i < elements.length; i++) {
              elements[i].style.textAlign = code;
            }
            break;
        }
    }
    this.getCustomStyle = function(){
        var validOption = {
          item_title_color : {
            class:"tvp-video-title",
            property : "color"
          },
          item_title_font_size : {
            class:"tvp-video-title",
            property : "font-size"
          },
          item_title_font_family : {
            class:"tvp-video-title",
            property : "font-family"
          },
          item_title_font_weight : {
            class:"tvp-video-title",
            property : "font-weight"
          },
          item_title_padding : {
            class:"tvp-video-title",
            property : "padding"
          },
          item_title_background : {
            class:"tvp-video-title",
            property : "background"
          },
          item_title_text_align : {
            class:"tvp-video-title",
            property : "text-align"
          },
          item_author_color : {
            class:"tvp-video-author",
            property : "color"
          },
          item_author_font_size : {
            class:"tvp-video-author",
            property : "font-size"
          },
          item_author_font_family : {
            class:"tvp-video-author",
            property : "font-family"
          },
          item_author_font_weight : {
            class:"tvp-video-author",
            property : "font-weight"
          },
          item_author_padding : {
            class:"tvp-video-author",
            property : "padding"
          },
          item_author_background : {
            class:"tvp-video-author",
            property : "background"
          },
          item_author_text_align : {
            class:"tvp-video-author",
            property : "text-align"
          },
          item_views_color : {
            class:"tvp-video-views",
            property : "color"
          },
          item_views_font_size : {
            class:"tvp-video-views",
            property : "font-size"
          },
          item_views_font_family : {
            class:"tvp-video-views",
            property : "font-family"
          },
          item_views_font_weight : {
            class:"tvp-video-views",
            property : "font-weight"
          },
          item_views_padding : {
            class:"tvp-video-views",
            property : "padding"
          },
          item_views_background : {
            class:"tvp-video-views",
            property : "background"
          },
          item_views_text_align : {
            class:"tvp-video-views",
            property : "text-align"
          },
        }
        for (option in this.options) {
          if(option in validOption){
            this.customStyle(validOption[option].class,validOption[option].property,options[option]);
          }
        }
    }

    this.render = function(){
      this.container.innerHTML = '';

      if (options.title_text && options.title_text.trim().length) {
        this.sidebarTitle.innerHTML = options.title_text;
      } else {
        this.sidebarTitle.parentNode.removeChild(this.sidebarTitle);
      }

      var all = this.data.slice(0),
          pages = [];

      while (all.length) {
        pages.push(all.splice(0, this.itemsPerPage));
      }
      
      for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        var pageRows = [];
        while (page.length) {
          pageRows.push(page.splice(0, this.itemsPerRow));
        }

        var pageFrag = document.createDocumentFragment();
        for (var j = 0; pageRows.length > j; j++) {
          
          var rowEl = document.createElement('div');
          rowEl.classList.add('tvp-clearfix');

          var row = pageRows[j];
          for (var k = 0; k < row.length; k++) {
            var item = row[k];
            var className = '';

            if ('undefined' !== typeof item.entity) {
              className += ' tvp-exchange';
            }

            if (that.windowSize === 'medium' && this.itemsPerRow > 1) {
              className += ' col-6';
            }

            item.className = className;
            var template = options.templates['sidebar-item'];
            if(item.asset){
              item.asset.views = item.asset.views ? (item.asset.views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" Views") : "";
            }
            item.title = Utils.trimText(item.title,50);
            rowEl.innerHTML += Utils.tmpl(template, item);
          }

          pageFrag.appendChild(rowEl);
        }

        this.container.appendChild(pageFrag);
        this.getCustomStyle();
        if (window.parent) {
          window.parent.postMessage({
            event: this.eventPrefix + ':render',
            height: this.el.offsetHeight + 'px'
          }, '*');
        }
      }
    };

    var that = this;
    this.load = function(callback){
      that.loading = true;
      if (this.onLoad) {
        this.onLoad();
      }

      var channel = that.channel || {};
      var params = channel.parameters || {};
      var src = this.options.api_base_url + '/channels/' + (channel.id || that.channelId) + '/videos?X-login-id=' + that.loginId;
      for (var p in params) {
        src += '&' + p + '=' + params[p];
      }
      var cbName = options.callbackName || 'tvp_' + Math.floor(Math.random() * 555);
      src += '&p=' + that.page + '&n=' + that.itemsPerPage + '&callback='+cbName;
      var script = document.createElement('script');
      script.src = src;
      window[cbName || 'callback'] = function(data){
        if ( !data.length || (data.length < that.itemsPerPage) ) {
          that.isLastPage = true;
        }

        that.data = data;
        callback(data);
        that.loading = false;
        if (that.onLoadEnd) {
          that.onLoadEnd();
        }
      };
      document.body.appendChild(script);
    };

    this.next = function(){
      if (this.isLastPage) {
        this.page = 0;
        this.isLastPage = false;
      } else {
        this.page++;
      }
    };

    this.resize = function(){
      var newSize = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) <= 200 ? 'small' : 'medium';
      var notify = function(){
        if (that.initialResize) return;
        if (window.parent) {
          window.parent.postMessage({
            event: that.eventPrefix + ':resize',
            height: that.el.offsetHeight + 'px'
          }, '*');
        }
      };
      if (that.windowSize !== newSize) {
        that.windowSize = newSize;
        var isSmall = newSize === 'small';
        that.itemsPerPage = isSmall ? 2 : (options.itemsPerPage || 6);
        that.itemsPerRow = isSmall ? 1 : (options.itemsPerRow || 2);
        //reset page to 0 if we detect a resize, so we don't have trouble loading the grid
        that.page = 0;
        that.isLastPage = false;
        
        that.load(function(){
          that.render();
          notify();
        });
      } else {
        notify();
      }
      that.initialResize = false;
    };

    this.el.onclick = function(e) {
      var target = e.target;
      if (!target.classList.contains('tvp-video')) return;

      var id = target.id.split('-').pop(),
          selected = {};

      var data = that.data;
      for (var i = 0; i < data.length; i++) {
        if (data[i].id === id) {
          selected = data[i];
        }
      }

      if (window.parent) {
        window.parent.postMessage({
          runTime: 'undefined' !== typeof window.__TVPage__ ? __TVPage__ : null,
          event: that.eventPrefix + ':video_click',
          selectedVideo: selected,
          videos: data
        }, '*');
      }
    };

    this.loadBtn.onclick = function() {
      if (that.loading) return;
      that.next();
      that.load(function(data){
        if (data.length) {
          that.render(data);
        } else {
          that.next();
          that.load(function(nextData){
            that.render(nextData);
          });
        }
      });
    };

    //By default at Grid creation we load & render.
    this.load(function(data){
      var postEvent = '';
      if (data.length) {
        that.render(data);
        
        if (window.parent) {
          window.parent.postMessage({
            event: that.eventPrefix + ':render'
          }, '*');
        }
      }
    });

    window.addEventListener('resize', Utils.debounce(this.resize,100));
  }

  window.Grid = Grid;

}(window, document));