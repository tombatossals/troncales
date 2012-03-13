define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/help.html',
  'depend!libs/bootstrap/bootstrap-modal[order!jquery]'
], function($, _, Backbone, templateHelp) {

  var HelpView = Backbone.View.extend({
  	template: _.template(templateHelp),
        events: {
        	"click .close": "close",
        	"click .btn-primary": "close"
    	},
  	initialize: function(options) {
                _.bindAll( this, "show" );
		this.router = options.router;
		this.router.on("showhelp", this.show);
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

  return HelpView;
});
