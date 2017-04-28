;(function(root,doc) {

  var isset = function(o,p){
    var val = o;
    if (p) val = o[p];
    return 'undefined' !== typeof val;
  };

  function Analytics() {

    this.initConfig = function(options){
      if (!isset(options) || !isset(options.loginId) || !isset(options.domain) || !isset(options.logUrl)) {
        return console.warn('need config');
      }
      
      _tvpa.push(['config', {
        logUrl: options.logUrl,
        li: options.loginId,
        gaDomain: options.domain
      }]);
    };

    this.track = function(e,data){
      if (!isset(e) || !isset(data) || !isset(window, '_tvpa')) return console.warn('No Data');
      _tvpa.push(['track', e, data]);
    };
    
  }

  root.Analytics = Analytics;

}(window, document));