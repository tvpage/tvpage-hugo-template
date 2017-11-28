/** global: __TVPage__ */
//walmart.com
var shortEl = "prod-Bot prod-PositionedRelative";
var largeEl = "topContent";
//qvc.com
//var shortEl = "buyBoxPricing";
//var largeEl = "itemNo";

//homedepot.com
//var shortEl = "buybox";
//var largeEl = "card__body scrollTouch";
/*options: solo solo_cta carousel carousel_spotlight inline inline_spotlight sidebar*/
var widgetToTest = "carousel";
//change testNew to false for old widgets
var testNew = true;

var createEl = function(els,id){
  var el = null;
  if(els.length>0)
    el = els[0];
  else
    el = els;
  var target = document.createElement("div");
  target.id = id;
  el.appendChild(target);
};
var widget = {
  solo_cta :{
    large : false,
    newWidget : function(els){
      createEl(els,"solo-cta-2");
      return function(){
        var id = "solo-cta-2";
        (function(d, s) {
          __TVPage__ = window.__TVPage__ || {};
          __TVPage__.config = __TVPage__.config || {};
          __TVPage__.config[id] = {
            debug: Number(""),
            targetEl: id,
            channel: {
              id: '66133904'
            }
          };
          var js = d.createElement(s),
          fjs = d.getElementsByTagName(s)[0];js.src = 'https:\/\/widgets.goodlookingbean.com\/tvpwidget\/solo-cta-2/index.js';fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script'));
      }
    },
    oldWidget : function(els){
      createEl(els,"solo-1");
      return function(){
        var id = "solo-1";
        (function(d, s) {
          __TVPage__ = window.__TVPage__ || {};
          __TVPage__.config = __TVPage__.config || {};
          __TVPage__.config[id] = {
            debug: Number("") || 0,
            targetEl: id
          };

          window.addEventListener("load", function() {
            var js = d.createElement(s),
            fjs = d.getElementsByTagName(s)[0];js.src = 'https:\/\/www.goodlookingbean.com\/tvpwidget\/solo-1/index.js';fjs.parentNode.insertBefore(js, fjs);
          }, false);
          }(document, 'script'));
      }
    }
  },
  solo : {
    large : false,
    newWidget : function(){
      createEl(els,"solo-1");
      return function(){
        var id = "solo-1";
        (function(d, s) {
        __TVPage__ = window.__TVPage__ || {};
        __TVPage__.config = __TVPage__.config || {};
        __TVPage__.config[id] = {
          debug: Number("") || 0,
          targetEl: id
        };

        window.addEventListener("load", function() {
          var js = d.createElement(s),
          fjs = d.getElementsByTagName(s)[0];js.src = 'https:\/\/www.goodlookingbean.com\/tvpwidget\/solo-1/index.js';fjs.parentNode.insertBefore(js, fjs);
        }, false);
        }(document, 'script'));
      };
    },
    oldWidget : function(){
      createEl(els,"solo-2");
      return function(){
        var id = "solo-2";
        (function(d, s) {
          __TVPage__ = window.__TVPage__ || {};
          __TVPage__.config = __TVPage__.config || {};
          __TVPage__.config[id] = {

            debug: Number(""),
            targetEl: id,
            channel: {
              id: '66133904'
            },


          };

          var js = d.createElement(s),
          fjs = d.getElementsByTagName(s)[0];js.src = 'https:\/\/widgets.goodlookingbean.com\/tvpwidget\/solo-2/index.js';fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script'));
      }
    }
  },
  carousel : {
    large : true,
    oldWidget : function(els){
      createEl(els,"carousel-1");
      return function(){
        var id = "carousel-1";
        (function(d, s) {
          __TVPage__ = window.__TVPage__ || {};
          __TVPage__.config = __TVPage__.config || {};
          __TVPage__.config[id] = {
            debug: Number("") || 0,
            targetEl: id
          };

          window.addEventListener("load", function() {
            var js = d.createElement(s),
            fjs = d.getElementsByTagName(s)[0];js.src = 'https:\/\/www.goodlookingbean.com\/tvpwidget\/carousel-1/index.js';fjs.parentNode.insertBefore(js, fjs);
          }, false);
        }(document, 'script'));
      }
    },
    newWidget : function(els){
      createEl(els,"carousel-2");
      return function(){
        var id = "carousel-2";
        (function(d, s) {
          __TVPage__ = window.__TVPage__ || {};
          __TVPage__.config = __TVPage__.config || {};
          __TVPage__.config[id] = {

            debug: Number(""),
            targetEl: id,
            channel: {
              id: '66133904'
            }
          };

          var js = d.createElement(s),
          fjs = d.getElementsByTagName(s)[0];js.src = 'https:\/\/widgets.goodlookingbean.com\/tvpwidget\/carousel-2/index.js';fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script'));
      }
    }
  },
  carousel_spotlight : {
    large: true,
    newWidget : function(els){
      createEl(els,"carousel-spotlight-2");
      return function(){
        var id = "carousel-spotlight-2";
        (function(d, s) {
          __TVPage__ = window.__TVPage__ || {};
          __TVPage__.config = __TVPage__.config || {};
          __TVPage__.config[id] = {
            debug: Number(""),
            targetEl: id,
            channel: {
              id: '66133904'
            }
          };

          var js = d.createElement(s),
          fjs = d.getElementsByTagName(s)[0];js.src = 'https:\/\/widgets.goodlookingbean.com\/tvpwidget\/carousel-spotlight-2\//index.js';fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script'));
      };
    },
    oldWidget : function(els){
      createEl(els,"carousel-spotlight-1");
      return function(){
        var id = "carousel-spotlight-1";
        (function(d, s) {
          __TVPage__ = window.__TVPage__ || {};
          __TVPage__.config = __TVPage__.config || {};
          __TVPage__.config[id] = {
            debug: Number("") || 0,
            targetEl: id
          };

          window.addEventListener("load", function() {
            var js = d.createElement(s),
            fjs = d.getElementsByTagName(s)[0];js.src = 'https:\/\/www.goodlookingbean.com\/tvpwidget\/carousel-spotlight-1/index.js';fjs.parentNode.insertBefore(js, fjs);
          }, false);
        }(document, 'script'));
      };
    }
  },
  inline : {
    large : true,
    newWidget : function(els){
      createEl(els,"inline-2");
      return function(){
        var id = "inline-2";
        (function(d,s){
          window.__TVPage__ = window.__TVPage__ || {};
          __TVPage__.config = __TVPage__.config || {};
          __TVPage__.config[id] = {
            debug: Number("") || 0,
            targetEl: id,
            loginid: "1758799",
            channel: {
                id: '66133904',
                parameters: {

                }
            }
          };
          window.addEventListener("load", function() {
            var js = d.createElement(s),
            fjs = d.getElementsByTagName(s)[0];js.src = 'https:\/\/widgets.goodlookingbean.com\/tvpwidget\/inline-2/index.js';fjs.parentNode.insertBefore(js, fjs);
          }, false);
        }(document, "script"));
      };
    },
    oldWidget : function(els){
      createEl(els,"inline-1");
      return function(){
        var id = "inline-1";
        (function(d,s){
          window.__TVPage__ = window.__TVPage__ || {};
          __TVPage__.config = __TVPage__.config || {};
          __TVPage__.config[id] = {
            targetEl: id,
            debug: Number("") || 0
          };

          window.addEventListener("load", function() {
            var js = d.createElement(s),
            fjs = d.getElementsByTagName(s)[0];js.src = 'https:\/\/www.goodlookingbean.com\/tvpwidget\/inline-1/index.js';fjs.parentNode.insertBefore(js, fjs);
          }, false);

        }(document, "script"));

      };
    }
  },
  inline_spotlight:{
    large : true,
    newWidget : function(els){
      createEl(els,"inline-spotlight-2");
      return function(){
        var id = "inline-spotlight-2";
        (function(d, s) {
        __TVPage__ = window.__TVPage__ || {};
        __TVPage__.config = __TVPage__.config || {};
        __TVPage__.config[id] = {
            debug: Number(""),
            targetEl: id,
            channel: {
            id: '66133904'
            }
        };

        var js = d.createElement(s),
        fjs = d.getElementsByTagName(s)[0];js.src = 'https:\/\/widgets.goodlookingbean.com\/tvpwidget\/inline-spotlight-2/index.js';fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script'));
      };
    },
    oldWidget : function(els){
      createEl(els,"inline-spotlight-1");
      return function(){
        var id = "inline-spotlight-1";
        (function(d, s) {
        __TVPage__ = window.__TVPage__ || {};
        __TVPage__.config = __TVPage__.config || {};
        __TVPage__.config[id] = {
          debug: Number("") || 0,
          targetEl: id
        };

        window.addEventListener("load", function() {
          var js = d.createElement(s),
          fjs = d.getElementsByTagName(s)[0];js.src = 'https:\/\/www.goodlookingbean.com\/tvpwidget\/inline-spotlight-1/index.js';fjs.parentNode.insertBefore(js, fjs);
        }, false);
        }(document, 'script'));
      };
    }
  },
  sidebar : {
    large : false,
    newWidget : function(els){
      createEl(els, "sidebar-1");
      return function(){
        var id = "sidebar-1";
        (function(d, s) {
          __TVPage__ = window.__TVPage__ || {};
          __TVPage__.config = __TVPage__.config || {};
          __TVPage__.config[id] = {
            debug: Number("") || 0,
            targetEl: id
          };

          window.addEventListener("load", function() {
            var js = d.createElement(s),
            fjs = d.getElementsByTagName(s)[0];js.src = 'https:\/\/widgets.goodlookingbean.com\/tvpwidget\/sidebar-1/index.js';fjs.parentNode.insertBefore(js, fjs);
          }, false);
        }(document, 'script'));
      }
    },
    oldWidget : function(els){
      createEl(els, "sidebar-1");
      return function(){
        var id = "sidebar-1";
        (function(d, s) {
         __TVPage__ = window.__TVPage__ || {};
         __TVPage__.config = __TVPage__.config || {};
         __TVPage__.config[id] = {
           debug: Number("") || 0,
           targetEl: id
         };

         window.addEventListener("load", function() {
           var js = d.createElement(s),
           fjs = d.getElementsByTagName(s)[0];js.src = 'https:\/\/www.goodlookingbean.com\/tvpwidget\/sidebar-1/index.js';fjs.parentNode.insertBefore(js, fjs);
         }, false);
       }(document, 'script'));
      };
    }
  }
}

var getContainer = function(selector){
  var container = document.getElementsByClassName(selector);
  return container;
}
window.startTime = "performance" in window ? window.performance.now() : new Date();
var containerShort = getContainer(shortEl);
var containerLarge = getContainer(largeEl);
var widgetTested = widgetToTest in widget ? widget[widgetToTest] : null;
if(widgetTested){
  var els = null;
  if(widgetTested.large)
    els = containerLarge;
  else
    els = containerShort;

  if(els.length){
    if(testNew){
      var run = widgetTested.newWidget(els);
      run();
    }else{
      var run = widgetTested.oldWidget(els);
      run();
    }
  }
  
}else{
  console.info("widget not found : ",widgetToTest);
}
