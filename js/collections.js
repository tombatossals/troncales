window.ListaSupernodos = Backbone.Collection.extend({
        model: Supernodo,
        url: 'json/supernodos.json',
});

window.ListaEnlaces = Backbone.Collection.extend({
	supernodos: new ListaSupernodos(),
        model: Enlace,
        url: 'json/enlaces.json',
        initialize: function() {
		var ref = this;
		this.supernodos.fetch({ success: function() {
			ref.supernodos.each(function(supernodo) {
				new SupernodoView({ model: supernodo });
			});
               		ref.fetch({ success: function() {
				ref.each(function(enlace) {
               				var s0 = ref.supernodos.get(enlace.get("supernodos")[0]);
              				var s1 = ref.supernodos.get(enlace.get("supernodos")[1]);
             				enlace.set("supernodos", [ s0, s1 ]);
                			var distance = (google.maps.geometry.spherical.computeDistanceBetween(s0.get("latlng"), s1.get("latlng")) / 1000).toFixed(2);
                			enlace.set("distance", distance);
					new EnlaceView({ model: enlace });
				});
			}});
		}});
        }
});
