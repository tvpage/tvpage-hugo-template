var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
var baseUrl = config.baseUrl;
var static = config.baseUrl + '/' + config.type;
var files = {
  javascript: [
    '//www.youtube.com/iframe_api',
    '//a.tvpage.com/tvpa.min.js',
    baseUrl + '/playerlib-debug.min.js',
    static + '/dist/js/scripts.min.js'
  ],
  css: [
    static + '/dist/css/styles.min.css'
  ],
  debug: {
    javascript: [
      '//www.youtube.com/iframe_api',
      '//a.tvpage.com/tvpa.min.js',
      baseUrl + '/playerlib-debug.min.js',
      static + '/js/vendor/jquery.js',
      baseUrl + '/libs/analytics.js',
      baseUrl + '/libs/carousel.js',
      baseUrl + '/libs/player.js'
    ],
    css: [
      baseUrl + '/slick/slick.css'
    ]
  }
};

files.debug.css.push(baseUrl + '/slick/' + (isMobile ? 'mobile/' : '') + 'custom.css');

config.files = files;