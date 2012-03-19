define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/newenlace.html',
  'depend!libs/bootstrap/bootstrap-modal[order!jquery]'
], function($, _, Backbone, templateNewEnlace) {

  var NewEnlaceView = Backbone.View.extend({
	template: _.template(templateNewEnlace),
        events: {
        	"click .newenlace .save-enlace": "save"
    	},
  	initialize: function(options) {
                _.bindAll( this, "create", "save", "close" );
		this.router = options.router;
		this.enlaces = options.enlaces;
		this.router.on("newenlace", this.create);
		this.router.on("closeall", this.close);
	},	
        render: function() {
		var data = this.router.enlaces.supernodos.map(function(s) {
			return { id: s.get("id"), name: s.get("name") }
		});
      		$(this.el).html(this.template({ supernodos: data }));
        	return this;
    	},
  	create: function() {
		this.render();
		$(this.el).modal();
	},
        close: function(event) {
        	$(this.el).modal("hide");
    	},
	save: function() {
                var s1 = $("#select01").val();
                var s2 = $("#select02").val();
		var enlace = this.enlaces.create( { supernodos: [ s1, s2 ] } );
		var s1 = this.enlaces.supernodos.get(s1);
		var s2 = this.enlaces.supernodos.get(s2);
		enlace.set("supernodos", [ s1, s2 ]);
	}
  });

  return NewEnlaceView;
});
