define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/viewenlace.html',
  'depend!libs/bootstrap/bootstrap-modal[order!jquery]'
], function($, _, Backbone, templateViewEnlace) {

  var ViewEnlaceView = Backbone.View.extend({
  	template: _.template(templateViewEnlace),
        events: {
                "click .viewenlace .delete-enlace": "delete"
        },
  	initialize: function(options) {
                _.bindAll( this, "view", "close", "delete" );
		this.router = options.router;
		this.enlaces = options.enlaces;
		this.router.on("viewenlace", this.view);
		this.router.on("closeall", this.close);
	},	
        render: function() {
      		$(this.el).html(this.template(this.model.toJSON()));
        	return this;
    	},
  	view: function(model) {
		this.model = model;
		this.render();
		$(this.el).modal();
	},
        close: function(event) {
        	$(this.el).modal("hide");
    	},
	delete: function() {
		if (!this.model.get("validated")) {
			this.model.destroy();
			this.enlaces.trigger("change");
		} else {
			console.log("Este enlace no se puede borrar");
		}
	}
  });

  return ViewEnlaceView;
});
