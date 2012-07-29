define([
  'jquery',
  'underscore',
  'backbone',
  'models/supernodo'
], function($, _, Backbone, Supernodo){

  var ListaSupernodos = Backbone.Collection.extend({
        model: Supernodo,
        url: '/api/supernodos'
  });

  return ListaSupernodos;
});
