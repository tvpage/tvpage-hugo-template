;(function(window, document) {

  function Menu(player, settings) {
    var that = this,
        firstRender = true;

    this.player = player;
    this.playerEl = player.el;
    this.allVideos = [];

    this.init = function(){
        that.appendMenu();
        that.render(settings.data);
        that.bindClickEvents();
        that.bindLoadMoreEvent();
        that.listenToResize();
    };

    this.appendMenu = function(){
        var iframe = that.playerEl.getElementsByTagName('iframe');
        if(iframe.length){
            var menuFrag = document.createDocumentFragment();
            that.slideMenu = document.createElement('div');
            that.slideMenu.setAttribute('id', 'tvp-slide-menu');
            that.slideMenu.innerHTML = settings.templates.menu;
            menuFrag.appendChild(that.slideMenu);
            iframe[0].parentNode.insertBefore(menuFrag, iframe[0].nextSibling);
        }
    };

    this.render = function(data) {
        if (!data || !data.length) return;
        var lastPage = (!data.length || data.length < settings.items_per_page) ? true : false,
            playlist = data || [],
            menuItemEl = '',
            noVideosEl = '';

        for(var i = 0; i < playlist.length; i++){
            var menuItem = playlist[i];
            menuItem.title = Utils.trimText(menuItem.title, 100);
            menuItem.duration = Utils.formatDuration(menuItem.duration);

            if (Utils.isset(settings, 'menu_item_play_category_tag_attribute')) {
                var tagAttributeValue = menuItem[settings.menu_item_play_category_tag_attribute];
                if (tagAttributeValue) {
                    tagAttributeValue = tagAttributeValue.replace(/_/g,' ');
                    menuItem.menuTagAttr = tagAttributeValue;
                }
            }
            if (!lastPage) {
                noVideosEl += '<div class="tvp-no-videos"></div>' 
            }
            menuItemEl += Utils.tmpl(settings.templates['menu-item'], menuItem);
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

    this.bindLoadMoreEvent = function(e){
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

    this.bindClickEvents = function(){
        Utils.addEvent(that.playerEl, 'click',['tvp-hamburger','tvp-video'], function(type, el){ 
            switch (type) {
                case 'tvp-hamburger':
                    that.toggleMenu();
                    break;
                case 'tvp-video':
                    var id = el.id.split('-').pop(),
                        selected = that.allVideos.filter(function(v){return v.id === id});
                    
                    that.setActiveItem(id);
                    player.play(player.createAsset(selected[0]));
                    that.toggleMenu();
                    break;
                default:
            }
        });
    };

    this.toggleMenu = function() {
        that.slideMenu.classList.contains('active') ? that.slideMenu.classList.remove('active') : that.slideMenu.classList.add('active');
    };

    this.hideMenu = function(){
        that.slideMenu.classList.remove('active');
    };

    this.listenToResize = function() {
        window.removeEventListener('resize',resizingEvetns,false);
        window.addEventListener('resize',resizingEvetns,false);
        function resizingEvetns(e){
            var newSize = (that.playerEl.parentNode.offsetHeight - 36);
            that.setMenuHeight(newSize);
            Ps.update(that.hiddenMenu);
        };
    };

    this.setMenuHeight = function(height){
        that.hiddenMenu.style.cssText = 'height:' + height +'px;';
    };

    this.deleteDivs = function(){
        that.tvpNoVideos = that.tvpNoVideos ? that.tvpNoVideos : that.hiddenMenu.getElementsByClassName('tvp-no-videos');
        for (var i = that.tvpNoVideos.length - 1; i >= 0; i--){
            that.hiddenMenu.removeChild(that.tvpNoVideos[i]);
            Ps.update(that.hiddenMenu);
        }
    };

    this.clearActiveItems = function (video) {
        for (var i = video.length - 1; i >= 0; i--) {
            if(video[i].classList.contains('active')){
                video[i].classList.remove('active');
            }
        }
    };

    this.setActiveItem = function (id) {
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
  }

  window.Menu = Menu;

}(window, document));
