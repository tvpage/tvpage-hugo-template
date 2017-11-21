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
    },
    isset = function(o,p){
            var val = o;
            if (p) val = o[p];
            return 'undefined' !== typeof val;
        };

    var body = document.body;

    var initialize = function(){       
        var settings = {};

        if (Utils.isset(parent) && Utils.isset(parent,'__TVPage__') && Utils.isset(parent.__TVPage__, 'config')) {
            settings = parent.__TVPage__.config[body.getAttribute('data-id')];
        }

        render(body,{
            id: settings.name,
            title: settings.title || 'Recommended Videos',
            inlineTemplate: settings.templates.inline
        });

        var checks = 0;
        (function libsReady(){
            setTimeout(function(){
                if ( (!isset(window,'TVPage') || !isset(window,'_tvpa')) && (++checks < 200) ) {
                    libsReady();
                }
                else{
                    Inline(settings.name, settings);
                }
            }, 150);
        })();
    };
    
    initialize();
}(window, document));