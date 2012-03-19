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
      'edit/supernodo/:supernodo': 'editsupernodo',
      'delete/supernodo/:supernodo': 'deletesupernodo',
      'edit/enlace/:enlace': 'editenlace',
      'add/marker/': 'addmarker',
      'new/enlace/': 'newenlace',
      'help/:supernodo': 'help',
    
      // Default - catch all
      '*actions': 'defaultAction'
    },

    initialize: function(options) {
        _.bindAll( this, "modalenlace", "loadbox", "callmap", "calldeletesupernodo", "calleditsupernodo", "calleditenlace", "callnewenlace");
	this.enlaces = options.enlaces;
	this.supernodos = options.supernodos;
 	Backbone.history.start();
    },

    newenlace: function() {
	if (!this.enlaces.loaded) {
        	this.enlaces.on("reset", this.callnewenlace);
	} else {
	    	this.callnewenlace();
	}
    },

    addmarker: function() {
	    this.trigger("addmarker");
    },

    callnewenlace: function() {
	    	this.trigger("newenlace");
    },

    editenlace: function(enlaceId) {
	this.enlaceId = enlaceId;
	if (!this.enlaces.loaded) {
        	this.enlaces.on("reset", this.calleditenlace);
	} else {
		this.calleditenlace();
	}
    },

    calleditenlace: function() {
	    var enlace= this.enlaces.get(this.enlaceId);
	    this.trigger("editenlace", enlace);
    },

    deletesupernodo: function(supernodoId) {
	this.supernodoId = supernodoId;
	if (!this.enlaces.loaded) {
        	this.enlaces.on("reset", this.calldeletesupernodo);
	} else {
		this.calldeletesupernodo();
	}
    },

    calldeletesupernodo: function() {
	    var supernodo = this.enlaces.supernodos.get(this.supernodoId);
	    if (!supernodo.get("validated")) {
	    	this.enlaces.supernodos.remove(supernodo);
		this.enlaces.supernodos.trigger("change");
	    }
    },

    editsupernodo: function(supernodoId) {
	this.supernodoId = supernodoId;
	if (!this.enlaces.loaded) {
        	this.enlaces.on("reset", this.calleditsupernodo);
	} else {
		this.calleditsupernodo();
	}
    },

    calleditsupernodo: function() {
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
