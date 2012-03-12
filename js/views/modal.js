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
                _.bindAll( this, "show" );
		this.enlaces = options.enlaces;
		this.router = options.router;
		this.enlaces.bind("loadmodal", this.show);
	},	
        render: function() {
      		$(this.el).html(this.template(this.model.toJSON()));
        	return this;
    	},
  	show: function(model) {
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
