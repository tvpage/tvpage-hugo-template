;(function(window, document) {

  var that,firstRender;

  function Playlist(player, modal, productsRail, settings) {
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
    this.skeletonEl = Utils.getById('skeleton');
    this.productsEnabled = settings.merchandise;
    this.isFetching = false;
    this.itemsPerPage = settings.menu_items_per_page || 6;
    this.settings.channel.videos.forEach(function(video){that.allVideos.push(video)});
  }

  Playlist.prototype.init = function(){
    var firstBatch = JSON.parse(JSON.stringify(that.allVideos));
    that.appendPlaylist();
    that.render(firstBatch.slice(0, that.itemsPerPage));
    that.bindClickEvents();
    that.bindLoadMoreEvent();
  };

  Playlist.prototype.appendPlaylist = function(){
      var target = document.getElementsByClassName('modal-content')[0];
      if(target){
          var plFrag = document.createDocumentFragment();
          that.plMenu = document.createElement('div');
          that.plMenu.setAttribute('id', 'tvp-playlist-menu');
          that.plMenu.innerHTML = that.settings.templates.playlist['base'];
          plFrag.appendChild(that.plMenu);
          target.appendChild(plFrag);
      }
  };

  Playlist.prototype.render = function(data) {
      if (!data || !data.length) {
        that.deleteDivs();
        return;
      };
      var playlist = data || [], plItemEl = noVideosEl = '';
      for(var i = 0; i < playlist.length; i++){
          var plItem = playlist[i];
          plItem.title = Utils.trimText(plItem.title, 100);
          plItem.duration = Utils.formatDuration(plItem.duration);
          plItem = that.setTagAttribute(that.settings,plItem);
          if (!that.lastPage && data.length > 4) noVideosEl += '<div class="tvp-no-videos"></div>';
          plItemEl += Utils.tmpl(that.settings.templates.playlist['item'], plItem);
      }
      that.plScroller = that.plMenu.querySelector('#tvp-playlist-scroller');
      that.deleteDivs();
      that.plScroller.innerHTML += plItemEl+noVideosEl;
      if(firstRender){
          firstRender = false;
          that.setActiveItem(that.allVideos[0].id)
          Ps.initialize(that.plScroller);
      }
    that.page++;
  };

  Playlist.prototype.setTagAttribute = function(settings,plItem){
      if (Utils.isset(settings, 'menu_item_play_category_tag_attribute')) {
          var tagAttributeValue = plItem[settings.menu_item_play_category_tag_attribute];
          if (tagAttributeValue) {
              tagAttributeValue = tagAttributeValue.replace(/_/g,' ');
              plItem.menuTagAttr = tagAttributeValue;
          }
      }
      return plItem;
  };

  Playlist.prototype.bindLoadMoreEvent = function(e){
      that.plScroller.addEventListener("scroll", Utils.debounce(function() {
        var plTop = that.plScroller.scrollTop,
            newHeight = that.plScroller.clientHeight - that.plScroller.scrollHeight,
            percentDocument = (plTop*100)/newHeight;
        percentDocument = Math.round(percentDocument);
        percentDocument = Math.abs(percentDocument);
        if (percentDocument >= 55 && percentDocument <= 100) that.loadMore();
      },30));
  };

  Playlist.prototype.bindClickEvents = function(){
      that.modal.el.addEventListener('click', function(e){
        var tvpVideo = Utils.getRealTargetByClass(e.target, 'tvp-video');
        if (tvpVideo) {
          var id = tvpVideo.id.split('-').pop(),
              selected = that.allVideos.filter(function(v){return v.id === id});
          that.setActiveItem(id);
          that.modal.updateTitle(selected[0].title);
          if(that.productsEnabled){
            that.productsRail.endpoint = that.settings.api_base_url + '/videos/' + id + '/products';
            that.productsRail.load('render');

            that.productsRail.onNoData = removeProductsSkelEl();
            that.productsRail.onRailReady = onReadyProds(id);

          }
          that.player.play(that.player.buildAsset(selected[0]));
         }
      });
    function removeProductsSkelEl() {
      Utils.remove(that.skeletonEl.querySelector('.products-skel-delete'));
      that.skeletonEl.querySelector('.player-holder').offsetParent.className = 'col-12';
    }

    function onReadyProds(id){
        console.log(id)
        var prodsData = that.productsRail.data;
        if (prodsData.length && prodsData.length > 0) {
            console.log('si hay data! ', prodsData);
            that.productsRail.endpoint = that.settings.api_base_url + '/videos/' + id + '/products';
            that.productsRail.load('render');
            that.skeletonEl.querySelector('.player-holder').offsetParent.className = 'col-10';
            that.player.resize();
        }
    }
  };

  Playlist.prototype.loadMore = function() {
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

  Playlist.prototype.deleteDivs = function(){
      that.tvpNoVideos = that.tvpNoVideos ? that.tvpNoVideos : that.plScroller.getElementsByClassName('tvp-no-videos');
      for (var i = that.tvpNoVideos.length - 1; i >= 0; i--){
          that.plScroller.removeChild(that.tvpNoVideos[i]);
          Ps.update(that.plScroller);
      }
  };

  Playlist.prototype.clearActiveItems = function (video) {
      for (var i = video.length - 1; i >= 0; i--) {
          if(video[i].classList.contains('active')) video[i].classList.remove('active');
      }
  };

  Playlist.prototype.setActiveItem = function (id) {
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

  window.Playlist = Playlist;

}(window, document));