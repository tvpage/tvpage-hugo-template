;(function(window, document) {
  var menuTemplate = '<nav id="tvp-hidden-menu"></nav><div id="tvp-hamburger-container"><div class="tvp-hamburger tvp-hamburger-x"><span>.</span></div></div>',

     itemTemplate = '<div id="tvp-video-{id}" class="tvp-video{className}">' +
                        '<div class="tvp-video-image" style="background-image:url({asset.thumbnailUrl})">' +
                            '<svg class="tvp-video-play" viewBox="0 0 200 200" alt="Play video">' +
                                '<polygon points="70, 55 70, 145 145, 100"></polygon>' +
                            '</svg>' +
                        '</div>' +
                        '<div class="tvp-video-details">' +
                            '<p class="tvp-video-title">{title}</p>' +
                            '<p class="tvp-video-duration">{asset.prettyDuration}</p>' +
                        '</div>' +
                    '</div>',

    isset = function(o, p) {
      var val = o;
      if (p) val = o[p];
      return 'undefined' !== typeof val;
    },

    isEmpty = function(obj) {
        for(var key in obj) { if (obj.hasOwnProperty(key)) return false;}
        return true;
    },

    tmpl = function(template, data) {
        if (!template && 'object' !== typeof data) return;
        return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
            var keys = key.split("."),
            v = data[keys.shift()];
            for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
            return (typeof v !== "undefined" && v !== null) ? v : "";
        });
    },

    trimText = function(text, limit) {
      var t = text || '';
      var l = limit ? Number(limit) : 0;
      if (text.length > l) {
        t = t.substring(0, Number(l)) + '...';
      }
      return t;
    },

    assety = function(data, options){
      var assets = [];
      for (var i = 0; i < data.length; i++) {
        var video = data[i];
        
        if (isEmpty(video)) break;

        var asset = video.asset;
        asset.assetId = video.id;
        asset.assetTitle = video.title;
        asset.loginId = video.loginId;

        if (isset(video,'events') && video.events.length) {
          asset.analyticsLogUrl = video.analytics;
          asset.analyticsObj = video.events[1].data;
        } else {
          asset.analyticsObj = {
            pg: isset(video,'parentId') ? video.parentId : ( isset(options,'channel') ? options.channel.id : 0 ),
            vd: video.id, 
            li: video.loginId
          };
        }

        if (!asset.sources) asset.sources = [{ file: asset.videoId }];
        asset.type = asset.type || 'youtube';
        assets.push(asset); 
      }
      return assets;
    };


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
      that.hiddenMenu = that.slideMenu.querySelectorAll('#tvp-hidden-menu')[0];
      that.hamburguer = that.slideMenu.querySelectorAll('#tvp-hamburger-container')[0];
      that.menuFrag.appendChild(that.slideMenu);

      for (var i = 0; i < playlist.length; i++) {
        var menuItem = playlist[i];
        that.allVideos.push(menuItem);
        menuItem.title = trimText(menuItem.title, 50);

        var menuItemElFrag = document.createDocumentFragment();
        var menuItemEl = document.createElement('div');

        menuItemEl.classList.add('tvp-slide-menu-video-'+i+'');
        menuItemEl.innerHTML = tmpl(itemTemplate, menuItem);
        menuItemElFrag.appendChild(menuItemEl);
        that.hiddenMenu.appendChild(menuItemElFrag);
      }
      document.body.appendChild(that.menuFrag);
      SimpleScrollbar.initEl(that.hiddenMenu);
      that.bindMenuEvent();
      that.bindClickEvent();
    };

    this.bindMenuEvent = function() {
      var toggles = document.querySelectorAll('.tvp-hamburger');
      for (var i = toggles.length - 1; i >= 0; i--) {
        var toggle = toggles[i];
        toggle.addEventListener("click", function(e) {
            e.preventDefault();
            that.toggleMenu();
        });
      }
    };

    this.bindClickEvent = function(){
      var tvpVid = document.querySelectorAll('.tvp-video');
      for (var i = tvpVid.length - 1; i >= 0; i--) {
        var vids = tvpVid[i];
        that.videoClick(vids);
      }
    };

    this.toggleMenu = function() {
        if (that.hamburguer.classList.contains('active') || that.hiddenMenu.classList.contains('active')) {
          that.hamburguer.classList.remove('active');
          that.hiddenMenu.classList.remove('active');
        } else {
          that.hamburguer.classList.add('active');
          that.hiddenMenu.classList.add('active');
        }
    };


    this.update = function(videos) {
      var videoData = videos.data || [];
      var ssContent = document.querySelectorAll('.ss-content')[0];
      for (var i = 0; i < videoData.length; i++) {
        that.allVideos.push(videoData[i]);
        settings.data.push(videoData[i]);
        var newItemEl = document.createElement('div');
        newItemEl.innerHTML += tmpl(itemTemplate, videoData[i]);
        ssContent.appendChild(newItemEl);
      } 
      that.bindClickEvent();
    };

    this.videoClick = function(vids){
        var allVids = that.allVideos;
        vids.onclick = function(e) {
            e.preventDefault();
            if (!vids.classList.contains('tvp-video')) return;
            var id = vids.id.split('-').pop(),
                selected = [];

            for (var i = 0; i < allVids.length; i++) {
                if (allVids[i].id === id) {
                    selected.push(allVids[i]);
                }
            }
            var selectedVid = assety(selected,settings);
            player.update(selectedVid);
            that.toggleMenu();
        };
    };
    that.render();
  }

  window.Menu = Menu;

}(window, document));
