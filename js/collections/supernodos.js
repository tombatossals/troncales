define([
  'jquery',
  'underscore',
  'backbone',
  'models/supernodo'
], function($, _, Backbone, Supernodo){

  var ListaSupernodos = Backbone.Collection.extend({
        model: Supernodo,
        url: 'json/supernodos.json',
  	initialize: function() {
		this.fetch();
	}
  });

  return ListaSupernodos;
});
