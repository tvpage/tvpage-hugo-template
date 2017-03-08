;(function(window,document) {
    var isset = function(o,p){
        var val = o;
        if (p) val = o[p];
        return 'undefined' !== typeof val;
    };

    //var itemTemplate = ""

    function Menu(options) {

        this.playlist = options.data || [];
        this.onClick = isset(options.onClick) && 'function' === typeof options.onClick ? options.onClick : null;

        var that = this;
        this.render = function(){
            if (this.playlist.length < 1) return;

            //Render hamburger button with videos qty
            //http://codepen.io/georgec/pen/JddQGW
            that.button = document.createElement('button');
            document.body.appendChild(that.button);

            //Render menu (hidden bu default)
            that.slideMenu = document.createElement('div');

            for (var i = 0; i < this.playlist.length; i++) {
                var menuItem = this.playlist[i];
                var menuItemEl = document.createElement('div');
                menuItemEl.innerHTML = menuItem.title;
                that.slideMenu.appendChild(menuItemEl);
            }

            document.body.appendChild(that.slideMenu);
        };

        this.render();
    }

    window.Menu = Menu;

}(window, document));