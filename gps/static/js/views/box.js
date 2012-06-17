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
        var supernodos = this.model.get("supernodos");

        var origen = supernodos[0];
        var destino = supernodos[1];

        $(this.el).html(this.template( { "origen": origen, "destino": destino } ));
        $(this.el).show();
        return this;
    },

    close: function() {
        $(this.el).hide();
        this.trigger("close");
    }

  });

  return BoxView;
});
