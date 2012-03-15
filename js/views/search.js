define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone) {

  var SearchView = Backbone.View.extend({
    	tagName: "div",
        className: "search",
  	initialize: function(options) {
		_.bindAll( this, "loadData" );
		this.enlaces = options.enlaces;
		console.log(this.enlaces);
		this.enlaces.on("reset", this.render);
	},	
        render: function() {
		console.log("hola");
	}
  });

  return SearchView;
});
