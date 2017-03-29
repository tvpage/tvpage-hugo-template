;(function(window,document) {
    var render = function(target,data){
        if (!target) return;
        var frag = document.createDocumentFragment();
        var main = document.createElement('div');
        var d = data || {};

        main.id = d.id || '';
        main.classList.add('iframe-content');
        main.innerHTML = data.inlineTemplate;

        frag.appendChild(main);
        target.appendChild(frag);
    };

    var body = document.body;

    var initialize = function(){        
        var settings = {};
        var body = document.body;

        if (Utils.isset(parent) && Utils.isset(parent,'__TVPage__') && Utils.isset(parent.__TVPage__, 'config')) {
            settings = parent.__TVPage__.config[body.getAttribute('data-id')];
        }

        var inlineSettings = JSON.parse(JSON.stringify(settings));
        render(body,{
            id: settings.name,
            title: settings.title || 'Recommended Videos',
            inlineTemplate: settings.templates.inline
        });
        $.when(
            $.getScript('//a.tvpage.com/tvpa.min.js'),
            $.getScript('https://cdnjs.tvpage.com/tvplayer/tvp-'+settings.player_version+'.min.js')
        ).done(function (a, b) {
            Inline(settings.name, inlineSettings);
        });
    };

    initialize();
}(window, document));