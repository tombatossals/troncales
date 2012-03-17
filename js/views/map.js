define([
  'jquery',
  'underscore',
  'backbone',
  'async!http://maps.google.com/maps/api/js?sensor=false&libraries=geometry'
], function($, _, Backbone){

  var MapView = Backbone.View.extend({
    el: "#map_canvas",
    initialize: function(options) {
	_.bindAll( this, "renderLinks", "redraw", "centermap", "closeall" );
	this.enlaces = options.enlaces;
	this.supernodos = this.enlaces.supernodos;
	this.router = options.router;
	this.enlaces.on("reset", this.renderLinks);
	this.enlaces.supernodos.on("change", this.redraw);
	this.router.on("centermap", this.centermap);
	this.router.on("closeall", this.closeall);
	this.infowindows = new Array();
	this.markers = new Array();
	this.polylines = new Array();
        var myOptions = {
                zoom: 13,
                center: new google.maps.LatLng(40.000531,-0.039139),
                mapTypeId: google.maps.MapTypeId.HYBRID,
	  	zoomControl: true,
  		panControl: false,
  		streetViewControl: false,
  		zoomControlOptions: {
	      		style: google.maps.ZoomControlStyle.SMALL
	    	}
        };
        this.map = new google.maps.Map(this.el, myOptions);
    },

    render: function() {
        return this;
    },

    centermap: function(placeId) {
	    var supernodo = undefined;
	    this.enlaces.supernodos.each(function(s) {
		    if (placeId === s.get("name")) {
			    supernodo = s;
		    }
	    });
	    var p = supernodo.get("latlng");
	    this.map.setCenter(new google.maps.LatLng(p["lat"], p["lng"]));
    },

    redraw: function() {
	    _.each(this.polylines, function(poly) {
		    poly.setMap(null);
	    });
	    _.each(this.markers, function(marker) {
		    marker.setMap(null);
	    });
	    this.renderLinks();
    },

    renderLinks: function(enlaces, supernodos) {
	var ref = this;
	this.supernodos.each(function(supernodo) {
		ref.renderMarker(supernodo);
	});
	this.enlaces.each(function(enlace) {
		ref.renderLink(enlace);
	});
    },

    // renders new marker to map
    renderMarker: function(supernodo) {
        var icon = new google.maps.MarkerImage("img/wifi.png", null, null, new google.maps.Point(16, 16));
	var point = supernodo.get("latlng");
	var position = new google.maps.LatLng(point["lat"], point["lng"]);
        var marker = new google.maps.Marker({
                        map: this.map,
                        position: position,
                        icon: icon
                        });

	this.markers.push(marker);
	var infowindow = new google.maps.InfoWindow({ 
		content: "Supernodo <strong>" + supernodo.get("name") + "</strong> <br />IP: <strong>" + supernodo.get("ip") + "</strong><br /><a href=\"#edit/" + supernodo.get("id") + "\" class=\"btn btn-primary\">Editar supernodo</a>" });

	var ref = this;
	google.maps.event.addListener(marker, 'click', function() { 
		_.each(ref.infowindows, function(i) {
			i.close();
		});
		infowindow.open(this.map,marker); 
	});

	this.infowindows.push(infowindow);
    },

    closeall: function() {
	    _.each(this.infowindows, function(i) {
		    i.close();
	    });
    },
    renderLink: function(enlace) {
        var statusColor = {
                0: "#FF0000",
                1: "#FF8800",
                2: "#FFd660",
                3: "#AAFF00",
                4: "#88FF00",
                5: "#00FF00"
        };

	var point = enlace.get("supernodos")[0].get("latlng");
	var p0 = new google.maps.LatLng(point["lat"], point["lng"]);
	point = enlace.get("supernodos")[1].get("latlng");
	var p1 = new google.maps.LatLng(point["lat"], point["lng"]);

        var polyOptions = {
                strokeColor: statusColor[enlace.get("state")],
                strokeOpacity: 1.0,
                strokeWeight: 9,
                map: this.map,
            	path: [ p0, p1 ]
        };
        var poly = new google.maps.Polyline(polyOptions);

	this.polylines.push(poly);
	var ref = this;
        google.maps.event.addListener(poly, "mouseout",
            (function(enlace, ply) {
                return function() {
    			poly.setOptions({ strokeColor: statusColor[enlace.get("state")] });
                };
            })(enlace, poly)
        );
        google.maps.event.addListener(poly, "mouseover",
            (function(enlace, poly) {
                return function() {
			ref.router.navigate("show/" + enlace.get("id"), { trigger: true });
    			poly.setOptions({ strokeColor: "#FFFFFF" });
                };
            })(enlace, poly)
        );
        google.maps.event.addListener(poly, "click",
            (function(enlace) {
                return function() {
                	ref.router.navigate("showmodal/" + enlace.get("id"), { trigger: true });
                };
            })(enlace)
        );
    }

  });

  return MapView;
});
