define([
  'underscore',
  'backbone'
], function(_, Backbone) {

  var Camino = Backbone.Model.extend({
  	    events: {
		    "maploaded": "loadmapdata"
	    },

        defaults: function() {
                return {
                        id: null,
  			            supernodos: [],
  			            enlaces: []
                }
        },

        initialize: function() {
        },

  });
  return Camino;
});
