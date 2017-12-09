(function(){
  if(data){
    for(var key in data)
      config[key] = data[key];
  }

  if('object' !== typeof config || !config.name || config.name.length <= 0)
    throw new Error("widget must have config and name/id");

  var tvpage = window.__TVPage__ = window.__TVPage__ || {};
  var id = config.name;

  if(tvpage.config[id] && 'object' === typeof tvpage.config[id]){
    var runTime = tvpage.config[id];

    for (var key in runTime)
      config[key] = runTime[key];
  }

  if(!config.targetEl)
    throw new Error("targetEl not present in config");

  if(!config.channel && !config.channelId && !config.channelid)
    throw new Error('Widget config missing channel obj');

  config.__windowCallbackFunc__ = null;

  var onChange = config.onChange;

  if('function' === typeof onChange){
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