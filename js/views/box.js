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
        	"click #info-supernodo .close": "close",
    	},
        render: function() {
      		$(this.el).html(this.template(this.model.toJSON()));
		$(this.el).show();
        	return this;
    	},
        close: function(event) {
        	$(this.el).hide();
    	}
  });

  return BoxView;
});
