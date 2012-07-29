define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/splash.html'
], function($, _, Backbone, templateSplash){

  var SplashView = Backbone.View.extend({
    template: _.template(templateSplash),
    events: {
        "click .splash .close": "close",
        "click .btn-close": "close"
    },

    initialize: function(options) {
        _.bindAll( this, "close" );
    },

    render: function() {
        $(this.el).html(this.template());
        $(this.el).show();
        return this;
    },

    close: function() {
        $(this.el).hide();
        this.trigger("splashclose");
    }

  });

  return SplashView;
});
