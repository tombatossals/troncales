// Filename: router.js
define(['jquery', 'underscore', 'backbone', 'views/map', 'views/box', 'views/graph', 'views/splash', 'views/loading', 'views/error', 'views/search', 'collections/enlaces', 'collections/supernodos', 'models/camino', 'views/editenlace', 'views/addenlace'], function($, _, Backbone, MapView, BoxView, GraphView, SplashView, LoadingView, ErrorView, SearchView, ListaEnlaces, ListaSupernodos, CaminoModel, EditEnlaceView, AddEnlaceView) {

    var AppRouter = Backbone.Router.extend({

        routes: {
            'set/route/:node': 'setroute',
            'set/route/:node/:node': 'setroute',
            'add/enlace': 'addenlace',
            '*actions': 'defaultAction'
        },

        initialize: function(options) {
            _.bindAll(this, "setroute", "removenode", "init", "showgraph", "hidegraph", "movegraph", "centermap", "editenlace", "addenlace");
            this.supernodos = new ListaSupernodos();
            this.camino = new CaminoModel();
            var ref = this;
            this.supernodos.fetch({
                success: function() {
                    Backbone.history.start();
                }
            });
            this.enlaces = new ListaEnlaces({
                supernodos: this.supernodos
            });
            this.mapView = new MapView({
                collection: this.supernodos
            });
            this.boxView = new BoxView({
                el: "#infobox"
            });
            this.graphView = new GraphView({
                el: "#graph"
            });
            this.splashView = new SplashView({
                el: "#infobox"
            });
            this.searchView = new SearchView({
                el: "#search",
                collection: this.supernodos
            });
            this.loadingView = new LoadingView({
                el: "#loading"
            });
            this.errorView = new ErrorView({
                el: "#error"
            });

            this.editEnlaceView = new EditEnlaceView ( { el: "#modal" } );
            this.addEnlaceView = new AddEnlaceView ( { el: "#modal", collection: this.enlaces, supernodos: this.supernodos } );

            this.mapView.on("setnode", this.setroute);
            this.mapView.on("removenode", this.removenode);
            this.mapView.on("hidegraph", this.hidegraph);
            this.mapView.on("showgraph", this.showgraph);
            this.mapView.on("movegraph", this.movegraph);
            this.mapView.on("editenlace", this.editenlace);
            this.mapView.on("addenlace", this.addenlace);
            this.searchView.on("centermap", this.centermap);

            this.boxView.on("close", this.init);
            this.supernodos.on("reset", this.searchView.render);

            //this.splashView.on("splashclose", this.mapView.detectnode);
            var ref = this;
            $("#all-links").click(function() {
                if (!$(this).hasClass("active")) {
                    ref.boxView.close();
                    ref.enlaces.url = "/api/enlaces";
                    ref.loadingView.render();
                    ref.enlaces.fetch({
                        success: function() {
                            ref.loadingView.close();
                            ref.enlaces.calculateDistances();
                            ref.enlaces.obtainGraphIds();
                            ref.enlaces.forEach(function(enlace) {
                                ref.mapView.renderLink(enlace);
                            });
                        }
                    });

                } else {
                    ref.boxView.close();
                    ref.mapView.clearLinks();
                }
            });
        },

        editenlace: function(enlace) {
            this.editEnlaceView.model = enlace;
            this.editEnlaceView.render();
        },

        addenlace: function() {
            this.addEnlaceView.render();
        },

        movegraph: function(pos) {
            this.graphView.move(pos);
        },

        showgraph: function(enlace, pos) {
	    var origen = this.supernodos.get(enlace.get("supernodos")[0]).get("name");
	    var destino = this.supernodos.get(enlace.get("supernodos")[1]).get("name");
            this.graphView.render(enlace, pos, origen, destino);
        },

        hidegraph: function() {
            this.graphView.hidegraph();
        },

        centermap: function(placeId) {
            var ref = this;
            this.supernodos.each(function(s) {
                if (placeId === s.get("name")) {
                    ref.mapView.centermap(s);
                }
            });
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
                this.mapView.highlightNodes([supernodos[0].id, supernodos[1].id]);

                this.enlaces.url = "/api/getroute/" + supernodos[0].id + "/" + supernodos[1].id;
                var ref = this;
                this.loadingView.render();
                this.enlaces.fetch({
                    success: function() {
                        ref.loadingView.close();
                        ref.enlaces.forEach(function(enlace) {
                            ref.mapView.renderLink(enlace);
                        });
                        ref.camino.set("enlaces", ref.enlaces);
                        ref.boxView.model = ref.camino;
                        ref.boxView.render();
                    },
                    error: function() {
                        ref.loadingView.close();
                        ref.errorView.render();
                        if (node2) {
                            ref.removenode(node2);
                        } else {
                            ref.removenode(node1);
                        }
                    }
                });

                this.navigate("/set/route/" + supernodos[0].id + "/" + supernodos[1].id);

            } else {
                this.camino.set("supernodos", supernodos);
                this.mapView.highlightNodes([supernodos[0].id]);
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
            this.mapView.resetNodes([node]);
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
