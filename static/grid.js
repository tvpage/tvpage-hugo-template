;(function(root, doc) {

  function Grid(el, options) {

    var tmpl = function(template, data) {
      if (template && 'object' == typeof data) {
        return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
          var keys = key.split("."),
            v = data[keys.shift()];
          for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
          return (typeof v !== "undefined" && v !== null) ? v : "";
        });
      }
    };

    this.loading = false;
    this.lastPageReached = false;
    this.page = 0;

    this.el = 'string' === typeof el ? doc.getElementById(el) : el;
    this.loadMoreBtn = this.el.getElementsByClassName('tvp-load-more')[0];

    var that = this;
    this.loadMoreBtn.onclick = function() {
      if (that.loading) return;
      that.loading = true;

      if (that.lastPageReached) {
        that.page = 0;
        that.lastPageReached = false;
      } else {
        that.page++;
      }

      var scr = doc.createElement('script'),
        srcUrl = '//api.tvpage.com/v1/channels/' + options.channelid + '/videos?X-login-id=';

      srcUrl += options.loginid + '&callback=tvpcallback&p=' + that.page + '&n=' + options.itemsperpage;
      scr.src = srcUrl;
      window['tvpcallback'] = function(data) {
        that.loading = false;

        if (data && data.length) {

          var raw = data.slice(0),
              rows = [];

          while (raw.length) {
            rows.push(raw.splice(0, 2));
          }

          var rowsCounter = rows.length,
              pageFrag = doc.createDocumentFragment();

          while (rowsCounter > 0) {
            var row = rows[rowsCounter - 1],
                rowEl = doc.createElement('div');

            rowEl.classList.add('tvp-clearfix');
            for (var i = 0; i < row.length; i++) {
              rowEl.innerHTML += tmpl(doc.getElementById('videoTemplate').innerHTML, row[i]);
            }

            pageFrag.appendChild(rowEl);

            if (data.length < options.itemsperpage) {
              that.lastPageReached = true;
            }

            rowsCounter--;
          }

          var container = that.el.getElementsByClassName('tvp-container')[0];
          container.innerHTML = '';
          container.appendChild(pageFrag);

        } else {
          that.lastPageReached = true;
        }
      };
      
      doc.body.appendChild(scr);

    }

  }

  root.Grid = Grid;

}(window, document));