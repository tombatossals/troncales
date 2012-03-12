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
        url: 'json/enlaces.json',
        initialize: function(options) {
		this.supernodos = options.supernodos
		var ref = this;
		this.supernodos.fetch({ success: function() {
                	ref.fetch( { success: function() {
				ref.trigger("loaded");
			} });
		} });
        },
  	parse: function(data) {
		var ref = this;
		_.each(data, function(element) {
                	var s0 = ref.supernodos.get(element.supernodos[0]);
                	var s1 = ref.supernodos.get(element.supernodos[1]);
                	element.supernodos = [ s0, s1 ];
			var p1 = s0.get("latlng"), p2 = s1.get("latlng");
                	var distance = (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
                	element.distance = distance;
		});
		return data;
	},
	setactive: function(enlace) {
		this.trigger("active", enlace);
	},
	loadmodal: function(enlace) {
		this.trigger("loadmodal", enlace);
	}
  });

  return ListaEnlaces;
});
