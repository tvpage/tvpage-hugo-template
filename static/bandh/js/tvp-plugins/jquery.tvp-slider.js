;(function ( $, window, document, undefined ) {
  var tvpSlider = function(el, options) {
    var defaults = {
      itemsPerSlide: 1,
      arrowLeft: '#tvp-slider-left',
      arrowRight: '#tvp-slider-right'
    };

    options = $.extend({}, defaults, options);

    var qty = $(el).find('.tvp-slide').length,
        last = function(){
          return 'slidesLength' in  options ? options.slidesLength - 1 : (qty - 1);
        },
        lock,
        center = 0,
        slideTemplate = '<div id="tvp-slide-{i}" data-index="{i}" class="tvp-slide clearfix">',
        onSlideEnd = function($el, callback) {
          if ($el && callback) {
            var end = 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd';
            $el.on(end, callback);
          }
        },
        isXAxis = function(side){
          if (side) {
            return ('right' === side || 'left' === side);
          }
        },
        isMinus = function(side){
          if (side) {
            return ('left' === side || 'top' === side);
          }
        },
        inside = function(sel){
          if (sel) {
            return $(el).find(sel);
          }
        },
        getPrev = function(i){
          if (i !== undefined) {
            return (i - 1) < 0 ? last() : (i - 1);
          }
        },
        getNext = function(i){
          if (i !== undefined) {
            return i !== last() ? (i + 1) : 0;
          }
        },
        cloneAppend = function(i){
          if (i !== undefined) {
            return inside('#tvp-slide-' + i).clone().appendTo('#tvp-slider').addClass('clnd');
          }
        },
        needToClone = function(callback){
          var n = getNext(center), p =  getPrev(center), r = true;
          if (n === p) {
            inside('.clnd').filter(function(){ if ($(this).data('index') === n) { r = false; }});
            callback(r);
          } else {
            callback(false);
          }
        },
        needToLoad = function(callback){
          var n = getNext(center), r = false, required = null, side;
          if (!inside('#tvp-slide-' + n).length) {
            r = true; required = n; side = 'n';
          }
          var p = getPrev(center);
          if (!inside('#tvp-slide-' + p).length) {
            r = true; required = p; side = 'p';
          }
          callback(r, required, side);
        };

    // jQuery helpers
    $.fn.tvpClearClass = function() {
      return this.removeClass('c n p q');
    }

    $.fn.tvpAddAnimSettings = function(settings) {
      var trans = '-webkit-transform ';
      if ('object' === typeof settings) {
        if ('speed' in settings && settings.speed) {
          trans += settings.speed + ' ';
        } else {
          trans += '0.05s ';
        }
        if ('easing' in settings) {
          trans += settings.easing;
        } else {
          trans += 'ease-in-out';
        }
        this.css({
          '-webkit-transition' : trans,
          '-moz-transition' : trans,
          '-o-transition' : trans,
          '-ms-transition' : trans,
          'transition' : trans
        });
      }
    }

    $.fn.tvpMove = function(options) {
      if ('object' === typeof options) {
        if ('value' in options) {
          var trans = 'translate3d(', val = options.value;
          onSlideEnd(this, options.complete || '');
          $(this).tvpAddAnimSettings(options);
          if ('side' in options) {
            var x = isXAxis(options.side), _ = isMinus(options.side);
            if (x && _) {
              val = String(val * - 1);
              trans += val + '%,0,0)';
            } else if (x) {
              trans += val + '%,0,0)';
            } else {
              if (_) {
                val = String(val * - 1);
              } else {
                trans += '0,' + val + '%,0)';
              }
            }
          } else {
            trans = 'translate(0,0,0)';
          }

          return $(this).css({
            '-webkit-transform': trans,
            '-moz-transform': trans,
            '-o-transform': trans,
            '-ms-transform': trans,
            'transform': trans
          });
        }
      }
    }

    $.fn.tvpQueue = function(callback) {
      this.tvpMove({
        value : 500,
        side  : 'bottom',
        complete: callback ? callback(this) : null
      }).tvpClearClass().addClass('q');
    }

    $.fn.tvpCenter = function(s) {
      this.tvpMove({
        value : 0,
        speed : s || null
      }).tvpClearClass().addClass('c');
    }

    $.fn.tvpPrev = function(s, callback) {
      return this.tvpMove({
        value : 100,
        side  : 'left',
        speed : s || null,
        complete : callback ? callback(this) : null
      }).tvpClearClass().addClass('p');
    }

    $.fn.tvpNext = function(s, callback) {
      return this.tvpMove({
        value : 100,
        side  : 'right',
        speed : s || null,
        complete : callback ? callback(this) : null
      }).tvpClearClass().addClass('n');
    }

    function getQueue(callback) {
      if (callback) {
        return callback(inside('.q'));
      }
    }

    // Checks for prev and do updates accordingly
    function checkPrev() {
      var prev = getPrev(center);
      if ( 2 === qty && !options.slidesLength) {
        needToClone(function(r){
          if (r) {
            hiddenPrev(cloneAppend(prev));
          } else {
            hiddenPrevFromQueue(prev);
          }
        });
      } else {
        if (inside('#tvp-slide-' + prev).length) {
          hiddenPrevFromQueue(prev);
        } else {
          options.update(prev, function(data){
            render(prev, data, function($slide){
              hiddenPrev($slide);
            });
          });
        }
      }
    }

    // Checks for next and do updates accordingly
    function checkNext() {
      var next = getNext(center);
      if (2 === qty && !options.slidesLength) {
        needToClone(function(r){
          if (r) {
            hiddenNext(cloneAppend(next));
          } else {
            hiddenNextFromQueue(next);
          }
        });
      } else {
        if (inside('#tvp-slide-' + next).length) {
          hiddenNextFromQueue(next);
        } else {
          options.update(next, function(data){
            render(next, data, function($slide){
              hiddenNext($slide);
            });
          });
        }
      }
    }

    // Do the slide effect and update state
    function handlePrev () {
      inside('.n').tvpQueue();
      inside('.c').tvpNext('0.25s');
      inside('.p').tvpCenter('0.25s');
      center = getPrev(center);
      checkPrev();
    }

    // Do the slide effect and update state
    function handleNext () {
      inside('.p').tvpQueue();
      inside('.c').tvpPrev('0.25s');
      inside('.n').tvpCenter('0.25s');
      center = getNext(center);
      checkNext();
    }

    // Clicks listening
    function listen () {
      var clickEvent;
      if ('mobile' in options && options.mobile) {
        clickEvent = 'touchend';
      } else {
        clickEvent = 'click';
      }
      $(options.arrowLeft).on(clickEvent, function(e){
        e.preventDefault();
        if (!lock) {
          lock = true;
          handlePrev();
          setTimeout(function(){ lock = false; }, 250);
        }
      });
      $(options.arrowRight).on(clickEvent, function(e){
        e.preventDefault();
        if (!lock) {
          lock = true;
          handleNext();
          setTimeout(function(){ lock = false; }, 250);
        }
      });
    }

    // Hidden Next
    function hiddenNext ($el) {
      if ($el) {
        $el.hide();
        setTimeout(function(){
          $el.tvpNext('0.05', function($l){ $l.show(); });
        },180);
      }
    }

    // Hidden Next Form Queue
    function hiddenNextFromQueue (next) {
      getQueue(function($queue){
        $queue.filter(function(){
          if (next === $(this).data('index')) {
            hiddenNext($(this));
          }
        });
      });
    }

    // Hidden Prev
    function hiddenPrev ($el) {
      if ($el) {
        $el.hide();
        setTimeout(function(){
          $el.tvpPrev('0.05', function($l){ $l.show(); });
        },180);
      }
    }

    // Hidden Prev Form Queue
    function hiddenPrevFromQueue (prev) {
      getQueue(function($queue){
        $queue.filter(function(){
          if (prev === $(this).data('index')) {
            hiddenPrev($(this));
          }
        });
      });
    }

    /**
     * Templating function, pass it an html template string and its
     * data. From nano: https://github.com/trix/nano
     */
    function tmpl(template, data) {
      return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
        var keys = key.split('.'), v = data[keys.shift()];
        for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
        return (typeof v !== 'undefined' && v !== null) ? v : '';
      });
    }

    function render (index, data, callback) {
      if (undefined !== index && data.length) {
        var slide = tmpl(slideTemplate, {i:index});
        for (var i = 0; i < data.length; ++i) {
          slide += tmpl(options.slideItemTemplate, data[i]);
        }
        $(el).append(slide);
        var $slide = inside('#tvp-slide-' + index);
        callback($slide);
        if ('newSlide' in options && 'function' === typeof options.newSlide) {
          options.newSlide($slide);
        }
      }
    }

    // Can't slide without prev & next right? clone if required
    function initialCheck () {
      if (2 === qty && !options.slidesLength) {
        needToClone(function(r){
          if (r) {
            var $clone = cloneAppend(getPrev(center));
            hiddenPrev($clone);
            var $next = inside('#tvp-slide-' + getNext(center));
            if ($next.hasClass('q')) { hiddenNext($next); }
          } else {
            var $next = inside('#tvp-slide-' + getNext(center));
            hiddenNext($next);
            var $prev = inside('#tvp-slide-' + getPrev(center));
            hiddenPrev($prev);
          }
        });
      } else if (options.slidesLength) {
        needToLoad(function(res, index, side){
          if (res) {
            options.update(index, function(data){
              render(index, data, function($slide){
                if ('p' === side) {
                  hiddenPrev($slide);
                  var $next = inside('#tvp-slide-' + getNext(center));
                  hiddenNext($next);
                } else {
                  hiddenNext($slide);
                  var $prev = inside('#tvp-slide-' + getPrev(center));
                  hiddenPrev($prev);
                }
              });
            });
          } else {
            var $next = inside('#tvp-slide-' + getNext(center));
            hiddenNext($next);
            var $prev = inside('#tvp-slide-' + getPrev(center));
            hiddenPrev($prev);
          }
        });
      } else {
        var $next = inside('#tvp-slide-' + getNext(center));
        hiddenNext($next);
        var $prev = inside('#tvp-slide-' + getPrev(center));
        hiddenPrev($prev);
      }
    }

    // Center first & queue all but it
    function initialSetup () {
      inside('.tvp-slide')
      .first()
      .addClass('c')
      .end()
      .slice(1)
      .tvpQueue();
    }

    // Wont do anything with one slide
    if (!lock && qty > 1) {
      lock = true;
      initialSetup();
      initialCheck();
      listen();
      lock = false;
    }
  };

  $.fn.tvpSlider = function(options) {
    return this.each(function() {
    if (!$(this).data('tvpSlider'))
      $(this).data('tvpSlider', new tvpSlider(this, options));
    });
  };

})( jQuery, window, document );