define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/editenlace.html',
  'depend!libs/bootstrap/bootstrap-modal[order!jquery]'
], function($, _, Backbone, templateEditEnlace) {

  var EditEnlaceView = Backbone.View.extend({
  	template: _.template(templateEditEnlace),
        events: {
        	"click .save-enlace": "save"
    	},
  	initialize: function(options) {
                _.bindAll( this, "edit", "save", "close" );
		this.router = options.router;
		this.router.on("editenlace", this.edit);
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
		console.log("hola");
		var attributes = { 
			name: $("#editEnlaceName").val(),
			rrdtool_bandwidth_graph_id: $("#editEnlaceBandWidth").val(),
			rrdtool_traffic_graph_id: $("#editEnlaceTraffic").val()
		}
		this.model.savedata(attributes);
	}
  });

  return EditEnlaceView;
});
