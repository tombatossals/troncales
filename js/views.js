var MapView = Backbone.View.extend({
    tagName:  "div",
    initialize: function() {
    	var myOptions = {
        	zoom: 13,
        	center: new google.maps.LatLng(40.000531,-0.039139),
        	mapTypeId: google.maps.MapTypeId.HYBRID
    	};
    	map = new google.maps.Map(this.el, myOptions);
    	this.render();
    },

    render: function() {
        return this;
    }

});

var SupernodoView = Backbone.View.extend({
	initialize: function() {
		this.render();
	},
	render: function() {
                var icon = new google.maps.MarkerImage("img/wifi.png", null, null, new google.maps.Point(16, 16));
                var marker = new google.maps.Marker({
                                map: map,
                                position: this.model.get("latlng"),
                                icon: icon
                                });
                this.model.set("marker", marker);
	}
});

var EnlaceView = Backbone.View.extend({
	initialize: function() {
		this.render();
	},
        render: function() {
                var path = [ this.model.get("supernodos")[0].get("marker").getPosition(), this.model.get("supernodos")[1].get("marker").getPosition()];
                var polyOptions = {
                        strokeColor: this.model.get("state"),
                        strokeOpacity: 1.0,
                        strokeWeight: 9,
                        map: map,
			path: path
                };

                var poly = new google.maps.Polyline(polyOptions);
                this.model.set("poly", poly);

		// Google Map events
                var ref = this;
                google.maps.event.addListener(poly, "mouseout",
                        (function(ref) {
                                return function() {
    					ref.model.get("poly").setOptions({ strokeColor: ref.model.get("state") });
                                };
                        })(ref)
                );
                google.maps.event.addListener(poly, "mouseover",
                        (function(ref) {
                                return function() {
    					$(".graph1").html("<img src=\"http://10.228.144.163/cacti/graph_image.php?local_graph_id=" + ref.model.get("graph_id") + "\" />");
    					$(".graph2").html("<img src=\"http://10.228.144.163/cacti/graph_image.php?local_graph_id=" + ref.model.get("traffic_graph_id") + "\" />");
    					ref.model.get("poly").setOptions({ strokeColor: "#FFFFFF" });
    					$(".distance").html("Distancia del enlace: <strong>" + ref.model.get("distance") + " Km.</strong>");
					$("#infoSupernodo").show();
					$(".name").text(ref.model.get("id"));
                                };
                        })(ref)
                );
                google.maps.event.addListener(poly, "click", function() {
                        $('#linkInfo').modal("show");
                });
	}
});
