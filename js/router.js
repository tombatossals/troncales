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
      'viewenlace/:enlaceId': 'viewenlace',
      'centermap/:supernodo': 'centermap',
      'edit/supernodo/:supernodo': 'edit',
      'help/:supernodo': 'help',
    
      // Default - catch all
      '*actions': 'defaultAction'
    },

    initialize: function(options) {
        _.bindAll( this, "modalenlace", "loadbox", "callmap", "editsupernodo" );
	this.enlaces = options.enlaces;
	this.supernodos = options.supernodos;
 	Backbone.history.start();
    },

    edit: function(supernodoId) {
	this.supernodoId = supernodoId
	if (!this.enlaces.loaded) {
        	this.enlaces.on("reset", this.editsupernodo);
	} else {
		this.editsupernodo();
	}
    },

    editsupernodo: function() {
	    var supernodo = this.enlaces.supernodos.get(this.supernodoId);
	    this.trigger("editsupernodo", supernodo);
    },

    show: function(enlaceId) {
	this.enlaceId = enlaceId
	if (!this.enlaces.loaded) {
        	this.enlaces.on("reset", this.loadbox);
	} else {
		this.loadbox();
	}
    },
 
    centermap: function(placeId) {
	this.placeId = placeId;
	if (!this.enlaces.loaded) {
        	this.enlaces.on("reset", this.callmap);
	} else {
		this.callmap();
	}
    },

    callmap: function() {
	this.trigger("centermap", this.placeId);
    }, 

    viewenlace: function(enlaceId) {
	this.enlaceId = enlaceId;
	if (!this.enlaces.loaded) {
        	this.enlaces.on("reset", this.modalenlace);
	} else {
		this.modalenlace();
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

    modalenlace: function() {
	    var enlace = this.enlaces.get(this.enlaceId);
	    this.trigger("viewenlace", enlace);
    }, 

    defaultAction: function(actions){
	    this.trigger("closeall");
    }

  });

  return AppRouter;

});
