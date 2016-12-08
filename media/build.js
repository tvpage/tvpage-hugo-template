requirejs.config({
    baseUrl: './',
    paths: {
        'jquery-private': 'static/scripts/jquery-loader'
    },
    wrap: true,
    name: '../../../node_modules/almond/almond',
    optimize: 'none',
    include: ['static/scripts/main'],
    insertRequire: ['static/scripts/main'],
    out: 'static/dist/js/media.js'
})
