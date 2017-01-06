// https://github.com/jrburke/r.js/blob/master/build/example.build.js
requirejs.config({
    baseUrl: './',
    paths: {
        "jquery-private": './src/js/jquery-loader',
        dist: './dist'
    },
    name: 'vendor/almond',
    optimize: 'none',
    include: ['src/js/index'],
    insertRequire: ['src/js/index'],
    out: './dist/js-lib.js',
    wrap: true
})
