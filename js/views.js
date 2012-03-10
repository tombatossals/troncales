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

var SupernodoMapView = Backbone.View.extend({
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

var EnlaceBoxView = Backbone.View.extend({
	tagName: "div",
    	className: "box",
    	events: {
		"click .close": "close",
		"click": "showModal"
	},
    	render: function() {
		var self =this;
                $(self.el).empty().template("templates/linkBox.html", self.model.toJSON());
		return this;
	},
    	showModal: function() {
            var linkModalView = new EnlaceModalView({ model: this.model });
            $("#modal").empty().append(linkModalView.render().el);
	},
    	close: function(event) {
		event.stopPropagation();
		$(this.el).hide();
	}
});

var EnlaceModalView = Backbone.View.extend({
	tagName: "div",
    	className: "modal",
    	events: {
		"click .showoff": "close",
	},
    	render: function() {
		var self =this;
                $(self.el).empty().template("templates/linkModal.html", self.model.toJSON(), function() {
			$(self.el).modal();
		});
		return this;
	},
    	close: function() {
		$(this.el).modal("hide");
	}
});

var EnlaceMapView = Backbone.View.extend({
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

		// Google Map events for this polyline
                var ref = this;
                google.maps.event.addListener(poly, "mouseout",
                    (function(ref) {
                        return function() {
    			    dispatcher.trigger("polyout", ref);
                        };
                    })(ref)
                );
                google.maps.event.addListener(poly, "mouseover",
                    (function(ref) {
                        return function() {
    			    dispatcher.trigger("polyin", ref);
                        };
                    })(ref)
                );
                google.maps.event.addListener(poly, "click",
                    (function(ref) {
                        return function() {
    			    dispatcher.trigger("polyclick", ref);
                        };
                    })(ref)
                );
	}
});
