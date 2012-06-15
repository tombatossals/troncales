define([
  'jquery',
  'underscore',
  'backbone',
  'async!http://maps.google.com/maps/api/js?sensor=false&libraries=geometry'
], function($, _, Backbone){

  var MapView = Backbone.View.extend({
    el: "#map_canvas",
    events: {
            "click .btn-close": "closeall"
    },
    initialize: function(options) {
	    _.bindAll( this, "renderSupernodes", "closeall" );
	    this.infowindows = new Array();
        var node = undefined;
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
        this.collection.supernodos.on("reset", this.renderSupernodes);
    },

    setInitialNode: function(id) {
        var supernodo = this.collection.supernodos.get(id);
        var marker = this.markers[id];
        marker.setIcon("img/wifiRed.png");
	    var p = supernodo.get("latlng");
	    this.map.setCenter(new google.maps.LatLng(p["lat"], p["lng"]));
        var infowindow = new google.maps.InfoWindow({
            maxWidth: 300,
            content: '<p style="font-size: 1.2em; padding: .5em;">Este es el supernodo al que te conectas y el inicio del camino que vamos a medir. Pulsa sobre otro supernodo para averiguar cuál es el camino que seguirá tu tráfico.</p><p style="font-size: 1.2em; padding: .5em;">Puedes cambiar el marcador de inicio a otro supernodo si quieres visualizar otras rutas pulsando el botón de "<strong>Cambia punto de partida</strong> que encontrarás en la caja de información de cada supernodo</p>'  + '<p style="float: right;"><a href="#" class="btn btn-primary btn-close">Aceptar</a></p>' });
        infowindow.open(this.map, marker); 
        this.infowindows.push(infowindow);

        var ref = this;
        google.maps.event.addListener(marker, 'click', function() {
            ref.closeall();
            infowindow.open(this.map,marker);
        });
    },

    centermap: function(placeId) {
	    var supernodo = undefined;
	    this.collection.supernodos.each(function(s) {
		    if (placeId === s.get("name")) {
			    supernodo = s;
		    }
	    });
	    var p = supernodo.get("latlng");
	    this.map.setCenter(new google.maps.LatLng(p["lat"], p["lng"]));
    },

    renderSupernodes: function() {
	    var ref = this;
	    this.collection.supernodos.each(function(supernodo) {
		    ref.renderMarker(supernodo);
	    });
        $.ajax({ url: "/api/getsupernode", context: this }).done(function(id) {
            if (id) {
                this.setInitialNode(id);
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

	    this.markers[supernodo.id] = marker;
	    var infowindow = new google.maps.InfoWindow({ 
		    content: "Supernodo <strong>" + supernodo.get("name") + "</strong> <br />IP: <strong>" + supernodo.get("ip") + "</strong><br /><a href=\"#set/route/" + supernodo.get("id") + "\" class=\"btn btn-primary\">Establecer destino</a>"
        });

	    var ref = this;
	    google.maps.event.addListener(marker, 'click', function() { 
            ref.closeall();
		    infowindow.open(this.map,marker); 
	    });

	    this.infowindows.push(infowindow);
    },

    closeall: function() {
	    _.each(this.infowindows, function(i) {
		    i.close();
	    });
        return false;
    },

    renderLink: function(enlace) {
        var saturationColor = {
                0: "#00FF00",
                1: "#FFFF00",
                2: "#FF8800",
                3: "#FF0000"
        };

	    var point = this.collection.supernodos.get(enlace.get("supernodos")[0]).get("latlng");
	    var p0 = new google.maps.LatLng(point["lat"], point["lng"]);
	    point = this.collection.supernodos.get(enlace.get("supernodos")[1]).get("latlng");
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
