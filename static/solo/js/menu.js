;(function(window, document) {

  var that,firstRender;

  function Menu(player, settings) {
    that = this;
    firstRender = true;

    this.settings = settings || {};
    this.player = player;
    this.playerEl = player.el;
    this.allVideos = [];
    this.page = 0;
    this.lastPage = false;
    this.isFetching = false;
    this.itemsPerPage = settings.items_per_page || 6;
  }

  Menu.prototype.initialize = function(){
      that.appendMenu();
      that.render(that.settings.channel.videos);
      that.bindClickEvents();
      that.bindLoadMoreEvent();
      that.listenToResize();
  };

  Menu.prototype.appendMenu = function(){
      var target = that.playerEl.firstChild.lastChild;
      if(target){
          var menuFrag = document.createDocumentFragment();
          that.slideMenu = document.createElement('div');
          that.slideMenu.setAttribute('id', 'tvp-slide-menu');
          that.slideMenu.innerHTML = that.settings.templates.menu;
          menuFrag.appendChild(that.slideMenu);
          target.parentNode.insertBefore(menuFrag, target.nextSibling);
      }
  };

  Menu.prototype.render = function(data) {
      if (!data || !data.length) return;

      that.lastPage = (!data.length || data.length < that.settings.items_per_page) ? true : false;
      var playlist = data || [],
          menuItemEl = '',
          noVideosEl = '';

      for(var i = 0; i < playlist.length; i++){
          var menuItem = playlist[i];
          menuItem.title = Utils.trimText(menuItem.title, 100);
          menuItem.duration = Utils.formatDuration(menuItem.duration);
          menuItem = that.setTagAttribute(that.settings,menuItem);
          if (!that.lastPage) {
              noVideosEl += '<div class="tvp-no-videos"></div>' 
          }
          menuItemEl += Utils.tmpl(that.settings.templates['menu-item'], menuItem);
          that.allVideos.push(menuItem);
      }
      that.hiddenMenu = that.slideMenu.querySelector('#tvp-hidden-menu');
      that.deleteDivs();
      that.hiddenMenu.innerHTML += menuItemEl+noVideosEl;
      if(firstRender){
          firstRender = false;
          that.setMenuHeight(that.playerEl.offsetHeight - 36);
          that.setActiveItem(that.allVideos[0].id)
          Ps.initialize(that.hiddenMenu);
      }
  };

  Menu.prototype.setTagAttribute = function(settings,menuItem){
    if (!Utils.isUndefined(settings.menu_item_play_category_tag_attribute)){
          var tagAttributeValue = menuItem[settings.menu_item_play_category_tag_attribute];
          if (tagAttributeValue) {
              tagAttributeValue = tagAttributeValue.replace(/_/g,' ');
              menuItem.menuTagAttr = tagAttributeValue;
          }
      }
      return menuItem;
  };

  Menu.prototype.bindLoadMoreEvent = function(e){
      that.hiddenMenu.addEventListener("scroll", Utils.debounce(function() {
        var menuTop = that.hiddenMenu.scrollTop,
            newHeight = that.hiddenMenu.clientHeight - that.hiddenMenu.scrollHeight,
            percentDocument = (menuTop*100)/newHeight;
        percentDocument = Math.round(percentDocument);
        percentDocument = Math.abs(percentDocument);
        if (percentDocument >= 55 && percentDocument <= 100) {
          that.loadMore();
        }
      },30));
  };

  Menu.prototype.bindClickEvents = function(){
      that.playerEl.addEventListener('click', function(e){
        var tvpHamburguer = Utils.getRealTargetByClass(e.target, 'tvp-hamburger'),
            tvpVideo = Utils.getRealTargetByClass(e.target, 'tvp-video');
            
        if (tvpHamburguer) {
           that.toggleMenu();
         }else if(tvpVideo){
          var id = tvpVideo.id.split('-').pop(),
              selected = that.allVideos.filter(function(v){return v.id === id});
          that.setActiveItem(id);
          that.player.play(that.player.buildAsset(selected[0]));
          that.toggleMenu();
         }
      });
  };

  Menu.prototype.loadMore = function() {
    if (this.lastPage || this.isFetching) return;

    this.page++;
    this.isFetching = true;
    var channel = this.settings.channel || {};

    Utils.loadScript({
      base: this.settings.api_base_url + '/channels/' + this.settings.channelId + '/videos',
      params: Utils.extend(channel.parameters || {}, {
        'X-login-id': this.settings.loginId,
        p: this.page,
        n: this.itemsPerPage
      })
    },function(data) {
      that.isFetching = false;
      that.lastPage = (!data.length || data.length < that.itemsPerPage) ? true : false;
      that.player.addAssets(data);
      that.render(data);
    });
  };

  Menu.prototype.toggleMenu = function() {
      that.slideMenu.classList.contains('active') ? that.slideMenu.classList.remove('active') : that.slideMenu.classList.add('active');
  };

  Menu.prototype.hideMenu = function(){
      that.slideMenu.classList.remove('active');
  };

  Menu.prototype.listenToResize = function() {
      window.removeEventListener('resize',resizingEvetns,false);
      window.addEventListener('resize',resizingEvetns,false);
      function resizingEvetns(e){
          var newSize = (that.playerEl.parentNode.offsetHeight - 36);
          that.setMenuHeight(newSize);
          Ps.update(that.hiddenMenu);
      };
  };

  Menu.prototype.setMenuHeight = function(height){
      that.hiddenMenu.style.cssText = 'height:' + height +'px;';
  };

  Menu.prototype.deleteDivs = function(){
      that.tvpNoVideos = that.tvpNoVideos ? that.tvpNoVideos : that.hiddenMenu.getElementsByClassName('tvp-no-videos');
      for (var i = that.tvpNoVideos.length - 1; i >= 0; i--){
          that.hiddenMenu.removeChild(that.tvpNoVideos[i]);
          Ps.update(that.hiddenMenu);
      }
  };

  Menu.prototype.clearActiveItems = function (video) {
      for (var i = video.length - 1; i >= 0; i--) {
          if(video[i].classList.contains('active')){
              video[i].classList.remove('active');
          }
      }
  };

  Menu.prototype.setActiveItem = function (id) {
      that.tvpVid =  document.querySelectorAll('.tvp-video');
      that.clearActiveItems(that.tvpVid);
      for (var i = that.tvpVid.length - 1; i >= 0; i--) {
          var item = that.tvpVid[i],
              itemId = item.id.split('-').pop();
          if (itemId === id && !item.classList.contains('active')){
              item.classList.add('active');
          }
      }
  };

  window.Menu = Menu;

}(window, document));