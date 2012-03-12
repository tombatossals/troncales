// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone'
], function ($, _, Backbone) {
  var AppRouter = Backbone.Router.extend({
    routes: {
      // Pages
      'show/:supernodo': 'show',
    
      // Default - catch all
      '*actions': 'defaultAction'
    },

    show: function(id) {
	var enlace = this.enlaces.get(id);
        this.enlaces.loadmodal(enlace);
    },
  
    defaultAction: function(actions){
    },

    initialize: function(options) {
	this.enlaces = options.enlaces;
	this.supernodos = options.supernodos;
 	Backbone.history.start();
    }
  });

  return AppRouter;

});
