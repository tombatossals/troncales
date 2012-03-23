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
  		"change .typeahead": "centermap",
	        },
        template: _.template(templateSearch),
  	initialize: function(options) {
		_.bindAll( this, "render", "centermap" );
	},	
        render: function() {
                $(this.el).html(this.template());
		this.source = this.enlaces.supernodos.pluck("name");
		$(".typeahead").typeahead( { source: this.source } );
	},
  	centermap: function() {
		var supernodoId = $(".typeahead").val();
		if (_.include(this.source, supernodoId)) {
                	this.router.navigate("centermap/" + supernodoId, { trigger: true } );
		}
	}
  });

  return SearchView;
});
