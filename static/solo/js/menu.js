;(function(window, document) {
    var menuTemplate = '<nav id="tvp-hidden-menu"></nav><div id="tvp-hamburger-container"><div class="tvp-hamburger tvp-hamburger-x"><span></span></div><p class="tvp-video-count"></p></div>',

        itemTemplate = '<div id="tvp-video-{id}" class="tvp-video{className}">' +
                            '<div class="tvp-video-image" style="background-image:url({asset.thumbnailUrl})">' +
                                '<div class="tvp-active-overlay"><p>Now Playing</p></div>' +
                                '<svg class="tvp-video-play" viewBox="0 0 200 200" alt="Play video">' +
                                    '<polygon points="70, 55 70, 145 145, 100"></polygon>' +
                                '</svg>' +
                            '</div>' +
                            '<div class="tvp-video-details">' +
                                '<p class="tvp-video-title">{title}</p>' +
                                '<p class="tvp-video-duration">-{asset.prettyDuration}</p>' +
                            '</div>' +
                        '</div>';

  function Menu(player, settings) {

    var that = this;
    this.allVideos = [];

    this.render = function() {
        var playlist = settings.data || [];
        if (playlist.length < 1) return;

        that.menuFrag = document.createDocumentFragment();
        that.slideMenu = document.createElement('div');
        that.slideMenu.setAttribute('id', 'tvp-slide-menu');
        that.slideMenu.innerHTML = menuTemplate;
        that.menuFrag.appendChild(that.slideMenu);
        document.body.appendChild(that.menuFrag);
        that.hiddenMenu = document.getElementById('tvp-hidden-menu');
        that.hamburguer = document.getElementById('tvp-hamburger-container');
        that.vidCount = 0;
        for (var i = 0; i < playlist.length; i++) {
            that.vidCount++;
            var menuItem = playlist[i];
            that.allVideos.push(menuItem);
            menuItem.title = Utils.trimText(menuItem.title, 100);

            var menuItemElFrag = document.createDocumentFragment(),
                menuItemEl = document.createElement('div');

            menuItemEl.classList.add('tvp-slide-menu-video');
            menuItemEl.innerHTML = Utils.tmpl(itemTemplate, menuItem);
            menuItemElFrag.appendChild(menuItemEl);
            that.hiddenMenu.appendChild(menuItemElFrag);
        }
        if (!document.body.classList.contains('dynamic')) {
            that.videoCountP = document.createTextNode(that.vidCount + ' ' + (that.vidCount > 2 ? 'videos' : 'video'));
            that.tvpVideoCount = that.slideMenu.querySelectorAll('.tvp-video-count')[0];
            that.tvpVideoCount.appendChild(that.videoCountP);
        }
        SimpleScrollbar.initEl(that.hiddenMenu);
        that.bindMenuEvent();
        that.bindClickEvent();
        that.bindLoadMoreEvent();
    };

    this.bindMenuEvent = function() {
      var toggles = document.querySelectorAll('.tvp-hamburger');
      for (var i = toggles.length - 1; i >= 0; i--) {
        toggles[i].onclick = function() {
            that.toggleMenu();
            that.hideMenuEvents();
        };
      }
    };

    this.bindLoadMoreEvent = function(e){
        var scrollMenu = document.querySelectorAll('.ss-content')[0];
        scrollMenu.addEventListener("scroll", Utils.debounce(function() {
          var menuTop = scrollMenu.scrollTop,
              newHeight = document.body.clientHeight - scrollMenu.scrollHeight,
              percentDocument = (menuTop*100)/newHeight;
          percentDocument = Math.round(percentDocument);
          percentDocument = Math.abs(percentDocument);
          if (percentDocument >= 55 && percentDocument <= 100) {
            that.loadMore();
          }
        },30));
    };

    this.bindClickEvent = function(){
      var tvpVid = document.querySelectorAll('.tvp-video');
      tvpVid[0].classList.add('active');
      for (var i = tvpVid.length - 1; i >= 0; i--) {
        that.videoClick(tvpVid[i]);
      }
    };

    this.toggleMenu = function() {
        that.hamburguer.classList.contains('active') ? that.hamburguer.classList.remove('active') : that.hamburguer.classList.add('active');
        that.hiddenMenu.classList.contains('active') ? that.hiddenMenu.classList.remove('active') : that.hiddenMenu.classList.add('active');
    };

    this.hideMenu = function(){
        that.hamburguer.classList.contains('active') ? that.hamburguer.classList.remove('active') : '';
        that.hiddenMenu.classList.contains('active') ? that.hiddenMenu.classList.remove('active') : '';
    };

    this.hideMenuEvents = function(){
        var overlay = document.getElementsByClassName('tvp-overlay')[0];
        if (overlay) {
            overlay.onclick = function(){
                that.toggleMenu();
            };
        }
        BigScreen.onchange = function(){
            that.hideMenu();
        }; 
    };

    this.update = function(newData) {
      var videoData = newData || [];
      var scrollMenu = document.querySelectorAll('.ss-content')[0];
      for (var i = 0; i < videoData.length; i++) {
        that.allVideos.push(videoData[i]);
        settings.data.push(videoData[i]);
        var newItemEl = document.createElement('div');
        newItemEl.classList.add('tvp-slide-menu-video');
        newItemEl.innerHTML += Utils.tmpl(itemTemplate, videoData[i]);
        scrollMenu.appendChild(newItemEl);
      } 
      that.bindClickEvent();
    };

    this.videoClick = function(vids){
        vids.onclick = function() {
            console.log(player)
            if (!this.classList.contains('tvp-video')) return;
            var tvpV = document.querySelectorAll('.tvp-video');
            for (var i = tvpV.length - 1; i >= 0; i--) {
                if(tvpV[i].classList.contains('active')){
                    tvpV[i].classList.remove('active');
                }
            }
            this.classList.add('active');
            var id = this.id.split('-').pop(),
                selected = that.allVideos.filter(function(v){return v.id === id});
            player.play(player.createAsset(selected[0]));
            that.toggleMenu();
        };
    };

    player.onStateChange = function(e){
        if ('tvp:media:videoplaying' === e){
            that.hideMenu();
        }
    };

    that.render();
  }

  window.Menu = Menu;

}(window, document));
