define([
  'jquery',
  'underscore',
  'backbone',
  'models/supernodo'
], function($, _, Backbone, Supernodo){

  var ListaSupernodos = Backbone.Collection.extend({
        model: Supernodo,
        url: 'http://10.228.144.163/troncales/supernodos'
  });

  return ListaSupernodos;
});
