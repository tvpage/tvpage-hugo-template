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

var prefix = ('tvp_' + id).replace(/-/g, '_');

config.id = id;
config.runId = prefix + Math.floor(Math.random() * 1000000);
config.holder = null;
config.loginId = config.loginId || config.loginid;
config.channelId = config.channelId || config.channelid || config.channel.id;
config.profiling = config.profiling || {};

var playerUrl = (config.player_url + '').trim();

config.player_url = playerUrl.length ? playerUrl : 'https://cdnjs.tvpage.com/tvplayer/tvp-' + config.player_version + '.min.js';

if(window.performance)
  config.profiling['script_loaded'] = performance.now();

config.events = {
  prefix: prefix,
  initialized: prefix + ':widget_initialized',
  resize: prefix + ':widget_resize',
  playerChange: prefix + ':widget_player_change',
};

if('localhost' === location.hostname){
  config.baseUrl = config.baseUrl.substring(0, config.baseUrl.length - 1);
}

window.__TVPage__.config[id] = config;