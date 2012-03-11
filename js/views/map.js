define([
  'jquery',
  'underscore',
  'backbone',
  'views/box',
  'views/modal',
  'async!http://maps.google.com/maps/api/js?sensor=false&libraries=geometry'
], function($, _, Backbone, BoxView, ModalView){

  var MapView = Backbone.View.extend({
    el: "#map_canvas",
    initialize: function(options) {
	var enlaces = options.enlaces;
	var supernodos = enlaces.supernodos;
        var myOptions = {
                zoom: 13,
                center: new google.maps.LatLng(40.000531,-0.039139),
                mapTypeId: google.maps.MapTypeId.HYBRID
        };
        this.map = new google.maps.Map(this.el, myOptions);
	var ref = this;
	google.maps.event.addListenerOnce(this.map, 'idle', function(){
		supernodos.each(function(supernodo) {
			ref.renderMarker(supernodo);
		});
		enlaces.each(function(enlace) {
			ref.renderLink(enlace);
		});
	});

    },

    render: function() {
        return this;
    },

    // renders new marker to map
    renderMarker: function(supernodo) {
        var icon = new google.maps.MarkerImage("img/wifi.png", null, null, new google.maps.Point(16, 16));
        var marker = new google.maps.Marker({
                        map: this.map,
                        position: supernodo.get("latlng"),
                        icon: icon
                        });
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
			var boxView = new BoxView( { el: "#info-supernodo", model: enlace });
			boxView.render();
			boxView.show();
    			poly.setOptions({ strokeColor: "#FFFFFF" });
                };
            })(enlace, poly)
        );
        google.maps.event.addListener(poly, "click",
            (function(enlace) {
                return function() {
			var modalView = new ModalView ( { el: "#modal", model: enlace } );
			modalView.render();
			modalView.show();
                };
            })(enlace)
        );
    }

  });

  return MapView;
});
