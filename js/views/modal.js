define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/modal.html',
  'depend!libs/bootstrap/bootstrap-modal[order!jquery]'
], function($, _, Backbone, templateModal) {

  var ModalView = Backbone.View.extend({
  	template: _.template(templateModal),
        events: {
        	"click .close": "close",
        	"click .btn-primary": "close"
    	},
  	initialize: function(options) {
                _.bindAll( this, "showmodal" );
		this.router = options.router;
		this.router.on("showmodal", this.showmodal);
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
        	event.stopPropagation();
        	$(this.el).modal("hide");
		this.router.navigate("");
    	}
  });

  return ModalView;
});
