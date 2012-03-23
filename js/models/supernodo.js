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
                        email: null,
                        ip: null,
                        validated: false,
                        latlng: []
                }
        },
	initialize: function() {
		_.bindAll(this, "savedata");
	},
  	savedata: function(attributes) {
		if (!attributes["name"]) {
			return;
		}
                this.save(attributes);
	}
  });
  return Supernodo;
});
