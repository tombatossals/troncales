define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/addenlace.html',
  'depend!libs/bootstrap/bootstrap-modal[order!jquery]'
], function($, _, Backbone, templateAddEnlace) {

  var AddEnlaceView = Backbone.View.extend({
	template: _.template(templateAddEnlace),
        events: {
        	"click .addenlace .save-enlace": "save"
    	},
  	initialize: function(options) {
                _.bindAll( this, "save", "close" );
	},	
        render: function() {
		var data = this.collection.supernodos.map(function(s) {
			return { id: s.get("id"), name: s.get("name") }
		});
      		$(this.el).html(this.template({ supernodos: data }));
		$(this.el).modal();
        	return this;
    	},
        close: function(event) {
        	$(this.el).modal("hide");
		this.trigger("closeall");
    	},
	save: function() {
                var s1id = $("#select01").val();
                var s2id = $("#select02").val();
		var s1 = this.collection.supernodos.get(s1id);
		var s2 = this.collection.supernodos.get(s2id);
		if (!(s1 && s2)) return;

		var enlace = this.collection.create( { supernodos: [ s1id, s2id ] } );
		enlace.set("supernodos", [ s1, s2 ]);
		this.collection.fetch();
		this.close();
	}
  });

  return AddEnlaceView;
});
