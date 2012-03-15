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
      'showmodal/:enlaceId': 'showmodal',
      'centermap/:supernodo': 'centermap',
      'help/:supernodo': 'help',
    
      // Default - catch all
      '*actions': 'defaultAction'
    },

    initialize: function(options) {
        _.bindAll( this, "loadmodal", "loadbox", "callmap" );
	this.enlaces = options.enlaces;
	this.supernodos = options.supernodos;
 	Backbone.history.start();
    },

    show: function(enlaceId) {
	this.enlaceId = enlaceId
	if (!this.enlaces.loaded) {
        	this.enlaces.on("reset", this.loadbox);
	} else {
		this.loadbox();
	}
    },
 
    centermap: function(supernodo) {
	this.supernodo = supernodo;
	if (!this.enlaces.loaded) {
        	this.enlaces.on("reset", this.callmap);
	} else {
		this.callmap();
	}
    },

    callmap: function() {
	this.trigger("centermap", this.supernodo);
    }, 
    showmodal: function(enlaceId) {
	this.enlaceId = enlaceId
	if (!this.enlaces.loaded) {
        	this.enlaces.on("reset", this.loadmodal);
	} else {
		this.loadmodal();
	}
    },
 
    help: function(enlaceId) {
	var enlace = this.enlaces.get(this.enlaceId);
	this.trigger("showhelp", enlace);
    },
 
    loadbox: function() {
	    var enlace = this.enlaces.get(this.enlaceId);
	    this.trigger("showbox", enlace);
    }, 

    loadmodal: function() {
	    var enlace = this.enlaces.get(this.enlaceId);
	    this.trigger("showmodal", enlace);
    }, 

    defaultAction: function(actions){
    }

  });

  return AppRouter;

});
