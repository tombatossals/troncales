define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/box.html'
], function($, _, Backbone, templateBox) {

  var BoxView = Backbone.View.extend({
    	tagName: "div",
        className: "box",
  	template: _.template(templateBox),
        events: {
        	"click .close": "close",
    	},
  	initialize: function(options) {
		_.bindAll( this, "loadEnlace" );
		this.router = options.router;
		this.router.on("showbox", this.loadEnlace);
	},	
        render: function() {
      		$(this.el).html(this.template(this.model.toJSON()));
        	return this;
    	},
  	show: function() {
		this.render();
		$(this.el).show();
	},
        close: function(event) {
        	event.stopPropagation();
        	$(this.el).hide();
		this.router.navigate("");
    	},
	loadEnlace: function(enlace) {
		this.model = enlace;
		this.show();
	}
  });

  return BoxView;
});
