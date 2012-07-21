define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/box.html'
], function($, _, Backbone, templateBox){

  var BoxView = Backbone.View.extend({
    template: _.template(templateBox),
    events: {
        "click .close": "close",
        "click .btn-close": "close"
    },

    initialize: function(options) {
        _.bindAll( this, "close" );
    },

    render: function() {
        var supernodos = this.model.get("supernodos");

        var origen = supernodos[0];
        var destino = supernodos[1];

        var camino = { "distancia": 0, "bandwidth": 0 };
        if (this.model.get("enlaces").length > 0 ) {
            this.model.get("enlaces").forEach(function(enlace) {
                camino.distancia += parseFloat(enlace.get("distance"));
                if (camino.bandwidth == 0) {
                    camino.bandwidth = parseFloat(enlace.get("bandwidth"));
                } else if (camino.bandwidth > parseFloat(enlace.get("bandwidth"))) {
                    camino.bandwidth = parseFloat(enlace.get("bandwidth"));
                }
            })
        }

        $(this.el).html(this.template( { "origen": origen, "destino": destino, "camino": camino } ));
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
