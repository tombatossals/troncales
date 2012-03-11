define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/modal.html',
  'depend!libs/bootstrap-modal[order!jquery]'
], function($, _, Backbone, templateModal) {

  var ModalView = Backbone.View.extend({
  	template: _.template(templateModal),
        events: {
        	"click .close": "close",
        	"click .btn-primary": "close"
    	},
  	
        render: function() {
      		$(this.el).html(this.template(this.model.toJSON()));
        	return this;
    	},
  	show: function() {
		$(this.el).modal();
	},
        close: function(event) {
        	event.stopPropagation();
        	$(this.el).modal("hide");
    	}
  });

  return ModalView;
});
