define([
  'jquery',
  'underscore',
  'backbone',
  'views/modal',
  'text!templates/box.html'
], function($, _, Backbone, ModalView, templateBox) {

  var BoxView = Backbone.View.extend({
    	tagName: "div",
        className: "box",
  	template: _.template(templateBox),
        events: {
        	"click .close": "close",
        	"click": "modal"
    	},
  	
        render: function() {
      		$(this.el).html(this.template(this.model.toJSON()));
        	return this;
    	},
  	show: function() {
		$(this.el).show();
	},
        close: function(event) {
        	event.stopPropagation();
        	$(this.el).hide();
    	},
  	modal: function() {
                var modalView = new ModalView ( { el: "#modal", model: this.model } );
                modalView.render();
                modalView.show();
	}
  });

  return BoxView;
});
