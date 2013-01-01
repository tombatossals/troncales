define([
  'underscore',
  'backbone',
  'async!http://maps.google.com/maps/api/js?sensor=false&libraries=geometry'
], function(_, Backbone) {

  var Enlace = Backbone.Model.extend({
  	    events: {
		    "maploaded": "loadmapdata"
	    },
        idAttribute: "_id",
        defaults: function() {
            return {
                id: null,
                distance: null,
                saturation: null, 
                bandwidth: null,
                rrdtool_bandwidth_graph_id: null,
                rrdtool_traffic_graph_id: null,
                rrdtool_bandwidth_id: null,
                rrdtool_traffic_id: null,
                traffic: null,
                validated: false,
                supernodos: []
            }
        },

        initialize: function() {
            _.bindAll(this, "savedata");
	        var supernodos = this.get("supernodos");
	        if (this.get("_id") === undefined || supernodos[0] === undefined || supernodos[1] === undefined ) {
	            this.destroy();
		    }
        },
        savedata: function(attributes) {
            this.save(attributes);
        }

  });
  return Enlace;
});
