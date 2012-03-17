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
                        ip: null,
                        bandwidth: null,
                        traffic: null,
                        marker: {},
                        latlng: []
                }
        },
	initialize: function() {
		_.bindAll(this, "savedata");
	},
  	savedata: function(attributes) {
		console.log("save");
                this.save(attributes);
	}
  });
  return Supernodo;
});
