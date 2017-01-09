// https://github.com/jrburke/r.js/blob/master/build/example.build.js
requirejs.config({
    baseUrl: './',
    paths: {
        "jquery-private": 'js/jquery-loader',
        'jquery-pubsub': 'js/jquery.pubsub-loader',
        underscore: './vendor/underscore.min',
        slick: 'vendor/slick.min',
        iscroll: 'vendor/iscroll',
        tmpl: 'js/tmpl',
        dist: './dist'
    },
    name: 'vendor/almond',
    optimize: 'uglify2',
    include: ['js/index'],
    insertRequire: ['js/index'],
    out: './lib-min.js',
    wrap: true
})
