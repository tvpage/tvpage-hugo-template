;(function() {

    var tmpl = function(template, data) {
        if (template && 'object' == typeof data) {
            return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
                var keys = key.split("."),
                    v = data[keys.shift()];
                for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
                return (typeof v !== "undefined" && v !== null) ? v : "";
            });
        }
    };

    var template = '.tvp-video-play {' +
        'border-radius: {item_play_button_border_radius};'+
    'border: {item_play_button_border};'+
    'background-color: {item_play_button_background};'+
    'width: {item_play_button_width};'+
    'height: {item_play_button_height};';

    function CSS(data) {
        if (!data) return;

        console.log( tmpl(template, data) );

    }

    window.CSS = CSS;

}());