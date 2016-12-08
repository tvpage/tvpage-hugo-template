define(function(require) {

    var $ = require("jquery-private");

    $.ajax({
        url: "http://localhost:1313/tvpwidget/media1/"
    }).done(function(res){
        $('body').append(res);
    });

    // var gallery = require('static/scripts/src/gallery');
    // gallery.init();
    // var button = require('static/scripts/src/button');
    // button.init();

    return false;

});