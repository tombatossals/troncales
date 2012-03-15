define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/search.html'
], function($, _, Backbone, templateSearch) {

  var SearchView = Backbone.View.extend({
    	tagName: "div",
        className: "search",
        events: {
	        "submit #searchForm": "centermap",
	        "click": "centermap"
	        },
        template: _.template(templateSearch),
  	initialize: function(options) {
		_.bindAll( this, "render", "centermap" );
		this.enlaces = options.enlaces;
		this.router = options.router;
		console.log(this.router);
		this.enlaces.on("reset", this.render);
	},	
        render: function() {
                $(this.el).html(this.template());
		var source = this.enlaces.supernodos.pluck("id");
		$(".typeahead").typeahead( { source: source } );
	},
  	centermap: function() {
		var id = $(".typeahead").val();
		if (id) {
                	this.router.navigate("centermap/" + id);
		}
	}
  });

  return SearchView;
});
