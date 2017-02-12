var tap = function(el, options) {
    var defaults = {
      link: true,
      target: '_blank'
    };

    options = $.extend({}, defaults, options);

    var started = false,
        x = 0,
        y = 0,
        touchEvent = function(e) {
          return e.originalEvent.targetTouches ?
          e.originalEvent.targetTouches[0] :
          e;
        };

    function listen() {
      onTouchStart();
      onTouchEnd();
      onTouchMove();
    }

    function onTouchStart() {
      $(el).on('touchstart', function(e) {
        var touch = touchEvent(e),
            that = this;

        x = touch.pageX;
        y = touch.pageY;

        $('div').data('start-x', x);
        $('div').data('start-y', y);

        $(this).addClass('hovered');
      });
    }

    function onTouchEnd() {
      $(el).on('touchend', function(e) {
        var startX = $('div').data('start-x'),
            startY = $('div').data('start-y');

        if ( startX === x && startY === y ) {
          if (options.link) {
            window.open($(el).data('link'), options.target);
          }

          if (options.tap) {
            options.tap($(el));
          }
        }

        $(this).removeClass('hovered');

        x = 0;
        y = 0;

        e.preventDefault();
      });
    }

    function onTouchMove() {
      $(el).on('touchmove', function(e) {

        var touch = touchEvent(e);

        x = touch.pageX;
        y = touch.pageY;
      });
    }

    listen();

    return {};
};

// Plugin wrapp
$.fn.tap = function(options) {
  return this.each(function() {
  if (!$(this).data('tap'))
    $(this).data('tap', new tap(this, options));
  });
};

