// https://github.com/jrburke/r.js/blob/master/build/example.build.js
requirejs.config({
    baseUrl: './',
    paths: {
        "jquery-private": 'js/jquery-loader',
        iscroll: 'vendor/iscroll',
    },
    name: 'vendor/almond',
    //optimize: 'uglify2',
    optimize: 'none',
    include: ['js/index'],
    insertRequire: ['js/index'],
    out: './lib.js',
    wrap: true
})
