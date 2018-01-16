var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
var baseUrl = config.baseUrl;
var static = config.baseUrl + '/' + config.type;
var files = {
  javascript: [
    '//a.tvpage.com/tvpa.min.js',
    static + '/dist/js/scripts.min.js'
  ],
  css: [
    static + '/dist/css/styles.min.css'
  ],
  debug: {
    javascript: [
      '//a.tvpage.com/tvpa.min.js',
      baseUrl + '/libs/analytics.js',
      baseUrl + '/libs/grid.js'
    ],
    css: [
      static + '/css/styles.css'
    ]
  },
  modal:{
    javascript: [
      '//www.youtube.com/iframe_api',
      '//a.tvpage.com/tvpa.min.js',
      baseUrl + '/playerlib-debug.min.js',
      static + '/dist/js' + (isMobile ? '/mobile' : '') + '/modal/scripts.min.js'
    ],
    css: [
      static + '/dist/css' + (isMobile ? '/mobile' : '') + '/modal/styles.min.css'
    ],
    debug:{
      javascript:[
        '//www.youtube.com/iframe_api',
        '//a.tvpage.com/tvpa.min.js',
        baseUrl + '/playerlib-debug.min.js',
        static + '/js/vendor/jquery.js',
        baseUrl + '/libs/analytics.js',
        baseUrl + '/libs/player.js',
        baseUrl + '/libs/carousel.js',
        baseUrl + '/libs/rail.js',
        baseUrl + '/libs/modal.js',
        static + '/js' + (isMobile ? '/mobile' : '') + '/modal/index.js'
      ],
      css:[
        baseUrl + '/bootstrap/dist/css/bootstrap.css',
        baseUrl + '/slick/slick.css',
        static + '/css' + (isMobile ? '/mobile' : '') + '/modal/styles.css'
      ]
    }
  }
};

if(isMobile){
  files.modal.debug.css.push(baseUrl + '/slick/mobile/custom.css');
}else{
  files.modal.debug.css.push(static + '/css/vendor/perfect-scrollbar.min.css');
  files.modal.debug.javascript.push(static + '/js/vendor/perfect-scrollbar.min.js');
}

config.files = files;