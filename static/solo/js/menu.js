;(function(window, document) {
<<<<<<< HEAD
    var menuTemplate = '<nav id="tvp-hidden-menu" ss-container></nav><div id="tvp-hamburger-container"><div class="tvp-hamburger tvp-hamburger-x"><span></span></div><p class="tvp-video-count"></p></div>',
        itemTemplate = '<div id="tvp-video-{id}" class="tvp-video{className}"><div class="tvp-video-image" style="background-image:url({asset.thumbnailUrl})"><div class="tvp-active-overlay"><p>Now Playing</p></div><svg class="tvp-video-play" viewBox="0 0 200 200" alt="Play video"><polygon points="70, 55 70, 145 145, 100"></polygon></svg></div><div class="tvp-video-details"><p class="tvp-video-title">{title}</p><p class="tvp-video-duration">- {asset.prettyDuration}</p></div></div>';
=======
>>>>>>> 373ce5bd9943458921ce1044df1dc78636a30d41
  
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
<<<<<<< HEAD
        that.noVidDiv = document.getElementById('tvp-no-videos');
        that.tvpNoVids = document.getElementsByClassName('tvp-novids');
=======
        that.noVideosContainer = document.getElementById('tvp-no-videos-container');
        that.tvpNoVideos = document.getElementsByClassName('tvp-no-videos');
        that.scrollBar = document.getElementsByClassName('ss-scroll')[0];
        that.slideMenu = document.getElementById('tvp-slide-menu');
>>>>>>> 373ce5bd9943458921ce1044df1dc78636a30d41
    };

    this.render = function() {
        var playlist = settings.data || [];
        if (playlist.length < 1) return;
        that.fullScreenMenu();
<<<<<<< HEAD
        var menuHiden = document.getElementById('tvp-hidden-menu'),
            menuItemEl = document.createElement('div'),
            noVidDiv = document.createElement('div');

        menuItemEl.setAttribute('id', 'tvp-clearfix'),    
        noVidDiv.setAttribute('id', 'tvp-no-videos');

        menuHiden.appendChild(noVidDiv);
        menuHiden.insertBefore(menuItemEl,noVidDiv);
=======
        var videoDetails = document.getElementsByClassName('tvp-video-details'),
            menuHiden = document.getElementById('tvp-hidden-menu'),
            menuItemEl = document.createElement('div'),
            noVideosContainer = document.createElement('div');

        menuItemEl.setAttribute('id', 'tvp-clearfix'),    
        noVideosContainer.setAttribute('id', 'tvp-no-videos-container');

        menuHiden.appendChild(noVideosContainer);
        menuHiden.insertBefore(menuItemEl,noVideosContainer);
>>>>>>> 373ce5bd9943458921ce1044df1dc78636a30d41

        that.vidCount = 0;
        for (var i = 0; i < playlist.length; i++) {
            that.vidCount++;
            var menuItem = playlist[i];
            that.allVideos.push(menuItem);
            menuItem.title = Utils.trimText(menuItem.title, 100);
<<<<<<< HEAD
            menuItemEl.innerHTML += Utils.tmpl(itemTemplate, menuItem);
=======
            menuItem.duration = Utils.formatDuration(menuItem.duration);
            menuItemEl.innerHTML += Utils.tmpl(settings.templates['menu-item'], menuItem);
            if (Utils.isset(settings, 'menu_item_play_category_tag_attribute') && ("" + settings.menu_item_play_category_tag_attribute).trim().length) {
                var tagAttribute = settings.menu_item_play_category_tag_attribute;
                var tagAttributeValue = menuItem[tagAttribute];
                if (tagAttributeValue) {
                    tagAttributeValue = tagAttributeValue.replace(/_/g,' ');
                    var categoryFrag = document.createDocumentFragment(),
                    categoryDiv = document.createElement('div');
                    categoryDiv.classList.add('tvp-category-tag');
                    categoryDiv.innerHTML += tagAttributeValue;
                    categoryFrag.appendChild(categoryDiv);
                    videoDetails[i].appendChild(categoryFrag);
                }
            }
>>>>>>> 373ce5bd9943458921ce1044df1dc78636a30d41

            if (that.dataMethod !== 'static') {
                var noVidFrag = document.createDocumentFragment(),
                    noVideos = document.createElement('div');
<<<<<<< HEAD
                noVideos.classList.add('tvp-novids');
                noVidFrag.appendChild(noVideos);
                noVidDiv.appendChild(noVidFrag);
=======
                noVideos.classList.add('tvp-no-videos');
                noVidFrag.appendChild(noVideos);
                noVideosContainer.appendChild(noVidFrag);
>>>>>>> 373ce5bd9943458921ce1044df1dc78636a30d41
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
<<<<<<< HEAD
        that.hamburguer.classList.contains('active') ? that.hamburguer.classList.remove('active') : that.hamburguer.classList.add('active');
        that.hiddenMenu.classList.contains('active') ? that.hiddenMenu.classList.remove('active') : that.hiddenMenu.classList.add('active');
    };

    this.hideMenu = function(){
        that.hamburguer.classList.remove('active');
        that.hiddenMenu.classList.remove('active');
=======
        that.slideMenu.classList.contains('active') ? that.slideMenu.classList.remove('active') : that.slideMenu.classList.add('active');
    };

    this.hideMenu = function(){
        that.slideMenu.classList.remove('active');
>>>>>>> 373ce5bd9943458921ce1044df1dc78636a30d41
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
<<<<<<< HEAD
            slideMenu.innerHTML = menuTemplate;
=======
            slideMenu.innerHTML = settings.templates.menu;
>>>>>>> 373ce5bd9943458921ce1044df1dc78636a30d41
            menuFrag.appendChild(slideMenu);
            _frame[0].parentNode.insertBefore(menuFrag, _frame[0].nextSibling);
        }
    };

<<<<<<< HEAD
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
=======
    this.listenToResize = function() {
        window.removeEventListener('resize',resizingEvetns,false);
        window.addEventListener('resize',resizingEvetns,false);
        function resizingEvetns(){
                var newSize = (that.payerCont.clientHeight - 40) +'px;';
                that.hiddenMenu.style.cssText = 'height:'+newSize;
                var totalHeight = that.scrollMenu.scrollHeight,
                    ownHeight = that.scrollMenu.clientHeight,
                    scrollRatio = ownHeight / totalHeight;
                that.scrollBar.style.cssText += 'height:' + Math.floor((scrollRatio) * 100) + '%;top:' + (that.scrollMenu.scrollTop / totalHeight) * 100 + '%;right:-'+(that.hiddenMenu.clientWidth - 9)+'px;';
        };
    };

    this.update = function(newData) {
        var playlist = settings.data || [],
            menuItem;

      if (that.noVideosContainer) {
        that.deleteDivs();
        for (var i = 0; i < newData.length; i++) {
            menuItem = playlist[i];
            that.allVideos.push(newData[i]);
            settings.data.push(newData[i]);
            that.noVideosContainer.setAttribute('id', 'tvp-clearfix');
            newData[i].duration = Utils.formatDuration(newData[i].duration);
            that.noVideosContainer.innerHTML += Utils.tmpl(settings.templates['menu-item'], newData[i]);
            that.scrollMenu.appendChild(that.noVideosContainer);
            if (Utils.isset(settings, 'menu_item_play_category_tag_attribute') && ("" + settings.menu_item_play_category_tag_attribute).trim().length) {
                var tagAttribute = settings.menu_item_play_category_tag_attribute;
                var tagAttributeValue = newData[i][settings.menu_item_play_category_tag_attribute];
                if (tagAttributeValue) {
                    tagAttributeValue = tagAttributeValue.replace(/_/g,' ');
                    var categoryFrag = document.createDocumentFragment(),
                    categoryDiv = document.createElement('div');
                    categoryDiv.classList.add('tvp-category-tag');
                    categoryDiv.innerHTML += tagAttributeValue;
                    categoryFrag.appendChild(categoryDiv);
                    that.noVideosContainer.getElementsByClassName('tvp-video-details')[i].appendChild(categoryFrag);
                }
            }
>>>>>>> 373ce5bd9943458921ce1044df1dc78636a30d41
        }
      }else{
        var newVivFrag = document.createDocumentFragment(),
            newDiv = document.createElement('div');
        for (var i = 0; i < newData.length; i++) {
<<<<<<< HEAD
            that.allVideos.push(newData[i]);
            settings.data.push(newData[i]);
            newDiv.setAttribute('id', 'tvp-clearfix');
            newDiv.innerHTML += Utils.tmpl(itemTemplate, newData[i]);
            newVivFrag.appendChild(newDiv);

            that.scrollMenu.appendChild(newDiv);
=======
            menuItem = playlist[i];
            that.allVideos.push(newData[i]);
            settings.data.push(newData[i]);
            newDiv.setAttribute('id', 'tvp-clearfix');
            newData[i].duration = Utils.formatDuration(newData[i].duration);
            newDiv.innerHTML += Utils.tmpl(settings.templates['menu-item'], newData[i]);
            newVivFrag.appendChild(newDiv);
            
            that.scrollMenu.appendChild(newDiv);
            if (Utils.isset(settings, 'menu_item_play_category_tag_attribute') && ("" + settings.menu_item_play_category_tag_attribute).trim().length) {
                var tagAttribute = settings.menu_item_play_category_tag_attribute;
                var tagAttributeValue = newData[i][settings.menu_item_play_category_tag_attribute];
                if (tagAttributeValue) {
                    tagAttributeValue = tagAttributeValue.replace(/_/g,' ');
                    var categoryFrag = document.createDocumentFragment(),
                    categoryDiv = document.createElement('div');
                    categoryDiv.classList.add('tvp-category-tag');
                    categoryDiv.innerHTML += tagAttributeValue;
                    categoryFrag.appendChild(categoryDiv);
                    newDiv.getElementsByClassName('tvp-video-details')[i].appendChild(categoryFrag);
                }
            }
>>>>>>> 373ce5bd9943458921ce1044df1dc78636a30d41
        }
      }
      that.cacheDOM();
      that.bindClickEvent();
    };

    this.deleteDivs = function(){
<<<<<<< HEAD
        for (var i = that.tvpNoVids.length - 1; i >= 0; i--){
            that.noVidDiv.removeChild(that.tvpNoVids[i]);
=======
        for (var i = that.tvpNoVideos.length - 1; i >= 0; i--){
            that.noVideosContainer.removeChild(that.tvpNoVideos[i]);
>>>>>>> 373ce5bd9943458921ce1044df1dc78636a30d41
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
