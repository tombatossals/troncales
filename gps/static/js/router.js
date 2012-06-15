// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/map',
  'views/box',
  'collections/enlaces',
  'collections/supernodos'
], function ($, _, Backbone, MapView, BoxView, ListaEnlaces, ListaSupernodos) {

  var AppRouter = Backbone.Router.extend({

    routes: {
      'show/route/:origin/:destiny': 'showroute',
      'set/route/:node': 'setroute',
      '*actions': 'defaultAction'
    },

    setroute: function(node) {
        if (!this.mapView.node) {
            var supernodo = this.supernodos.get(node);
            console.log(supernodo);
            this.boxView = new BoxView( { model: supernodo, el: "#origin" });
            this.boxView.render();
            this.mapView.node = node;
            this.mapView.closeall();
        } else {
            this.mapView.destiny = node;
            this.navigate("show/route/" + this.mapView.node + "/" + node, { trigger: true });
        }
    },

    showroute: function() {
    },

    initialize: function(options) {
        //_.bindAll( this, "show", "filter");
        this.supernodos = new ListaSupernodos();
        this.enlaces = new ListaEnlaces( { supernodos: this.supernodos } );
        var ref = this;
        this.supernodos.fetch({ success: function() {
            ref.enlaces.fetch( { success: function() {
                ref.enlaces.calculateDistances();
                Backbone.history.start();
            } });
        } });
        this.mapView = new MapView( { collection: this.enlaces });
    },

    defaultAction: function(event) {
    }

  });

  var initialize = function() {
    var app_router = new AppRouter;
  };

  return {
      initialize: initialize
  }

});
