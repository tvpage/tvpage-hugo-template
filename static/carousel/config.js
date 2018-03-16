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
config.firstPartyCookies = config.firstPartyCookies || config.firstpartycookies;
config.cookieDomain = config.cookieDomain || config.cookiedomain;
config.channelId = config.channelId || config.channelid || config.channel.id;
config.profiling = config.profiling || {};

var displayAmount = config.video_item_display_amount;

config.items_per_page = Number(!!displayAmount ? displayAmount : config.items_per_page);

if(window.performance)
  config.profiling['script_loaded'] = performance.now();

var playerUrl = (config.player_url + '').trim();

config.player_url = playerUrl.length ? playerUrl : 'https://cdnjs.tvpage.com/tvplayer/tvp-' + config.player_version + '.min.js';

config.events = {
  prefix: prefix,
  initialized: prefix + ':widget_initialized',
  resize: prefix + ':widget_resize',
  player:{
    change: prefix + ':widget_player_change'
  },
  modal:{
    initialized: prefix + ':widget_modal_initialized',
    open: prefix + ':widget_modal_open',
    close: prefix + ':widget_modal_close',
    resize: prefix + ':widget_modal_resize'
  }
};

if('localhost' === location.hostname){
  config.baseUrl = config.baseUrl.substring(0, config.baseUrl.length - 1);
}

window.__TVPage__.config[id] = config;