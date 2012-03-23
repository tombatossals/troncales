define([
  'jquery',
  'underscore',
  'backbone',
  'async!http://maps.google.com/maps/api/js?sensor=false&libraries=geometry'
], function($, _, Backbone){

  var MapView = Backbone.View.extend({
    el: "#map_canvas",
    events: {
            "click .save-marker": "newsupernodo",
            "click .delete-supernodo": "deletesupernodo"
    },
    initialize: function(options) {
	_.bindAll( this, "renderLinks", "redraw", "closeall", "newsupernodo", "deletesupernodo" );
	this.collection.on("reset", this.redraw);
	this.collection.supernodos.on("reset", this.redraw);
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

    deletesupernodo: function(event) {
	    var supernodoId = event.target.hash.replace("#delete/supernodo/", "");
	    var supernodo = this.collection.supernodos.get(supernodoId);
            if (supernodo && !supernodo.get("validated")) {
                supernodo.destroy();
                this.collection.supernodos.fetch();
                this.trigger("closeall");
            }
    },

    newsupernodo: function() {
	    var position = this.newmarker.getPosition();
	    this.collection.supernodos.create({ validated: false, name: "newnodo", latlng: { lat: position.lat(), lng: position.lng() } });
	    this.newmarker.setMap(null);
	    this.collection.supernodos.fetch();
    },

    addmarker: function() {
	if (this.newmarker) {
		this.newmarker.setMap(null);
	}

  	var marker = new google.maps.Marker({
    		map: this.map,
    		draggable: true,
    		animation: google.maps.Animation.DROP,
    		position: new google.maps.LatLng(40.000531,-0.039139)
  	});	    
	var infowindow = new google.maps.InfoWindow({ 
		content: "Arrastra el marcador a la posicion del nuevo supernodo. <br />Una vez situado, pulsa el boton "  + "<a href=\"#\" class=\"btn btn-primary save-marker\">Guardar</a>" });
	infowindow.open(this.map, marker); 
	this.infowindows.push(infowindow);

	var ref = this;
	google.maps.event.addListener(marker, 'click', function() { 
		_.each(ref.infowindows, function(i) {
			i.close();
		});
		infowindow.open(this.map,marker); 
	});

	this.newmarker = marker;
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
	this.collection.supernodos.each(function(supernodo) {
		ref.renderMarker(supernodo);
	});
	this.collection.each(function(enlace) {
		if (enlace.get("id")) {
			ref.renderLink(enlace);
		} else {
			enlace.destroy();
		}
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
		content: "Supernodo <strong>" + supernodo.get("name") + "</strong> <br />Responsable: <strong>" + supernodo.get("email") + "</strong> <br />IP: <strong>" + supernodo.get("ip") + "</strong><br /><a href=\"#edit/supernodo/" + supernodo.get("id") + "\" class=\"btn btn-primary\">Editar supernodo</a> <a href=\"#delete/supernodo/" + supernodo.get("id") + "\" class=\"btn btn-danger delete-supernodo\">Borrar supernodo</a>" });

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
        var saturationColor = {
                0: "#00FF00",
                1: "#FFFF00",
                2: "#FF8800",
                3: "#FF0000"
        };

	var point = enlace.get("supernodos")[0].get("latlng");
	var p0 = new google.maps.LatLng(point["lat"], point["lng"]);
	point = enlace.get("supernodos")[1].get("latlng");
	var p1 = new google.maps.LatLng(point["lat"], point["lng"]);

	var weight = enlace.get("bandwidth")*.75 + 1;
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
