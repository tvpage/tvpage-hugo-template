requirejs.config({
  baseUrl: './',
  paths: {
    'jquery-private': 'static/jquery-loader',
    'iscroll': 'static/iscroll-min'
  },
  wrap: true,
  name: '../../../../node_modules/almond/almond',
  optimize: 'none',
  include: ['static/main'],
  insertRequire: ['static/main'],
  out: 'static/dist/js/lib.js'
})
