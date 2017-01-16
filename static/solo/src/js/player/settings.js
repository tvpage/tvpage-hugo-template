define({
    controls: {
        active: true,
        seekBar: { progressColor: __TVPage__.config[0].settings.progresscolor },
        floater: { removeControls:  __TVPage__.config[0].settings.removecontrols, transcript:  __TVPage__.config[0].settings.transcript  }
    },
    poster: true,
    techOrder: 'html5,flash',
    analytics: { tvpa: false },
    apiBaseUrl: '//app.tvpage.com',
    swf: "//d2kmhr1caomykv.cloudfront.net/player/assets/tvp/tvp-1.8.3-flash.swf"
});
