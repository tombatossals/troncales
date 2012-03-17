define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/viewenlace.html',
  'depend!libs/bootstrap/bootstrap-modal[order!jquery]'
], function($, _, Backbone, templateViewEnlace) {

  var ViewEnlaceView = Backbone.View.extend({
  	template: _.template(templateViewEnlace),
  	initialize: function(options) {
                _.bindAll( this, "view", "close" );
		this.router = options.router;
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
    	}
  });

  return ViewEnlaceView;
});
