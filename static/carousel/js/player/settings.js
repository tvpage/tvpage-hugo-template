define({
    divId: 'tvpp-holder',
    controls: {
        active: true,
        seekBar: { progressColor: '#273691' },
        floater: { removeControls: ['tvplogo', 'hd'], transcript: false }
    },
    poster: true,
    techOrder: 'html5,flash',
    analytics: { tvpa: false },
    apiBaseUrl: '//app.tvpage.com',
    jsLib: '//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.3-min.js',
    swf: "//appcdn.tvpage.com/player/assets/tvp/tvp-1.8.3-flash.swf"
});
