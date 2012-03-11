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
        	"click .close": "close"
    	},
  	
        render: function() {
		console.log(this.template);
      		$(this.el).html(this.template(this.model.toJSON()));
        	return this;
    	},
  	show: function() {
		$(this.el).show();
	},
        close: function(event) {
        	event.stopPropagation();
        	$(this.el).hide();
    	}
  });

  return BoxView;
});
