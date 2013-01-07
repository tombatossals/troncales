define(['jquery', 'underscore', 'backbone', 'models/enlace', 'views/map', 'async!http://maps.google.com/maps/api/js?sensor=false&libraries=geometry'], function($, _, Backbone, Enlace, MapView) {

    var ListaEnlaces = Backbone.Collection.extend({
        model: Enlace,
        url: '/api/enlaces',

        initialize: function(options) {
            this.supernodos = options.supernodos
        },

        setactive: function(enlace) {
            this.trigger("active", enlace);
        },

        obtainGraphIds: function() {
            var ref = this;
            this.each(function(enlace) {
                if (!ref.supernodos.get(enlace.get("supernodos")[0]) || !ref.supernodos.get(enlace.get("supernodos")[1])) {
                    console.log(enlace);
                    enlace.destroy();
                    return;
                }

                if (!enlace.get("rrdtool_bandwidth_graph_id")) {
                    var s1 = ref.supernodos.get(enlace.get("supernodos")[0]).get("name");
                    var s2 = ref.supernodos.get(enlace.get("supernodos")[1]).get("name");
                    $.ajax({
                        url: "/cacti/get/" + s1 + "/" + s2,
                        dataType: "json",
                        success: function(data) {
                            if (data) {
                                enlace.set("rrdtool_bandwidth_graph_id", data.rrdtool_bandwidth_graph_id);
                                enlace.set("rrdtool_traffic_graph_id", data.rrdtool_traffic_graph_id);
                                enlace.set("rrdtool_bandwidth_id", data.rrdtool_bandwidth_id);
                                enlace.set("rrdtool_traffic_id", data.rrdtool_traffic_id);
                                enlace.save();
                            }
                        }
                    });
                }
            });
        },

        calculateDistances: function() {
            var ref = this;
            this.each(function(enlace) {
                if (!enlace.get("distance")) {
                    var point = ref.supernodos.get(enlace.get("supernodos")[0]).get("latlng")
                    var p0 = new google.maps.LatLng(point["lat"], point["lng"]);
                    point = ref.supernodos.get(enlace.get("supernodos")[1]).get("latlng")
                    var p1 = new google.maps.LatLng(point["lat"], point["lng"]);
                    var distance = (google.maps.geometry.spherical.computeDistanceBetween(p0, p1) / 1000).toFixed(2);
                    enlace.set("distance", distance);
                    enlace.save();
                }
            });
        }

    });

    return ListaEnlaces;
});
