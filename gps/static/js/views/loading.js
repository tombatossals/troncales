define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/loading.html'
], function($, _, Backbone, templateLoading){

  var LoadingView = Backbone.View.extend({
    template: _.template(templateLoading),

    initialize: function(options) {
    },

    render: function() {
        $(this.el).html(this.template());
        $(this.el).show();
        return this;
    },

    close: function() {
        $(this.el).hide();
    }

  });

  return LoadingView;
});
