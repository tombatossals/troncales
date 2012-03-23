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
        	"click .editenlace .save-enlace": "save"
    	},
  	initialize: function(options) {
                _.bindAll( this, "save", "close" );
	},	
        render: function() {
      		$(this.el).html(this.template(this.model.toJSON()));
        	return this;
    	},
        close: function(event) {
        	$(this.el).modal("hide");
		this.trigger("closeall");
    	},
	save: function() {
		var attributes = { 
			name: $("#editEnlaceName").val(),
			rrdtool_bandwidth_graph_id: $("#editEnlaceBandWidth").val(),
			rrdtool_traffic_graph_id: $("#editEnlaceTraffic").val()
		}
		this.model.savedata(attributes);
		this.close();
	}
  });

  return EditEnlaceView;
});
