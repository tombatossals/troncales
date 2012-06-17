// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/map',
  'views/box',
  'views/splash',
  'collections/enlaces',
  'collections/supernodos',
  'models/camino'
], function ($, _, Backbone, MapView, BoxView, SplashView, ListaEnlaces, ListaSupernodos, CaminoModel) {

  var AppRouter = Backbone.Router.extend({

    routes: {
      'show/route/:origin/:destiny': 'showroute',
      'set/route/:node': 'setroute',
      '*actions': 'defaultAction'
    },

    initialize: function(options) {
        _.bindAll( this, "setroute", "removenode", "init");
        this.supernodos = new ListaSupernodos();
        this.enlaces = new ListaEnlaces( { supernodos: this.supernodos } );
        this.camino = new CaminoModel();
        var ref = this;
        this.supernodos.fetch({ success: function() {
            Backbone.history.start();
        } });
        this.mapView = new MapView( { collection: this.enlaces });
        this.boxView = new BoxView( { el: "#infobox" });
        this.splashView = new SplashView( { el: "#infobox" });
        this.mapView.on("setnode", this.setroute);
        this.mapView.on("removenode", this.removenode);
        this.boxView.on("close", this.init);
        //this.splashView.on("splashclose", this.mapView.detectnode);
    },

    setroute: function(node) {
        var supernodos = this.camino.get("supernodos");
        if (supernodos.length == 2) {
            supernodos.pop()
        }

        if (supernodos.length > 0) {

            var supernodo = this.supernodos.get(node);
            supernodos.push(supernodo);
            this.camino.set("supernodos", supernodos);
            this.mapView.highlightNodes( [ supernodos[0].id, node ] );

            this.enlaces.url = "/api/getroute/" + supernodos[0].id + "/" + supernodos[1].id;
            var ref = this;
            this.enlaces.fetch( { success: function() {
                ref.enlaces.calculateDistances();
                ref.mapView.renderLinks();
            } });

            this.boxView.model = this.camino;
            this.boxView.render();
            this.navigate("/show/route/" + supernodos[0].id + "/" + supernodos[1].id);

        } else {
            var supernodo = this.supernodos.get(node);
            this.camino.set("supernodos", [ supernodo ]);
            this.mapView.highlightNodes( [ node ] );
            this.boxView.model = this.camino;
            this.boxView.render();
            this.navigate("/set/route/" + supernodo.id);
        }
    },

    removenode: function(node) {
        var supernodos = this.camino.get("supernodos");
        var supernodo = this.supernodos.get(node);

        var idx = supernodos.indexOf(supernodo);
        supernodos.splice(idx, 1);

        this.mapView.clearLinks();
        this.camino.set("supernodos", supernodos);
        if (supernodos.length == 0) {
            this.camino = new CaminoModel();
            this.boxView.close();
            this.mapView.clearall();
            this.navigate("/");
        } else {
            this.camino.set("supernodos", supernodos);
            this.navigate("/set/route/" + supernodos[0].id);
            this.boxView.render();
        }
    },

    showroute: function() {
    },

    init: function() {
        this.camino = new CaminoModel();
        //this.boxView.close();
        this.mapView.clearall();
        this.navigate("/");
    },

    defaultAction: function(event) {
        this.init();
        this.splashView.render();
    }

  });

  var initialize = function() {
    var app_router = new AppRouter;
  };

  return {
      initialize: initialize
  }

});
