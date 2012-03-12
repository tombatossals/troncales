define([
  'jquery',
  'underscore',
  'backbone',
  'collections/supernodos',
  'models/enlace',
  'views/map',
  'async!http://maps.google.com/maps/api/js?sensor=false&libraries=geometry'
], function($, _, Backbone, ListaSupernodos, Enlace, MapView){

  var ListaEnlaces = Backbone.Collection.extend({
        model: Enlace,
        url: 'json/enlaces.json',
        initialize: function() {
		this.supernodos = new ListaSupernodos();
		var ref = this;
		this.supernodos.fetch({ success: function() {
                	ref.fetch( { success: function() {
        			var mapView = new MapView( { enlaces: ref } );
        			mapView.render();
			} });
		} });
        },
  	parse: function(data) {
		var ref = this;
		_.each(data, function(element) {
                	var s0 = ref.supernodos.get(element.supernodos[0]);
                	var s1 = ref.supernodos.get(element.supernodos[1]);
                	element.supernodos = [ s0, s1 ];
                	var distance = (google.maps.geometry.spherical.computeDistanceBetween(s0.get("latlng"), s1.get("latlng")) / 1000).toFixed(2);
                	element.distance = distance;
		});
		return data;
	}
  });

  return ListaEnlaces;
});
