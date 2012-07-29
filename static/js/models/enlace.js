define([
  'underscore',
  'backbone',
  'async!http://maps.google.com/maps/api/js?sensor=false&libraries=geometry'
], function(_, Backbone) {

  var Enlace = Backbone.Model.extend({
        idAttribute: "_id",
  	    events: {
		    "maploaded": "loadmapdata"
	    },
        defaults: function() {
                return {
                        distance: null,
                        saturation: null, 
                        bandwidth: null,
  			            rrdtool_bandwidth_graph_id: null,
  			            rrdtool_traffic_graph_id: null,
  			            rrdtool_bandwidth_id: null,
  			            rrdtool_traffic_id: null,
                        validated: false,
                        supernodos: false
                }
        },
        initialize: function() {
        },
  });
  return Enlace;
});
