;(function(window, document) {

  var that,firstRender;

  function Menu(player, modal, productsRail, settings) {
    that = this;
    firstRender = true;

    this.settings = settings || {};
    this.player = player;
    this.productsRail = productsRail;
    this.playerEl = player.el;
    this.allVideos = [];
    this.modal = modal;
    this.page = 1;
    this.lastPage = false;
    this.isFetching = false;
    this.itemsPerPage = settings.menu_items_per_page || 6;
    this.settings.channel.videos.forEach(function(video){that.allVideos.push(video)});
  }

  Menu.prototype.init = function(){
    var firstBatch = JSON.parse(JSON.stringify(that.allVideos));
    that.appendMenu();
    that.render(firstBatch.slice(0, that.itemsPerPage));
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
          that.slideMenu.innerHTML = that.settings.templates.menu['base'];
          menuFrag.appendChild(that.slideMenu);
          target.parentNode.insertBefore(menuFrag, target.nextSibling);
      }
  };

  Menu.prototype.render = function(data) {
      if (!data || !data.length) return;

      var playlist = data || [], menuItemEl = noVideosEl = '';

      for(var i = 0; i < playlist.length; i++){
          var menuItem = playlist[i];
          menuItem.title = Utils.trimText(menuItem.title, 100);
          menuItem.duration = Utils.formatDuration(menuItem.duration);
          menuItem = that.setTagAttribute(that.settings,menuItem);
          if (!that.lastPage) {
              noVideosEl += '<div class="tvp-no-videos"></div>' 
          }
          menuItemEl += Utils.tmpl(that.settings.templates.menu['item'], menuItem);
      }
      that.hiddenMenu = that.slideMenu.querySelector('#tvp-hidden-menu');
      that.deleteDivs();
      that.hiddenMenu.innerHTML += menuItemEl+noVideosEl;
      if(firstRender){
          firstRender = false;
          that.setMenuHeight(that.playerEl.offsetHeight - ((Utils.isMobile || window.innerWidth < 768 ) ? 44 : 36));
          that.setActiveItem(that.allVideos[0].id)
          Ps.initialize(that.hiddenMenu);
      }
    that.page++;
  };

  Menu.prototype.setTagAttribute = function(settings,menuItem){
      if (Utils.isset(settings, 'menu_item_play_category_tag_attribute')) {
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
        if (percentDocument >= 55 && percentDocument <= 100)that.loadMore();
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
          that.modal.updateTitle(selected[0].title);
          if(that.settings.merchandise){
            that.productsRail.endpoint = that.settings.api_base_url + '/videos/' + id + '/products';
            that.productsRail.load('render');
          }
          that.player.play(that.player.buildAsset(selected[0]));
          that.toggleMenu();
         }
      });
  };

  Menu.prototype.loadMore = function() {
    if (that.lastPage || that.isFetching) return;
    that.isFetching = true;
    var channel = that.settings.channel || {}, paginatedData = [];
    for (var i = (that.page-1) * that.itemsPerPage; i < (that.page * that.itemsPerPage); i++) {
        if (typeof that.allVideos[i] === 'undefined') break;
        paginatedData.push(that.allVideos[i]);
    }
    that.lastPage = (!paginatedData.length || paginatedData.length < that.itemsPerPage) ? true : false;
    that.isFetching = false;
    that.render(paginatedData);
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
          var newSize = (that.playerEl.parentNode.offsetHeight - ((Utils.isMobile || window.innerWidth < 768) ? 44 : 36));
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
          if(video[i].classList.contains('active')) video[i].classList.remove('active');
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