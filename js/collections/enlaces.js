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
        url: '/trunks/enlaces',

        initialize: function(options) {
		_.bindAll( this, "supernodosLoaded" );
		this.supernodos = options.supernodos
	  	this.loaded = false;
		var ref = this;
  		this.supernodos.bind("reset", this.supernodosLoaded);
        },

  	supernodosLoaded: function() {
		var ref = this;
		this.fetch( { success: function() { 
				ref.loaded = true; 
			} 
		});
	},

  	parse: function(data) {
		var ref = this;
		_.each(data, function(element) {
                	var s0 = ref.supernodos.get(element.supernodos[0]);
                	var s1 = ref.supernodos.get(element.supernodos[1]);
                	element.supernodos = [ s0, s1 ];
			var point = s0.get("latlng")
			var p0 = new google.maps.LatLng(point["lat"], point["lng"]);
			point = s1.get("latlng")
			var p1 = new google.maps.LatLng(point["lat"], point["lng"]);
                	var distance = (google.maps.geometry.spherical.computeDistanceBetween(p0, p1) / 1000).toFixed(2);
                	element.distance = distance;
		});
		return data;
	},
	setactive: function(enlace) {
		this.trigger("active", enlace);
	},
	setmodal: function(enlace) {
		this.trigger("setmodal", enlace);
	}
  });

  return ListaEnlaces;
});
