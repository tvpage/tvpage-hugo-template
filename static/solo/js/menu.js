;(function(window,document) {
    var menuTemplate = '<nav id="tvp-hidden-menu"></nav><div id="tvp-hamburger-container"><div class="tvp-hamburger tvp-hamburger-x"><span>.</span></div><p class="tvp-video-count"></p></div>',

    itemTemplate = '<div id="tvp-video-{id}" class="tvp-video{className}">'+
                        '<div class="tvp-video-image" style="background-image:url({asset.thumbnailUrl})">'+
                           '<svg class="tvp-video-play" viewBox="0 0 200 200" alt="Play video">'+
                               '<polygon points="70, 55 70, 145 145, 100"></polygon>'+
                           '</svg>'+
                        '</div>'+
                        '<div class="tvp-video-details">'+
                            '<p class="tvp-video-title">{title}</p>'+
                            '<p class="tvp-video-duration">{asset.prettyDuration}</p>'+
                        '</div>'+
                    '</div>',

    isset = function(o,p){
        var val = o;
        if (p) val = o[p];
        return 'undefined' !== typeof val;
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

    trimText = function(text,limit){
      var t = text || '';
      var l = limit ? Number(limit) : 0;
      if (text.length > l) {
        t = t.substring(0,Number(l)) + '...';
      }
      return t;
    };


    function Menu(options) {

        this.playlist = options.data || [];
        this.onClick = isset(options.onClick) && 'function' === typeof options.onClick ? options.onClick : null;
        var that = this;

        this.render = function(){
            if (this.playlist.length < 1) return;

            that.menuFrag = document.createDocumentFragment();
            that.slideMenu = document.createElement('div');
            that.slideMenu.setAttribute('id', 'tvp-slide-menu');
            that.slideMenu.innerHTML = menuTemplate;
            that.hiddenMenu = that.slideMenu.querySelectorAll('#tvp-hidden-menu')[0];
            that.hamburguer = that.slideMenu.querySelectorAll('#tvp-hamburger-container')[0];
            that.tvpVideoCount = that.slideMenu.querySelectorAll('.tvp-video-count')[0];
            that.menuFrag.appendChild(that.slideMenu);
            that.index;

            for (that.index= 0; that.index < this.playlist.length; that.index++) {
                var menuItem = this.playlist[that.index];
                menuItem.title = trimText(menuItem.title,50);

                var menuItemElFrag = document.createDocumentFragment();
                var menuItemEl = document.createElement('div');

                menuItemEl.classList.add('tvp-slide-menu-video-'+that.index+'');
                menuItemEl.innerHTML = tmpl(itemTemplate, menuItem);
                menuItemElFrag.appendChild(menuItemEl);
                that.hiddenMenu.appendChild(menuItemElFrag);
            }
            that.videoCount = document.createTextNode(that.index + ' ' + (that.index > 2 ? 'videos' : 'video'));
            that.tvpVideoCount.appendChild(that.videoCount);
            document.body.appendChild(that.menuFrag);
            that.bindMenuEvent();
        };

        this.bindMenuEvent = function(){
            var toggles = document.querySelectorAll('.tvp-hamburger');
            for (var i = toggles.length - 1; i >= 0; i--) {
                var toggle = toggles[i];
                that.toggleMenu(toggle);
            }
        };

        this.toggleMenu = function(toggle) {
            toggle.addEventListener( "click", function(e) {
                e.preventDefault();
                if (that.hamburguer.classList.contains('active') || that.hiddenMenu.classList.contains('active')){
                    that.hamburguer.classList.remove('active');
                    that.hiddenMenu.classList.remove('active');
                }else{
                    that.hamburguer.classList.add('active');
                    that.hiddenMenu.classList.add('active');
                }
            });
        };

        this.render();
    }

    window.Menu = Menu;

}(window, document));