define(function(require) {

    // Add globals with data from the backend.
    window._tvp = window._tvp || {};
    _tvp.assetsBaseUrl = true ? "//do0631budpzeh.cloudfront.net/live/tvsite/1758166/www.bedbathandbeyond.tv/2c89f5355fcf650a2241f7a2dd826681".replace('//', '').split('/').shift() : 'app.tvpage.com/tvsite/' + domain;;
    _tvp.lid = '1758166';

     //Aquire ID from URL
    var arr = window.location.href.split("/");
    arr.pop();
    var urlId = arr.pop();
    var isnum = /^\d+$/.test(urlId);
    var settings = JSON.parse("\x7B\x2210517\x22\x3A\x2281791048\x22,\x2212962\x22\x3A\x2281791045\x22,\x2213138\x22\x3A\x2281791055\x22,\x2214307\x22\x3A\x2277559778\x22,\x22analytics\x2Dcartridge\x2Did\x22\x3A\x221190\x22,\x22placeholder\x2Did\x22\x3A\x22tvp\x2Dgallery\x22,\x22videos\x2Dslider\x2D1\x22\x3A\x221189\x22,\x22default\x2Dchannel\x22\x3A\x2266716699\x22,\x22demo\x2Dcat\x22\x3A\x2266716699\x22,\x22related\x2Dproducts\x2Ddesktop\x22\x3A\x221638\x22\x7D");

    _tvp.channelId = 81791055;
    
    if(isnum){
        _tvp.urlId = urlId;
    }

    _tvp.chgEndpoint = "//app.tvpage.com/tvsite/www.bedbathandbeyond.tv/cartridge/" + settings["videos-slider-1"];
    _tvp.analyticsEndpoint = "//app.tvpage.com/tvsite/www.bedbathandbeyond.tv/cartridge/" + settings["analytics-1"];
    _tvp.relatedProductsDesktop = "//app.tvpage.com/tvsite/www.bedbathandbeyond.tv/cartridge/" + settings["related-products-desktop"];
});
