define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/newenlace.html',
  'depend!libs/bootstrap/bootstrap-modal[order!jquery]'
], function($, _, Backbone, templateNewEnlace) {

  var NewEnlaceView = Backbone.View.extend({
	template: _.template(templateNewEnlace),
        events: {
        	"click .save-enlace": "save"
    	},
  	initialize: function(options) {
                _.bindAll( this, "create", "save", "close" );
		this.router = options.router;
		this.router.on("newenlace", this.create);
		this.router.on("closeall", this.close);
	},	
        render: function() {
      		$(this.el).html(this.template({ supernodos: this.router.enlaces.supernodos.pluck("name") }));
        	return this;
    	},
  	create: function() {
		this.render();
		$(this.el).modal();
	},
        close: function(event) {
        	$(this.el).modal("hide");
    	},
	save: function() {
		var attributes = { 
			name: $("#editEnlaceName").val(),
			bandwidth: $("#editEnlaceBandWidth").val(),
			traffic: $("#editEnlaceTraffic").val()
		}
		this.model.savedata(attributes);
	}
  });

  return NewEnlaceView;
});
