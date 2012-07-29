define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/error.html'
], function($, _, Backbone, templateError){

  var ErrorView = Backbone.View.extend({
    template: _.template(templateError),

    initialize: function(options) {
        _.bindAll( this, "close" );
    },

    render: function() {
        $(this.el).html(this.template());
        $(this.el).show();
        setTimeout(this.close, 1000);
        return this;
    },

    close: function() {
        $(this.el).hide(500);
    }

  });

  return ErrorView;
});
