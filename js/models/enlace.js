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
                        graph_id: null,
                        traffic_traph_id: null,
                        poly: {},
                        supernodos: []
                }
        },
  });
  return Enlace;
});
