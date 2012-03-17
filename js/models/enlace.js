define([
  'underscore',
  'backbone',
  'async!http://maps.google.com/maps/api/js?sensor=false&libraries=geometry'
], function(_, Backbone) {

  var Enlace = Backbone.Model.extend({
  	events: {
		"maploaded": "loadmapdata"
	},
        defaults: function() {
                return {
                        id: null,
                        distance: null,
                        state: null, 
                        bandwidth: null,
                        traffic: null,
                        supernodos: []
                }
        },
        initialize: function() {
                _.bindAll(this, "savedata");
        },
        savedata: function(attributes) {
                this.save(attributes);
        }

  });
  return Enlace;
});
