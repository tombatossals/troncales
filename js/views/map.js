define([
  'jquery',
  'underscore',
  'backbone',
  'async!http://maps.google.com/maps/api/js?sensor=false&libraries=geometry'
], function($, _, Backbone){

  var MapView = Backbone.View.extend({
    el: "#map_canvas",
    initialize: function(options) {
	_.bindAll( this, "renderLinks" );
	this.enlaces = options.enlaces;
	this.supernodos = this.enlaces.supernodos;
	this.router = options.router;
	this.enlaces.bind("reset", this.renderLinks);
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
        var marker = new google.maps.Marker({
                        map: this.map,
                        position: supernodo.get("latlng"),
                        icon: icon
                        });

	var infowindow = new google.maps.InfoWindow({ content: "Supernodo <strong>" + supernodo.get("id") + "</strong>" });
	google.maps.event.addListener(marker, 'mouseover', function() { infowindow.open(this.map,marker); });
	google.maps.event.addListener(marker, 'mouseout', function() { infowindow.close(); });

    },

    renderLink: function(enlace) {
        var statusColor = {
                "down": "#FF0000",
                "ok": "#00FF00",
                "saturated": "#FFd660"
        };
        var path = [ enlace.get("supernodos")[0].get("latlng"), enlace.get("supernodos")[1].get("latlng")];
        var polyOptions = {
                strokeColor: statusColor[enlace.get("state")],
                strokeOpacity: 1.0,
                strokeWeight: 9,
                map: this.map,
            	path: path
        };
        var poly = new google.maps.Polyline(polyOptions);

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
