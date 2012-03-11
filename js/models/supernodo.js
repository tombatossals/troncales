define([
  'underscore',
  'backbone',
  'async!http://maps.google.com/maps/api/js?sensor=false&libraries=geometry'
], function(_, Backbone) {
  var Supernodo = Backbone.Model.extend({
        defaults: function() {
                return {
			id: null,
                        name: null,
                        marker: {},
                        latlng: {}
                }
        },
	initialize: function() {
                var latlng = this.get("latlng");
                this.set("latlng", new google.maps.LatLng(latlng[0], latlng[1]));
	}
  });
  return Supernodo;
});
