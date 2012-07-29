// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/map',
  'views/box',
  'views/graph',
  'views/splash',
  'views/loading',
  'views/error',
  'collections/enlaces',
  'collections/supernodos',
  'models/camino'
], function ($, _, Backbone, MapView, BoxView, GraphView, SplashView, LoadingView, ErrorView, ListaEnlaces, ListaSupernodos, CaminoModel) {

  var AppRouter = Backbone.Router.extend({

    routes: {
      'set/route/:node': 'setroute',
      'set/route/:node/:node': 'setroute',
      '*actions': 'defaultAction'
    },

    initialize: function(options) {
        _.bindAll( this, "setroute", "removenode", "init", "showgraph", "hidegraph", "movegraph");
        this.supernodos = new ListaSupernodos();
        this.camino = new CaminoModel();
        var ref = this;
        this.supernodos.fetch({ success: function() {
            Backbone.history.start();
        } });
        this.enlaces = new ListaEnlaces( { supernodos: this.supernodos });
        this.mapView = new MapView( { collection: this.supernodos } );
        this.boxView = new BoxView( { el: "#infobox" });
        this.graphView = new GraphView( { el: "#graph" });
        this.splashView = new SplashView( { el: "#infobox" });
        this.mapView.on("setnode", this.setroute);
        this.mapView.on("removenode", this.removenode);
        this.mapView.on("hidegraph", this.hidegraph);
        this.mapView.on("showgraph", this.showgraph);
        this.mapView.on("movegraph", this.movegraph);
        this.boxView.on("close", this.init);
        //this.splashView.on("splashclose", this.mapView.detectnode);

        this.loadingView = new LoadingView( { el: "#loading" });
        this.errorView = new ErrorView( { el: "#error" });

        var ref = this;
        $("#all-links").click(function() {
            if (!$(this).hasClass("active")) {
                ref.boxView.close();
                ref.enlaces.url = "/api/enlaces";
                ref.loadingView.render();
                ref.enlaces.fetch( { success: function() {
                    ref.loadingView.close();
                    ref.enlaces.calculateDistances();
                    ref.enlaces.obtainGraphIds();
                    ref.enlaces.forEach(function(enlace) {
                        ref.mapView.renderLink(enlace);
                    });
                } });

            } else {
                ref.boxView.close();
                ref.mapView.clearLinks();
            }
        });
    },

    movegraph: function(pos) {
        this.graphView.move(pos);
    },

    showgraph: function(enlace, pos) {
        this.graphView.render(enlace, pos);
    },

    hidegraph: function() {
        this.graphView.hidegraph();
    },

    setroute: function(node1, node2) {

        var supernodos = this.camino.get("supernodos");
        this.mapView.clearLinks();

        if (supernodos.length == 2) {
            supernodos.pop();
        }

        if (node1 !== undefined) {
            supernodos.push(this.supernodos.get(node1));
        }

        if (node2 !== undefined) {
            supernodos.push(this.supernodos.get(node2));
        }


        if (supernodos.length == 2) {

            this.camino.set("supernodos", supernodos);
            this.mapView.highlightNodes( [ supernodos[0].id, supernodos[1].id ] );

            this.enlaces.url = "/api/getroute/" + supernodos[0].id + "/" + supernodos[1].id;
            var ref = this;
            this.loadingView.render();
            this.enlaces.fetch( { success: function() {
                ref.loadingView.close();
                ref.enlaces.forEach(function(enlace) {
                    ref.mapView.renderLink(enlace);
                });
                ref.camino.set("enlaces", ref.enlaces);
                ref.boxView.model = ref.camino;
                ref.boxView.render();
            }, error: function() {
                ref.loadingView.close();
                ref.errorView.render();
                if (node2) {
                    ref.removenode(node2);
                } else {
                    ref.removenode(node1);
                }
            } });

            this.navigate("/set/route/" + supernodos[0].id + "/" + supernodos[1].id);

        } else {
            this.camino.set("supernodos", supernodos);
            this.mapView.highlightNodes( [ supernodos[0].id ] );
            this.boxView.model = this.camino;
            this.boxView.render();
            this.navigate("/set/route/" + supernodos[0].id);
        }
    },

    removenode: function(node) {
        var supernodos = this.camino.get("supernodos");
        var supernodo = this.supernodos.get(node);

        this.loadingView.close();
        var idx = supernodos.indexOf(supernodo);
        supernodos.splice(idx, 1);

        this.mapView.clearLinks();
        this.mapView.resetNodes([ node ]);
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
