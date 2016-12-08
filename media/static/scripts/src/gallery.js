define(function(require) {

    var $ = require("jquery-private");
    var status = ["pending","approved","reviewed","processing"];

    return {
        init: function(){
            var cols = "";
            for (var i = 0; i < 3; i++) {
                cols += '<div class="thumbnail"> <img alt="100%x200" data-src="holder.js/100%x200" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMzE4IiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMxOCAyMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjwhLS0KU291cmNlIFVSTDogaG9sZGVyLmpzLzEwMCV4MjAwCkNyZWF0ZWQgd2l0aCBIb2xkZXIuanMgMi42LjAuCkxlYXJuIG1vcmUgYXQgaHR0cDovL2hvbGRlcmpzLmNvbQooYykgMjAxMi0yMDE1IEl2YW4gTWFsb3BpbnNreSAtIGh0dHA6Ly9pbXNreS5jbwotLT48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPjwhW0NEQVRBWyNob2xkZXJfMTU4YzdhNWEzNzUgdGV4dCB7IGZpbGw6I0FBQUFBQTtmb250LXdlaWdodDpib2xkO2ZvbnQtZmFtaWx5OkFyaWFsLCBIZWx2ZXRpY2EsIE9wZW4gU2Fucywgc2Fucy1zZXJpZiwgbW9ub3NwYWNlO2ZvbnQtc2l6ZToxNnB0IH0gXV0+PC9zdHlsZT48L2RlZnM+PGcgaWQ9ImhvbGRlcl8xNThjN2E1YTM3NSI+PHJlY3Qgd2lkdGg9IjMxOCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFRUVFRUUiLz48Zz48dGV4dCB4PSIxMTcuNSIgeT0iMTA2Ljk5ODQzNzUiPjMxOHgyMDA8L3RleHQ+PC9nPjwvZz48L3N2Zz4=" data-holder-rendered="true" style="height: 200px; width: 100%; display: block;"><div class="caption"><p>Cras justo odio, dapibus ac facilisis in, egestas eget quam. Donec id elit non mi porta gravida at eget metus. Nullam id dolor id nibh ultricies vehicula ut id elit.</p></div></div>'
            }
            
            $("<div/>").addClass('row').append(cols).appendTo("#tvp-widget");

            //$("<div/>").addClass('.col-sm-6 col-md-6')

            //wont comeback as jsonp is not yet implemented.
            // $.ajax({
            //     url: "https://app.tvpage.com/api/videos?n=20&status=" +  status.join(","),
            //     dataType: "jsonp",
            //     headers: {
            //         'X-login-id':1758138
            //     }
            // }).done(function(res, status){
            // }); 

        }
    };

});