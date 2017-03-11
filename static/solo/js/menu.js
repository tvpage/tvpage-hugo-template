;
(function(window, document) {
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

    random = function(){
        return 'tvp_' + Math.floor(Math.random() * 50005);
    },

    tmpl = function(template, data) {
      if (template && 'object' == typeof data) {
        return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
          var keys = key.split("."),
            v = data[keys.shift()];
          for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
          return (typeof v !== "undefined" && v !== null) ? v : "";
        });
      }
    },

    trimText = function(text, limit) {
      var t = text || '';
      var l = limit ? Number(limit) : 0;
      if (text.length > l) {
        t = t.substring(0, Number(l)) + '...';
      }
      return t;
    };

  function Menu() {

    var that = this;
    this.allVideos = [];

    this.render = function(options,unique) {
      this.playlist = options.data || [];
      if (this.playlist.length < 1) return;

      that.menuFrag = document.createDocumentFragment();
      that.slideMenu = document.createElement('div');
      that.slideMenu.setAttribute('id', 'tvp-slide-menu');
      that.slideMenu.innerHTML = menuTemplate;
      that.hiddenMenu = that.slideMenu.querySelectorAll('#tvp-hidden-menu')[0];
      that.hamburguer = that.slideMenu.querySelectorAll('#tvp-hamburger-container')[0];
      that.tvpVideoCount = that.slideMenu.querySelectorAll('.tvp-video-count')[0];
      that.menuFrag.appendChild(that.slideMenu);

      for (var i = 0; i < this.playlist.length; i++) {
        var menuItem = this.playlist[i];
        that.allVideos.push(menuItem);
        menuItem.title = trimText(menuItem.title, 50);

        var menuItemElFrag = document.createDocumentFragment();
        var menuItemEl = document.createElement('div');

        menuItemEl.classList.add('tvp-slide-menu-video-' + that.index + '');
        menuItemEl.innerHTML = tmpl(itemTemplate, menuItem);
        menuItemElFrag.appendChild(menuItemEl);
        that.hiddenMenu.appendChild(menuItemElFrag);
      }
      document.body.appendChild(that.menuFrag);
      SimpleScrollbar.initEl(that.hiddenMenu);
      that.bindMenuEvent();
      that.videoClick(document.querySelectorAll('.ss-content')[0],that.allVideos,options,unique);
    };

    this.bindMenuEvent = function() {
      var toggles = document.querySelectorAll('.tvp-hamburger');
      for (var i = toggles.length - 1; i >= 0; i--) {
        var toggle = toggles[i];
        that.toggleMenu(toggle);
      }
    };

    this.toggleMenu = function(toggle) {
      toggle.addEventListener("click", function(e) {
        e.preventDefault();
        if (that.hamburguer.classList.contains('active') || that.hiddenMenu.classList.contains('active')) {
          that.hamburguer.classList.remove('active');
          that.hiddenMenu.classList.remove('active');
        } else {
          that.hamburguer.classList.add('active');
          that.hiddenMenu.classList.add('active');
        }
      });
    };

    this.update = function(videos) {
      var videoData = videos.data || [];
      var ssContent = document.querySelectorAll('.ss-content')[0];
      for (var i = 0; i < videoData.length; i++) {
        that.allVideos.push(videoData[i]);
        var newItemEl = document.createElement('div');
        newItemEl.innerHTML += tmpl(itemTemplate, videoData[i]);
        ssContent.appendChild(newItemEl);
      } 
      that.videoClick(ssContent,that.allVideos,videos);
    };

    this.videoClick = function(el, data, settings,unique){
        el.onclick = function(e) {
          var target = e.target;
          if (!target.classList.contains('tvp-video')) return;

          var id = target.id.split('-').pop(),
              selected = {};

          for (var i = 0; i < data.length; i++) {
            if (data[i].id === id) {
              selected = data[i];
            }
          }
          for (var i = settings.data.length - 1; i >= 0; i--) {
              delete settings.data[i];
          }
          settings.data = selected;
          var playerEl = document.getElementById('tvp-player-el-'+unique);
          var player = new Player(playerEl,settings);
        };
    };


  }

  window.Menu = Menu;

}(window, document));
