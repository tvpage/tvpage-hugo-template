;(function(window, document) {
    var menuTemplate = '<nav id="tvp-hidden-menu" ss-container></nav><div id="tvp-hamburger-container"><div class="tvp-hamburger tvp-hamburger-x"><span></span></div><p class="tvp-video-count"></p></div>',
        itemTemplate = '<div id="tvp-video-{id}" class="tvp-video{className}"><div class="tvp-video-image" style="background-image:url({asset.thumbnailUrl})"><div class="tvp-active-overlay"><p>Now Playing</p></div><svg class="tvp-video-play" viewBox="0 0 200 200" alt="Play video"><polygon points="70, 55 70, 145 145, 100"></polygon></svg></div><div class="tvp-video-details"><p class="tvp-video-title">{title}</p><p class="tvp-video-duration">- {asset.prettyDuration}</p></div></div>';
  
  function Menu(player, settings) {

    var that = this;
    this.dataMethod = (document.body.classList.contains('dynamic')) ? 'dynamic' : 'static';
    this.allVideos = [];

    this.init = function(){
        that.render();
        that.cacheDOM();
        that.bindMenuEvent();
        that.bindClickEvent();
        that.bindLoadMoreEvent();
        that.hideMenuEvents();
        that.listenToResize();
    };

    this.cacheDOM =function(){
        that.hiddenMenu = document.getElementById('tvp-hidden-menu');
        that.scrollMenu = document.querySelectorAll('.ss-content')[0];
        that.tvpVid = document.querySelectorAll('.tvp-video');
        that.hamburguer = document.getElementById('tvp-hamburger-container');
        that.toggles = document.querySelectorAll('.tvp-hamburger');
        that.payerCont = document.querySelectorAll('.tvp-player')[0];
        that.noVidDiv = document.getElementById('tvp-no-videos');
        that.tvpNoVids = document.getElementsByClassName('tvp-novids');
    };

    this.render = function() {
        var playlist = settings.data || [];
        if (playlist.length < 1) return;
        that.fullScreenMenu();
        var menuHiden = document.getElementById('tvp-hidden-menu'),
            menuItemEl = document.createElement('div'),
            noVidDiv = document.createElement('div');

        menuItemEl.setAttribute('id', 'tvp-clearfix'),    
        noVidDiv.setAttribute('id', 'tvp-no-videos');

        menuHiden.appendChild(noVidDiv);
        menuHiden.insertBefore(menuItemEl,noVidDiv);

        that.vidCount = 0;
        for (var i = 0; i < playlist.length; i++) {
            that.vidCount++;
            var menuItem = playlist[i];
            that.allVideos.push(menuItem);
            menuItem.title = Utils.trimText(menuItem.title, 100);
            menuItemEl.innerHTML += Utils.tmpl(itemTemplate, menuItem);

            if (that.dataMethod !== 'static') {
                var noVidFrag = document.createDocumentFragment(),
                    noVideos = document.createElement('div');
                noVideos.classList.add('tvp-novids');
                noVidFrag.appendChild(noVideos);
                noVidDiv.appendChild(noVidFrag);
            }
        }
        if (that.dataMethod === 'static') {
            that.videoCountP = document.createTextNode(that.vidCount + ' ' + (that.vidCount > 2 ? 'videos' : 'video'));
            that.tvpVideoCount = document.querySelectorAll('.tvp-video-count')[0];
            that.tvpVideoCount.appendChild(that.videoCountP);
        }
        menuHiden.style.cssText = 'height:'+(document.querySelectorAll('.tvp-player')[0].offsetHeight - 40)+'px;';
        SimpleScrollbar.initAll();

    };

    this.bindMenuEvent = function() {
      for (var i = that.toggles.length - 1; i >= 0; i--) {
        that.toggles[i].onclick = function() {
            var playerAsset = player.assets[player.current];
            that.setActiveItem(playerAsset.assetId);
            that.toggleMenu();
        };
      }
    };

    this.bindLoadMoreEvent = function(e){
        that.scrollMenu.addEventListener("scroll", Utils.debounce(function() {
          var menuTop = that.scrollMenu.scrollTop,
              newHeight = that.hiddenMenu.clientHeight - that.scrollMenu.scrollHeight,
              percentDocument = (menuTop*100)/newHeight;
          percentDocument = Math.round(percentDocument);
          percentDocument = Math.abs(percentDocument);
          if (percentDocument >= 50 && percentDocument <= 100) {
            that.dataMethod == 'dynamic' ? that.loadMore() : null;
          }
        },30));
    };

    this.bindClickEvent = function(){
      for (var i = that.tvpVid.length - 1; i >= 0; i--) {
        that.videoClick(that.tvpVid[i]);
      }
    };

    this.toggleMenu = function() {
        that.hamburguer.classList.contains('active') ? that.hamburguer.classList.remove('active') : that.hamburguer.classList.add('active');
        that.hiddenMenu.classList.contains('active') ? that.hiddenMenu.classList.remove('active') : that.hiddenMenu.classList.add('active');
    };

    this.hideMenu = function(){
        that.hamburguer.classList.remove('active');
        that.hiddenMenu.classList.remove('active');
    };

    this.hideMenuEvents = function(){
        var overlay = document.getElementsByClassName('tvp-overlay')[0];
        if (overlay) {
            overlay.onclick = function(){
                that.hideMenu();
            };
        }
    };

    this.fullScreenMenu = function(){
        var tvpPlayerEl = that.dataMethod === 'static'? document.getElementById('tvp-player-el') : document.getElementsByClassName('tvp-player-el')[0];
        var _frame = tvpPlayerEl.getElementsByTagName('iframe');
        if(_frame.length){
            var menuFrag = document.createDocumentFragment(),
            slideMenu = document.createElement('div');
            slideMenu.setAttribute('id', 'tvp-slide-menu');
            slideMenu.innerHTML = menuTemplate;
            menuFrag.appendChild(slideMenu);
            _frame[0].parentNode.insertBefore(menuFrag, _frame[0].nextSibling);
        }
    };

    this.listenToResize = function(argument) {
        window.addEventListener('resize',function(){
            setTimeout(function(){
                var newSize = (that.payerCont.clientHeight - 40) +'px;';
                that.hiddenMenu.style.cssText = 'height:'+newSize;
            },50)
        },false);
    };

    this.update = function(newData) {

      if (that.noVidDiv) {
        that.deleteDivs();
        for (var i = 0; i < newData.length; i++) {
            that.allVideos.push(newData[i]);
            settings.data.push(newData[i]);
            that.noVidDiv.setAttribute('id', 'tvp-clearfix');
            that.noVidDiv.innerHTML += Utils.tmpl(itemTemplate, newData[i]);
            that.scrollMenu.appendChild(that.noVidDiv);
        }
      }else{
        var newVivFrag = document.createDocumentFragment(),
            newDiv = document.createElement('div');
        for (var i = 0; i < newData.length; i++) {
            that.allVideos.push(newData[i]);
            settings.data.push(newData[i]);
            newDiv.setAttribute('id', 'tvp-clearfix');
            newDiv.innerHTML += Utils.tmpl(itemTemplate, newData[i]);
            newVivFrag.appendChild(newDiv);

            that.scrollMenu.appendChild(newDiv);
        }
      }
      that.cacheDOM();
      that.bindClickEvent();
    };

    this.deleteDivs = function(){
        for (var i = that.tvpNoVids.length - 1; i >= 0; i--){
            that.noVidDiv.removeChild(that.tvpNoVids[i]);
        }
    };

    this.clearActiveItems = function () {
        for (var i = that.tvpVid.length - 1; i >= 0; i--) {
            if(that.tvpVid[i].classList.contains('active')){
                that.tvpVid[i].classList.remove('active');
            }
        }
    };

    this.setActiveItem = function (id) {
        for (var i = that.tvpVid.length - 1; i >= 0; i--) {
            var item = that.tvpVid[i],
                itemId = item.id.split('-').pop();
            if (itemId === id && !item.classList.contains('active')){
                this.clearActiveItems();
                item.classList.add('active');
            }
        }
    };

    this.videoClick = function(vids){
        vids.onclick = function() {
            if (!this.classList.contains('tvp-video')) return;

            that.clearActiveItems();
            this.classList.add('active');

            var id = this.id.split('-').pop(),
                selected = that.allVideos.filter(function(v){return v.id === id});
            player.play(player.createAsset(selected[0]));
            that.toggleMenu();
        };
    };
  }

  window.Menu = Menu;

}(window, document));
