requirejs.config({
  baseUrl: './',
  paths: {
    'jquery-private': 'jquery-loader',
    'iscroll': 'iscroll-min'
  },
  wrap: true,
  name: 'node_modules/almond/almond',
  optimize: 'none',
  include: ['main'],
  insertRequire: ['main'],
  out: 'dist/js/lib.js'
})
