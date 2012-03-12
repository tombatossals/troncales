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
        	"click": "modal"
    	},
  	initialize: function(options) {
		_.bindAll( this, "loadEnlace" );
		this.enlaces = options.enlaces;
		this.router = options.router;
		this.enlaces.bind("active", this.loadEnlace);
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
    	},
	loadEnlace: function(enlace) {
		this.model = enlace;
		this.show();
	},
  	modal: function() {
		this.router.navigate("show/" + this.model.get("id"), { trigger: true });
	}
  });

  return BoxView;
});
