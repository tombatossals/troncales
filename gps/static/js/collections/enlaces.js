define([
  'jquery',
  'underscore',
  'backbone',
  'models/enlace',
  'views/map',
  'async!http://maps.google.com/maps/api/js?sensor=false&libraries=geometry'
], function($, _, Backbone, Enlace, MapView){

  var ListaEnlaces = Backbone.Collection.extend({
        model: Enlace,
        url: 'http://10.228.144.163/troncales/enlaces',

        initialize: function(options) {
		    this.supernodos = options.supernodos
        },

	    setactive: function(enlace) {
		    this.trigger("active", enlace);
	    },
  	    calculateDistances: function() {
	        var ref = this;
	        this.each(function(enlace) {
		    if (!ref.get("distance")) {
            		var point = ref.supernodos.get(enlace.get("supernodos")[0]).get("latlng")
            		var p0 = new google.maps.LatLng(point["lat"], point["lng"]);
            		point = ref.supernodos.get(enlace.get("supernodos")[1]).get("latlng")
            		var p1 = new google.maps.LatLng(point["lat"], point["lng"]);
            		var distance = (google.maps.geometry.spherical.computeDistanceBetween(p0, p1) / 1000).toFixed(2);
            		enlace.set("distance", distance);
		    }
	    });
	}
  });

  return ListaEnlaces;
});
