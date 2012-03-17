define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/modal.html',
  'depend!libs/bootstrap/bootstrap-modal[order!jquery]'
], function($, _, Backbone, templateModal) {

  var ModalView = Backbone.View.extend({
  	template: _.template(templateModal),
  	initialize: function(options) {
                _.bindAll( this, "showmodal", "close" );
		this.router = options.router;
		this.router.on("showmodal", this.showmodal);
		this.router.on("closeall", this.close);
	},	
        render: function() {
      		$(this.el).html(this.template(this.model.toJSON()));
        	return this;
    	},
  	showmodal: function(model) {
		this.model = model;
		this.render();
		$(this.el).modal();
	},
        close: function(event) {
        	$(this.el).modal("hide");
    	}
  });

  return ModalView;
});
