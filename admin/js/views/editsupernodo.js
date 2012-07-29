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
        	"click .save-supernodo": "save",
        	"click .btn-close": "close"
    	},
  	initialize: function(options) {
                _.bindAll( this, "save", "close" );
	},	
        render: function() {
      		$(this.el).html(this.template(this.model.toJSON()));
		$(this.el).modal();
        	return this;
    	},
        close: function(event) {
        	$(this.el).modal("hide");
		this.trigger("closeall");
    	},
	save: function() {
		var attributes = { 
			name: $("#editSupernodoName").val(),
			email: $("#editSupernodoEmail").val(),
			ip: $("#editSupernodoIp").val()
		}
		this.model.savedata(attributes);
		this.collection.fetch();
		this.close();
	}
  });

  return EditSupernodoView;
});
