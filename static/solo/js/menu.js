(function() {
  
    var Menu = function(player, options) {
      this.options = options || {};
      this.player = player;
      
      var body = document.body;

      this.allVideos = [];
      this.page = 0;
      this.lastPage = false;
      this.isFetching = false;
      this.itemsPerPage = 6;
      this.categoryTagAttribute = Utils.isUndefined(this.options.menu_item_play_category_tag_attribute) ? null : this.options.menu_item_play_category_tag_attribute;
    };

    Menu.prototype.cacheDOM = function() {
      this.hiddenMenu = document.getElementById('tvp-hidden-menu');
      this.scrollMenu = document.querySelectorAll('.ss-content')[0];
      this.tvpVid = document.querySelectorAll('.tvp-video');
      this.hamburguer = document.getElementById('tvp-hamburger-container');
      this.toggles = document.querySelectorAll('.tvp-hamburger');
      this.payerCont = document.querySelectorAll('.tvp-player')[0];
      this.noVideosContainer = document.getElementById('tvp-no-videos-container');
      this.tvpNoVideos = document.getElementsByClassName('tvp-no-videos');
      this.scrollBar = document.getElementsByClassName('ss-scroll')[0];
      this.slideMenu = document.getElementById('tvp-slide-menu');
    };

    Menu.prototype.renderCategoryValue = function(item,detailsEl){
      if (this.categoryTagAttribute) {
        var attrValue = item[this.categoryTagAttribute];
        if (attrValue) {
          attrValue = attrValue.replace(/_/g, ' ');
          var categoryEl = document.createElement('div');
          categoryEl.className = 'tvp-category-tag';
          categoryEl.innerHTML += attrValue;
          detailsEl.appendChild(categoryEl);
        }
      }
    };

    Menu.prototype.renderNoVideos = function(target){
      var div = document.createElement('div');
      div.className = 'tvp-no-videos';
      target.appendChild(div);
    };

    Menu.prototype.render = function() {
      var menuList = this.options.data || [];
      
      var menuListLength = menuList.length;
      if (menuListLength < 1)
        return;

      this.renderFullScreenMenu();
      
      var menuListEl = document.createElement('div');
      menuListEl.className = 'tvp-clearfix';

      var noVideosEl = document.createElement('div');
      noVideosEl.id = 'tvp-no-videos-container';

      var menuHidden = document.getElementById('tvp-hidden-menu');
      menuHidden.appendChild(noVideosEl);
      menuHidden.insertBefore(menuListEl, noVideosEl);
      menuHidden.style.cssText = 'height:' + (document.getElementById('tvp-player-el-' + this.options.id).offsetHeight - 40) + 'px;';
      
      var videoDetails = document.getElementsByClassName('tvp-video-details');

      for (var i = 0; i < menuListLength; i++) {
        var menuItem = menuList[i];
        
        this.allVideos.push(menuItem);
        
        menuItem.title = Utils.trimText(menuItem.title, 100);
        menuItem.duration = Utils.formatDuration(menuItem.duration);
        menuListEl.innerHTML += Utils.tmpl(this.options.templates['menu-item'], menuItem);
        
        this.renderCategoryValue(menuItem,videoDetails[i]);

        if (menuListLength > 4)
          this.renderNoVideos(noVideosEl);
      }
      
      SimpleScrollbar.initAll();
    };

    Menu.prototype.bindMenuEvent = function() {
      var that = this;
      for (var i = this.toggles.length - 1; i >= 0; i--) {
        this.toggles[i].onclick = function() {
          var playerAsset = that.player.assets[that.player.current];
          that.setActiveItem(playerAsset.assetId);
          that.toggleMenu();
        };
      }
    };

    Menu.prototype.loadMore = function() {
      if (this.lastPage || this.isFetching)
        return;

      this.page++;
      this.isFetching = true;

      var channel = this.options.channel || {};

      Utils.loadScript({
        base: this.options.api_base_url + '/channels/' + this.options.channelId + '/videos',
        params: Utils.extend(channel.parameters || {}, {
          'X-login-id': this.options.loginId,
          p: this.page,
          n: this.itemsPerPage,
          callback: 'tvpcallback'
        })
      });
      var that = this;
      window['tvpcallback'] = function(data) {
        that.isFetching = false;
        that.lastPage = (!data.length || data.length < that.itemsPerPage) ? true : false;
        that.player.addAssets(data);
        that.update(data);
      };
    };

    Menu.prototype.bindLoadMoreEvent = function(e) {
      var that = this;
      this.scrollMenu.addEventListener("scroll", Utils.debounce(function() {
        var menuTop = that.scrollMenu.scrollTop,
          newHeight = that.hiddenMenu.clientHeight - that.scrollMenu.scrollHeight,
          percentDocument = (menuTop * 100) / newHeight;
        percentDocument = Math.round(percentDocument);
        percentDocument = Math.abs(percentDocument);
        if (percentDocument >= 50 && percentDocument <= 100) {
          that.loadMore()
        }
      }, 30));
    };

    Menu.prototype.bindClickEvent = function() {
      for (var i = this.tvpVid.length - 1; i >= 0; i--) {
        this.videoClick(this.tvpVid[i]);
      }
    };

    Menu.prototype.toggleMenu = function() {
      this.slideMenu.classList.contains('active') ? this.slideMenu.classList.remove('active') : this.slideMenu.classList.add('active');
    };

    Menu.prototype.hideMenu = function() {
      this.slideMenu.classList.remove('active');
    };

    Menu.prototype.hideMenuEvents = function() {
      var overlay = document.getElementsByClassName('tvp-overlay')[0];
      if (overlay) {
        overlay.onclick = function() {
          this.hideMenu();
        };
      }
    };

    Menu.prototype.renderFullScreenMenu = function() {
      var playerEl = document.getElementById('tvp-player-el-' + this.options.id);
      var iframe = playerEl.querySelector('iframe');
      var menuEl = document.createElement('div');
      menuEl.id = 'tvp-slide-menu';
      menuEl.innerHTML = this.options.templates.menu;
      iframe.parentNode.insertBefore(menuEl, iframe.nextSibling);
    };

    Menu.prototype.listenToResize = function() {
      window.removeEventListener('resize', resizingEvetns, false);
      window.addEventListener('resize', resizingEvetns, false);

      function resizingEvetns() {
        var newSize = (this.payerCont.clientHeight - 40) + 'px;';
        this.hiddenMenu.style.cssText = 'height:' + newSize;
        var totalHeight = this.scrollMenu.scrollHeight,
          ownHeight = this.scrollMenu.clientHeight,
          scrollRatio = ownHeight / totalHeight;
        this.scrollBar.style.cssText += 'height:' + Math.floor((scrollRatio) * 100) + '%;top:' + (this.scrollMenu.scrollTop / totalHeight) * 100 + '%;right:-' + (this.hiddenMenu.clientWidth - 9) + 'px;';
      };
    };

    Menu.prototype.update = function(newData) {
      var playlist = this.options.data || [],
        menuItem;

      if (this.noVideosContainer) {
        this.deleteDivs();
        for (var i = 0; i < newData.length; i++) {
          menuItem = playlist[i];
          this.allVideos.push(newData[i]);
          this.options.data.push(newData[i]);
          this.noVideosContainer.setAttribute('id', 'tvp-clearfix');
          newData[i].duration = Utils.formatDuration(newData[i].duration);
          this.noVideosContainer.innerHTML += Utils.tmpl(this.options.templates['menu-item'], newData[i]);
          this.scrollMenu.appendChild(this.noVideosContainer);
          if (Utils.isset(this.options, 'menu_item_play_category_tag_attribute') && ("" + this.options.menu_item_play_category_tag_attribute).trim().length) {
            var tagAttribute = this.options.menu_item_play_category_tag_attribute;
            var tagAttributeValue = newData[i][this.options.menu_item_play_category_tag_attribute];
            if (tagAttributeValue) {
              tagAttributeValue = tagAttributeValue.replace(/_/g, ' ');
              var categoryFrag = document.createDocumentFragment(),
                categoryDiv = document.createElement('div');
              categoryDiv.classList.add('tvp-category-tag');
              categoryDiv.innerHTML += tagAttributeValue;
              categoryFrag.appendChild(categoryDiv);
              this.noVideosContainer.getElementsByClassName('tvp-video-details')[i].appendChild(categoryFrag);
            }
          }
        }
      } else {
        var newVivFrag = document.createDocumentFragment(),
          newDiv = document.createElement('div');
        for (var i = 0; i < newData.length; i++) {
          menuItem = playlist[i];
          this.allVideos.push(newData[i]);
          this.options.data.push(newData[i]);
          newDiv.setAttribute('id', 'tvp-clearfix');
          newData[i].duration = Utils.formatDuration(newData[i].duration);
          newDiv.innerHTML += Utils.tmpl(this.options.templates['menu-item'], newData[i]);
          newVivFrag.appendChild(newDiv);

          this.scrollMenu.appendChild(newDiv);
          if (Utils.isset(this.options, 'menu_item_play_category_tag_attribute') && ("" + this.options.menu_item_play_category_tag_attribute).trim().length) {
            var tagAttribute = this.options.menu_item_play_category_tag_attribute;
            var tagAttributeValue = newData[i][this.options.menu_item_play_category_tag_attribute];
            if (tagAttributeValue) {
              tagAttributeValue = tagAttributeValue.replace(/_/g, ' ');
              var categoryFrag = document.createDocumentFragment(),
                categoryDiv = document.createElement('div');
              categoryDiv.classList.add('tvp-category-tag');
              categoryDiv.innerHTML += tagAttributeValue;
              categoryFrag.appendChild(categoryDiv);
              newDiv.getElementsByClassName('tvp-video-details')[i].appendChild(categoryFrag);
            }
          }
        }
      }
      this.cacheDOM();
      this.bindClickEvent();
    };

    Menu.prototype.deleteDivs = function() {
      for (var i = this.tvpNoVideos.length - 1; i >= 0; i--) {
        this.noVideosContainer.removeChild(this.tvpNoVideos[i]);
      }
    };

    Menu.prototype.clearActiveItems = function() {
      for (var i = this.tvpVid.length - 1; i >= 0; i--) {
        if (this.tvpVid[i].classList.contains('active')) {
          this.tvpVid[i].classList.remove('active');
        }
      }
    };

    Menu.prototype.setActiveItem = function(id) {
      for (var i = this.tvpVid.length - 1; i >= 0; i--) {
        var item = this.tvpVid[i],
          itemId = item.id.split('-').pop();
        if (itemId === id && !item.classList.contains('active')) {
          this.clearActiveItems();
          item.classList.add('active');
        }
      }
    };

    Menu.prototype.videoClick = function(vids) {
      var that = this;
      vids.onclick = function() {
        if (!this.classList.contains('tvp-video')) return;

        that.clearActiveItems();
        this.classList.add('active');

        var id = this.id.split('-').pop(),
          selected = that.allVideos.filter(function(v) {
            return v.id === id
          });

        that.player.play(that.player.buildAsset(selected[0]));
        that.toggleMenu();
      };
    };

    Menu.prototype.initialize = function(){
      this.render();
      this.cacheDOM();
      this.bindMenuEvent();
      this.bindClickEvent();
      this.bindLoadMoreEvent();
      this.hideMenuEvents();
      this.listenToResize();
    };
  
    window.Menu = Menu;
  
  }());
  