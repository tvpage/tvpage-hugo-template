(function(){
  if(!isObject(config) || !hasKey(config, "name") || config.name.length <= 0)
    throw new Error("widget must have config and name/id");

  var tvpage = window.__TVPage__ = window.__TVPage__ || {};
  var id = config.name;

  if(hasKey(tvpage.config, id) && isObject(tvpage.config[id])){
    var runTime = tvpage.config[id];
    for (var key in runTime)
      config[key] = runTime[key];
  }

  if(!hasKey(config, "targetEl"))
    throw new Error("targetEl not present in config");

  if(!hasKey(config,'channel') && !hasKey(config,'channelId') && !hasKey(config,'channelid'))
    throw new Error('Widget config missing channel obj');

  config.__windowCallbackFunc__ = null;
  var onChange = config.onChange;

  if(isFunction(onChange)){
    config.__windowCallbackFunc__ = onChange;
    delete config.onChange;
  }

  config.id = id;
  config.holder = null;
  config.loginId = config.loginId || config.loginid;
  config.channelId = config.channelId || config.channelid || config.channel.id;

  config.events = {
    prefix: ('tvp_' + id).replace(/-/g, '_')
  };

  //we want to remove the extra fwd slash that HUGO adds locally
  if(config.debug){
    config.baseUrl = config.baseUrl.substring(0, config.baseUrl.length - 1);
  }

  var static = config.baseUrl + '/' + config.type;
  var dist = config.debug ? '/' : '/dist/';

  config.paths = {
    static: static,
    dist: dist,
    css: static + dist + 'css',
    javascript: static + dist + 'js'
  };

  var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  config.mobile = {
    path: mobile ? 'mobile' : '',
    prefix: mobile ? '-mobile' : '',
    templates: config.templates.mobile
  };

  window.__TVPage__.config[id] = config;
}());