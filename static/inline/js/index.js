;(function(window,document) {
    var utils = {
        dBody: document.body,
        render: function(data){
            if (!this.dBody) return;
            var frag = document.createDocumentFragment(),
                main = document.createElement('div'),
                d = data || {};
            main.id = d.id || '';
            main.classList.add('iframe-content');
            main.innerHTML = (Utils.tmpl(data.inlineTemplate, data.settings.videoData[0])? Utils.tmpl(data.inlineTemplate, data.settings.videoData[0]) : data.inlineTemplate);
            frag.appendChild(main);
            this.dBody.appendChild(frag);
        }
    };

    var initialize = function(settings){   
    if (!settings.videoData || !settings.videoData.length)return;  
        utils.render({
            id: settings.name,
            title: settings.title || 'Recommended Videos',
            inlineTemplate: settings.templates.inline['content'],
            settings: settings
        });

        Utils.loadProducts(settings.videoData[0].id, settings.videoData[0].loginId,function(data){
            settings.productsFirstData = data;
        });

        var libChecks = 0;
        (function libChecker(){
            setTimeout(function(){
                if ( (!Utils.isset(window,'TVPage') || !Utils.isset(window,'_tvpa') || !Utils.isset(window,'Inline') || !settings.productsFirstData || !settings.productsFirstData.length) && (++libChecks < 200) ) {
                    libChecker();
                }
                else{
                    var inline = new Inline(settings);
                    inline.init();
                }
            }, 100);
        })();
    };

    var checks = 0;
    (function isReady(){
        var settings = parent.__TVPage__.config[utils.dBody.getAttribute('data-id')];
        setTimeout(function(){
            if (!Utils.isset(parent) || !Utils.isset(parent,'__TVPage__') || !Utils.isset(parent.__TVPage__, 'config' || !settings.videoData || !settings.videoData.length) && (++checks < 200) ) {
                isReady();
            }
            else{
                initialize(settings);
            }
        }, 100);
    })();
}(window, document));