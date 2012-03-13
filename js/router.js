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

    initialize: function(options) {
        _.bindAll( this, "loadmodal" );
	this.enlaces = options.enlaces;
	this.supernodos = options.supernodos;
 	Backbone.history.start();
    },

    show: function(modalId) {
	this.modalId = modalId
	if (!this.enlaces.loaded) {
        	this.enlaces.on("reset", this.loadmodal);
	} else {
		this.loadmodal();
	}
    },
 
    loadmodal: function() {
	    var enlace = this.enlaces.get(this.modalId);
	    this.enlaces.setmodal(enlace);
    }, 

    defaultAction: function(actions){
    }

  });

  return AppRouter;

});
