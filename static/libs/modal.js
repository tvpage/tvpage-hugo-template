(function(){
  function Modal(sel, options, globalConfig){
    this.options = options || {};
    this.config = globalConfig || {};
    this.el = document.getElementById(sel);
    this.startState = this.options.start || 'hide';
  
    if(undefined === window.jQuery)
      throw new Error("jQuery is a dep");
  };
  
  Modal.prototype.initialize = function(){
    this.loadLib('/bootstrap/js/util.js', this.onBSUtilLoad);
  };
  
  Modal.prototype.loadLib = function(libPath, callback){
    var that = this;
  
    $.ajax({
      dataType: 'script',
      cache: true,
      url: this.config.baseUrl + libPath
    }).done(function(){
      callback.call(that);
    });
  };
  
  Modal.prototype.onBSUtilLoad = function(){
    this.loadLib('/bootstrap/js/modal.js', this.onBSModalLoad);
  };
  
  Modal.prototype.hide = function(){
    var modalEl = this.$modalEl;

    if(modalEl && modalEl.modal)
      modalEl.modal('hide');
  };
  
  Modal.prototype.show = function(){
    var modalEl = this.$modalEl;

    if(modalEl && modalEl.modal)
      modalEl.modal('show');
  };
  
  Modal.prototype.onShowBSModal = function(e){
    var onShow = this.options.onShow;
  
    if(Utils.isFunction(onShow)){
      onShow(e);
    }
  }
  
  Modal.prototype.updateTitle = function(title){
    this.el.querySelector('#modalTitle').innerHTML = title || '';
  }

  Modal.prototype.onShownBSModal = function(e){
    var onShown = this.options.onShown;
  
    if(Utils.isFunction(onShown))
      onShown(e);
  }
  
  Modal.prototype.onHideBSModal = function(e){
    var onHide = this.options.onHide;

    if(Utils.isFunction(onHide))
      onHide(e);
  };

  Modal.prototype.onHiddenBSModal = function(e){
    this.$modalEl.modal('dispose');
    this.$modalEl.removeData('bs.modal');
  
    var onHidden = this.options.onHidden;
    
    if(Utils.isFunction(onHidden)){
      onHidden(e);
    }
  };
  
  Modal.prototype.onBSModalLoad = function(){
    this.$modalEl = $(this.el);
  
    var that = this;
  
    this.$modalEl.on('show.bs.modal', function(e){
      that.onShowBSModal.call(that, e);
    });
    
    this.$modalEl.on('shown.bs.modal', function(e){
      that.onShownBSModal.call(that, e);
    });
  
    this.$modalEl.on('hide.bs.modal', function(e){
      that.onHideBSModal.call(that, e);
    });

    this.$modalEl.on('hidden.bs.modal', function(e){
      that.onHiddenBSModal.call(that, e);
    });
  
    this.$modalEl.modal(this.startState);

    var onReady = this.options.onReady;

    if(Utils.isFunction(onReady)){
      onReady();
    }
  };

  window.Modal = Modal;
}())