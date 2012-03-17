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
        	"click .btn-danger": "save"
    	},
  	initialize: function(options) {
                _.bindAll( this, "showmodal", "save", "close" );
		this.router = options.router;
		this.router.on("editsupernodo", this.showmodal);
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
    	},
	save: function() {
		console.log($("#editSupernodoIp").val());
		var attributes = { 
			name: $("#editSupernodoName").val(),
			ip: $("#editSupernodoIp").val(),
			bandwidth: $("#editSupernodoBandWidth").val(),
			traffic: $("#editSupernodoTraffic").val()
		}
		this.model.savedata(attributes);
	}
  });

  return EditSupernodoView;
});
