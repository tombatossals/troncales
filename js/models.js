window.Supernodo = Backbone.Model.extend({
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

window.Enlace = Backbone.Model.extend({
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
	initialize: function() {
        	var statusColor = {
                	"down": "FF0000",
                	"ok": "00FF00",
                	"saturated": "FFd660"
        	};
		this.set("state", statusColor[this.get("state")]);
	}
});
