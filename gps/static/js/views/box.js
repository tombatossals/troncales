define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/box.html'
], function($, _, Backbone, templateBox){

  var BoxView = Backbone.View.extend({
    template: _.template(templateBox),
    events: {
        "click .close": "close"
    },

    initialize: function(options) {
        _.bindAll( this, "close" );
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        $(this.el).show();
        return this;
    },

    close: function() {
        $(this.el).hide();
    }

  });

  return BoxView;
});
