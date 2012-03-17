define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/editsupernodo.html',
  'depend!libs/bootstrap/bootstrap-modal[order!jquery]'
], function($, _, Backbone, templateEditSupernodo) {

  var EditSupernodoView = Backbone.View.extend({
  	template: _.template(templateEditSupernodo),
        events: {
        	"click .save-supernodo": "save"
    	},
  	initialize: function(options) {
                _.bindAll( this, "edit", "save", "close" );
		this.router = options.router;
		this.router.on("editsupernodo", this.edit);
		this.router.on("closeall", this.close);
	},	
        render: function() {
      		$(this.el).html(this.template(this.model.toJSON()));
        	return this;
    	},
  	edit: function(model) {
		this.model = model;
		this.render();
		$(this.el).modal();
	},
        close: function(event) {
        	$(this.el).modal("hide");
    	},
	save: function() {
		var attributes = { 
			name: $("#editSupernodoName").val(),
			ip: $("#editSupernodoIp").val()
		}
		this.model.savedata(attributes);
	}
  });

  return EditSupernodoView;
});
