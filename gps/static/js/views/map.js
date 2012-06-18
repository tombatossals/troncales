define([
  'jquery',
  'underscore',
  'backbone',
  'async!http://maps.google.com/maps/api/js?sensor=false&libraries=geometry'
], function($, _, Backbone){

  var MapView = Backbone.View.extend({
    el: "#map_canvas",
    initialize: function(options) {
	    _.bindAll( this, "renderSupernodes", "clearall", "detectnode", "clearLinks" );
        this.selectedMarkers = [];
	    this.markers = new Object();
	    this.polylines = new Array();
        var myOptions = {
                zoom: 14,
                center: new google.maps.LatLng(40.000531, -0.039139),
                mapTypeId: google.maps.MapTypeId.HYBRID,
	  	        zoomControl: true,
  		        panControl: false,
  		        streetViewControl: false,
  		        zoomControlOptions: {
	      		style: google.maps.ZoomControlStyle.SMALL
	    	}
        };
        this.map = new google.maps.Map(this.el, myOptions);
        this.collection.on("reset", this.renderSupernodes);
        this.wifiIcon = new google.maps.MarkerImage("img/wifi.png", null, null, new google.maps.Point(16, 16));
        this.wifiRedIcon = new google.maps.MarkerImage("img/wifiRed.png", null, null, new google.maps.Point(16, 16));
    },

    highlightNodes: function(nodes) {
        var ref = this;
        _.each(nodes, function(node) {
            var marker = ref.markers[node];
            marker.setIcon(ref.wifiRedIcon);
            if (!_.include(ref.selectedMarkers, marker)) {
                ref.selectedMarkers.push(marker);
            }
        });
    },

    clearall: function() {

        var ref = this;
        _.each(this.polylines, function(poly) {
            poly.setMap(null);
        });
        _.each(this.selectedMarkers, function(marker) {
            marker.setIcon(ref.wifiIcon);
        });
        this.selectedMarkes = [];
        this.polylinks = [];
    },

    clearLinks: function() {
        _.each(this.polylines, function(poly) {
            poly.setMap(null);
        });
    },
 
    renderSupernodes: function() {
	    var ref = this;
	    this.collection.each(function(supernodo) {
		    ref.renderMarker(supernodo);
	    });
    },

    detectnode: function() {
        $.ajax({ url: "/api/getsupernode", context: this }).done(function(id) {
            if (id) {
                this.trigger("setnode", id);
                this.selectedMarkers.push(this.markers[id]);
                var supernodo = this.collection.get(id);
                var p = supernodo.get("latlng");
	            this.map.setCenter(new google.maps.LatLng(p["lat"], p["lng"]));
            }
        });
    },

    // renders new marker to map
    renderMarker: function(supernodo) {
	    var point = supernodo.get("latlng");
	    var position = new google.maps.LatLng(point["lat"], point["lng"]);
        var marker = new google.maps.Marker({
            map: this.map,
            position: position,
            icon: this.wifiIcon
        });

	    this.markers[supernodo.id] = marker;

	    var ref = this;
	    google.maps.event.addListener(marker, 'click', function() { 
            if (_.include(ref.selectedMarkers, marker)) {
                var idx = ref.selectedMarkers.indexOf(marker);
                var removedMarker = ref.selectedMarkers.splice(idx, 1);
                removedMarker[0].setIcon(ref.wifiIcon);
                ref.trigger("removenode", supernodo.id);
            } else {
                if (ref.selectedMarkers.length == 2) {
                    var removedMarker = ref.selectedMarkers.pop();
                    removedMarker.setIcon(ref.wifiIcon);
                }
                marker.setIcon(ref.wifiRedIcon);
                ref.selectedMarkers.push(marker);
                ref.trigger("setnode", supernodo.id);
            }
	    });

	    google.maps.event.addListener(marker, 'mouseover', function() { 
            marker.setIcon(ref.wifiRedIcon);
	    });

	    google.maps.event.addListener(marker, 'mouseout', function() { 
            if (!_.include(ref.selectedMarkers, marker)) {
                marker.setIcon(ref.wifiIcon);
            }
	    });
    },

    redraw: function() {
        _.each(this.markers, function(marker) {
            marker.setMap(null);
        });
        this.renderLinks();
    },

    renderLinks: function(enlaces) {
        var ref = this;
        _.each(enlaces, function(enlace) {
            if (enlace.get("id")) {
                ref.renderLink(enlace);
            } else {
                enlace.destroy();
            }
        });
    },

    renderLink: function(enlace) {
        var saturationColor = {
                0: "#00FF00",
                1: "#FFFF00",
                2: "#FF8800",
                3: "#FF0000"
        };

	    var point = this.collection.get(enlace.get("supernodos")[0]).get("latlng");
	    var p0 = new google.maps.LatLng(point["lat"], point["lng"]);
	    point = this.collection.get(enlace.get("supernodos")[1]).get("latlng");
	    var p1 = new google.maps.LatLng(point["lat"], point["lng"]);

	    var weight = 1;
	    if (enlace.get("bandwidth") > 30) {
		    weight = 10;
	    } else if (enlace.get("bandwidth") > 20) {
		    weight = 8;
	    } else if (enlace.get("bandwidth") > 10) {
		    weight = 5;
	    } else if (enlace.get("bandwidth") > 4) {
		    weight = 3;
	    }
        var polyOptions = {
                strokeColor: saturationColor[enlace.get("saturation")],
                strokeOpacity: 1.0,
                strokeWeight: weight,
                map: this.map,
            	path: [ p0, p1 ]
        };
        var poly = new google.maps.Polyline(polyOptions);

	    this.polylines.push(poly);
	    var ref = this;
        google.maps.event.addListener(poly, "mouseout",
            (function(enlace, ply) {
                return function() {
    			poly.setOptions({ strokeColor: saturationColor[enlace.get("saturation")] });
                };
            })(enlace, poly)
        );
        google.maps.event.addListener(poly, "mouseover",
            (function(enlace, poly) {
                return function() {
			ref.trigger("activelink", enlace);
    			poly.setOptions({ strokeColor: "#FFFFFF" });
                };
            })(enlace, poly)
        );
        google.maps.event.addListener(poly, "click",
            (function(enlace) {
                return function() {
			        ref.trigger("viewenlace", enlace.get("id"));
                };
            })(enlace)
        );
    }

  });

  return MapView;
});
