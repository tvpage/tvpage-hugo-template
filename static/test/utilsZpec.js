describe('Utils', function() {

  beforeEach(function(){
    fixture.setBase('test/fixtures');
    fixture.load('json/globalConfig.json', 'html/utils.html');

    this.globalConfig = fixture.json[0];
    this.dummyTimeStamp = 1520028790963;
  });

  it("should exist and not be empty", function(){
    expect(Utils).toBeTruthy();
    expect(typeof Utils).toBe('object');
    expect(Object.keys(Utils).length).toBeTruthy();
  });

  it("should get an element by id selector", function(){
    expect(Utils.getById('element')).toBeTruthy();
  });

  it("should get an element by a class selector", function(){
    expect(Utils.getByClass('element')).toBeTruthy();
  });

  it("should check if object has key", function(){
    expect(Utils.hasKey({key:true}, 'key')).toBeTruthy();
  });

  it("should check if element has class", function(){
    expect(Utils.hasClass(document.getElementById('element'), 'element')).toBeTruthy();
  });

  it("should check if something is an object", function(){
    expect(Utils.isObject({})).toBeTruthy();
  });

  it("should check if something is a function", function(){
    expect(Utils.isFunction(function(){})).toBeTruthy();
  });

  it("should merge one or many objects", function(){
    var obj = {};

    expect(Utils.extend(obj)).toBe(obj);
    
    var merged;

    expect(function(){
      merged = Utils.extend({text:"dude"}, {text:"wei"}, {text:"duke"});
    }).not.toThrow();

    expect(merged.text == "duke").toBeTruthy();
  });

  it("should check if object is empty", function(){
    expect(Utils.isEmpty({blah:true})).toBeFalsy();

    var obj = {};

    expect(Utils.isEmpty(obj)).toBeTruthy();

    obj = function anEmptyObj(){};

    expect(Utils.isEmpty(obj)).toBeTruthy();

    function anEmptyObjWithAProtoProp(){};

    anEmptyObjWithAProtoProp.prototype.blah = true;

    obj = new anEmptyObjWithAProtoProp();

    expect(Utils.isEmpty(obj)).toBeTruthy();
  });

  it("should get an element's style property", function(){
    expect(Utils.getStyle(Utils.getById('element'), 'height')).toBe('0px');
  });

  it("should load a script with a given url", function(){
    var globalConfig = this.globalConfig;
    var check;
    
    Utils.loadScript({
      base: '//api.tvpage.com/v1/videos',
      params: {
        'X-login-id': globalConfig.loginId
      }
    }, function(data){
      check = data;
    });

    waitsFor(function() {
      return !!check;
    }, "callback shall be executed", 10000);

    runs(function() {
      expect(Array.isArray(check)).toBeTruthy();
    });
  });

  it("should check if something is a string", function(){
    expect(Utils.isString('height')).toBeTruthy();
  });

  it("should check if something is a number", function(){
    expect(Utils.isNumber(1)).toBeTruthy();
  });

  it("should check if something is null", function(){
    expect(Utils.isNull(null)).toBeTruthy();
  });

  it("should check if a string has a dot as a substring", function(){
    expect(Utils.hasDot('hey.com')).toBeTruthy();
  });

  it("should remove properties with falsy values", function(){
    expect(Utils.isEmpty(Utils.compact({hey:''}))).toBeTruthy();
  });

  it("should check if a given element exists in the document object", function(){
    expect(Utils.inDom(Utils.getById('element'))).toBeTruthy();
  });

  it("should get the value of a element's attribute", function(){
    expect( Utils.attr(Utils.getById('element'), 'id') ).toBe('element');
  });

  it("should create an element", function(){
    expect(Utils.createEl('div') instanceof Element).toBeTruthy();
  });

  it("should remove an element from the document object", function(){
    Utils.remove(Utils.getById('element'));

    expect(Utils.getById('element')).toBe(null);
  });

  it("should add a CSS class to a given element", function(){
    Utils.addClass(Utils.getById('element'), 'other-class');

    expect(Utils.hasClass(Utils.getById('element'), 'other-class')).toBeTruthy();
  });

  it("should remove a CSS class to a given element", function(){
    Utils.removeClass(Utils.getById('element'), 'element');

    expect(Utils.hasClass(Utils.getById('element'), 'element')).toBeFalsy();
  });

  it("should remove properties with null values", function(){
    expect(Utils.isEmpty(Utils.removeNulls({hey:null}))).toBeTruthy();
  });

  it("should check if something is undefined", function(){
    expect(Utils.isUndefined(window.what)).toBeTruthy();
  });

  it("should copy an object", function(){
    var original = {
      text:'red'
    };

    var copied = Utils.copy(original);

    copied.text = 'green';

    expect(original.text).toBe('red');
    expect(copied.text).toBe('green');
  });

  it("should format time passed in seconds", function(){
    expect(Utils.formatDuration(60)).toBe('01:00');
  });

  it("should trim passed text and add ellipsis", function(){
    expect(Utils.trimText('hello', 4)).toBe('hell...');
  });

  it("should trim passed price text", function(){
    expect(Utils.trimPrice('39.9900')).toBe('$39.99');
  });

  it("should chop an array into pieces", function(){
    expect(Utils.rowerize([0,1,2,3,4,5,6,7,8,9], 2).length).toBe(5)
  });

  it("should return the window's width", function(){
    expect(Utils.getWindowWidth()).toBeGreaterThan(1);
  });

  it("should return the window's height", function(){
    expect(Utils.getWindowHeight()).toBeGreaterThan(1);
  });

  it("should render having a string template and an object as context", function(){
    expect(Utils.tmpl('', null)).toBeFalsy();
    expect(Utils.tmpl('{text}', {text: 'hello'})).toBe('hello');
  });

  it("should poll", function(){
    expect(function(){
      Utils.poll('some',function(){
        check = true;
      });
    }).toThrow("need function for check argument");

    var text = "";
    var check = false;

    setTimeout(function(){
      text = "hello";
    }, 1000);

    Utils.poll(function(){
      return text;
    },function(){
      check = true;
    });

    waitsFor(function() {
      return check;
    }, "check shall pass", 3000);

    runs(function() {
      expect(check).toBe(true);
    });
  });

  it("should get the string params from current location's url", function(){
    expect(Utils.isEmpty(Utils.getUrlParams())).toBeTruthy();
  });

  it("should poll for a passed array of globals", function(){
    var check = false;

    Utils.globalPoll(['TVPage', '_tvpa'],function(){
      check = true;
    });

    waitsFor(function() {
      return check;
    }, "check shall pass", 3000);

    runs(function() {
      expect(check).toBe(true);
    });
  });

  it("should get current timestamp", function(){
    expect(Utils.now()).toBeGreaterThan(0);
  });

  it("should log without breaking", function(){
    expect(function(){
      Utils.log('hello');
    }).not.toThrow();
  });

  it("should get the closest element", function(){
    var fixtureEl = Utils.closest(Utils.getById('element'), function(el){
      return 'fixture_container' === el.id;
    });

    expect(fixtureEl instanceof Element).toBeTruthy();
    expect(fixtureEl.id).toBe('fixture_container');
  });

  it("should return an element if it has a given class otherwise will look for it on its parents", function(){
    var el = Utils.getById('element');
    var childEl = Utils.createEl('div');

    el.appendChild(childEl);

    var realEl = Utils.getRealTargetByClass(childEl, 'element');

    expect(realEl instanceof Element).toBeTruthy();
    expect(Utils.hasClass(realEl, 'element')).toBeTruthy();
  });

  it("should post a message to the parent window if exists", function(){
    expect(function(){
      Utils.sendMessage({text:'hello'});
    }).not.toThrow();
  });

  it("should debounce the execution of a function", function(){
    var check = false;

    Utils.debounce(function(){
      check = true;
    }, 500)();

    expect(check).toBe(false);

    waitsFor(function(){
      return check;
    }, 'check should change', 1000);

    runs(function(){
      expect(check).toBe(true);
    });
  });

  it("should stop a click event", function(){
    expect(function(){
      Utils.stopEvent(new MouseEvent('click'));
    }).not.toThrow();
  });
});