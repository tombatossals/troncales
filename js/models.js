window.Supernodo = Backbone.Model.extend({
        defaults: function() {
                return {
			id: null,
			map: map,
                        name: null,
                        point: [],
                        marker: {},
                        latlng: {}
                }
        },
        initialize: function() {
                if (this.get("point")) {
                        var latlng = this.get("point");
                        this.set("latlng", new google.maps.LatLng(latlng[0], latlng[1]));
                }
		this.renderOnMap();
        },

	renderOnMap: function() {
    		var icon = new google.maps.MarkerImage("img/wifi.png", null, null, new google.maps.Point(16, 16));
    		var marker = new google.maps.Marker({
            			map: this.get("map"),
            			position: this.get("latlng"),
            			icon: icon
    				});
    		var marker2 = new StyledMarker({
      				map: this.get("map"),
      				styleIcon: new StyledIcon(StyledIconTypes.BUBBLE, { color:"CCCCCC", text: this.get("name")}),
      				draggable: false,
      				position: this.get("latlng")
    				});
		this.set("marker", marker);
	}
});

window.Enlace = Backbone.Model.extend({
	defaults: function() {
		return {
			id: null,
			distance: null,
			map: map,
			state: null, 
			graph_id: null,
			traffic_traph_id: null,
			poly: {},
			supernodos: []
		}
	},
	initialize: function() {
		if (this.get("supernodos")) {
			var s0 = supernodos.get(this.get("supernodos")[0]);
			var s1 = supernodos.get(this.get("supernodos")[1]);
			this.set("supernodos", [ s0, s1 ]);
			var distance = (google.maps.geometry.spherical.computeDistanceBetween(s0.get("latlng"), s1.get("latlng")) / 1000).toFixed(2);
			this.set("distance", distance);
		}

		this.renderOnMap();
	},

	renderOnMap: function() {

  		var path  = {};
  		var link1 = "";
  		var link2 = "";
  		var poly  = {};

    		var polyOptions = {
        		strokeColor: statusColor[this.get("state")],
        		strokeOpacity: 1.0,
        		strokeWeight: 9,
        		map: this.get("map"),
    		};

    		var poly = new google.maps.Polyline(polyOptions);
    		path = [ this.get("supernodos")[0].get("marker").getPosition(), this.get("supernodos")[1].get("marker").getPosition()];
    		poly.setPath(path);
		this.set("poly", poly);

    		google.maps.event.addListener(poly, "mouseout", 
        		(function(poly) {
            			return function() {
                			out(poly);
            			};
        		})(poly)
    		);
    		google.maps.event.addListener(poly, "mouseover", 
        		(function(poly) {
            			return function() {
                			updatelink(poly);
            			};
        		})(poly)
    		);
    		google.maps.event.addListener(poly, "click", function() {
			$('#linkInfo').modal("show");
    		});
  	}
});
