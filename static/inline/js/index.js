;(function(window,document) {
    var utils = {
        dBody: document.body,
        render: function(data){
            if (!this.dBody || !data) return;
            var frag = document.createDocumentFragment(),
                main = document.createElement('div'),
                d = data || {},
                settings = d.settings || {},
                videoData = settings.videoData || {};
            main.id = d.id || '';
            main.classList.add('iframe-content');
            main.innerHTML = data.inlineTemplate;
            frag.appendChild(main);
            this.dBody.appendChild(frag);
            main.querySelector('.tvp-player-dummy-overlay').firstChild.style.backgroundImage = 'url('+(videoData.length?videoData[0].asset.thumbnailUrl:"")+')';
        }
    },
    initialize = function(settings){
        if ((!Utils.isset(parent) || !Utils.isset(parent,'__TVPage__') || !Utils.isset(parent.__TVPage__, 'config'))) return;
        utils.render({
            id: settings.name,
            title: settings.title || 'Recommended Videos',
            inlineTemplate: settings.templates.inline,
            settings: settings
        });

        var libChecks = 0;
        (function libChecker(){
            setTimeout(function(){
                if ((!Utils.isset(window,'TVPage') || !Utils.isset(window,'_tvpa') || !Utils.isset(window,'Inline')) && (++libChecks < 200) ) {
                    libChecker();
                }
                else{                    
                    var inline = new Inline(settings);
                    inline.init();
                }
            }, 100);
        })();
    };
    var settings = parent.__TVPage__.config[utils.dBody.getAttribute('data-id')];
    Utils.dataCheck(settings,'videoData',function(){
        Utils.loadProducts(settings.videoData[0].id, settings.videoData[0].loginId,function(data){
            if (data || data.length){
                settings.productsFirstData = data || [];
            }
            initialize(settings);
        });
    });
}(window, document));