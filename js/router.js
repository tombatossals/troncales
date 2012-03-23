// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/enlaces',
  'collections/supernodos',
  'views/viewenlace',
  'views/box',
  'views/map',
  'views/help',
  'views/search',
  'views/editsupernodo',
  'views/editenlace',
  'views/addenlace',
], function ($, _, Backbone, ListaEnlaces, ListaSupernodos, ViewEnlaceView, BoxView, MapView, HelpView, SearchView, EditSupernodoView, EditEnlaceView, AddEnlaceView) {
  var AppRouter = Backbone.Router.extend({
    routes: {
      // Pages
      'edit/supernodo/:supernodo': 'editsupernodo',
      'edit/enlace/:enlace': 'editenlace',
      'view/enlace/:enlace': 'viewenlace',
      'add/marker/': 'addmarker',
      'add/enlace/': 'addenlace',
      'help/:supernodo': 'help',
    
      // Default - catch all
      '*actions': 'defaultAction'
    },

    initialize: function(options) {
        _.bindAll( this, "viewenlace", "editsupernodo", "editenlace", "activelink", "defaultAction");

	var ref = this;
	this.supernodos = new ListaSupernodos();
	this.enlaces = new ListaEnlaces( { supernodos: this.supernodos } );
	this.supernodos.fetch({ success: function() {
		ref.enlaces.fetch( { success: function() {
			Backbone.history.start();
		} });
	} });
  	this.mapView = new MapView( { collection: this.enlaces });
  	this.viewEnlaceView = new ViewEnlaceView ( { el: "#modal", collection: this.enlaces } );
  	this.helpView = new HelpView( { el: "#modal" } );
  	this.searchView = new SearchView( { el: "#search", collection: this.enlaces } );
  	this.editSupernodoView = new EditSupernodoView ( { el: "#modal", collection: this.supernodos } );
  	this.editEnlaceView = new EditEnlaceView ( { el: "#modal", collection: this.enlaces } );
  	this.addEnlaceView = new AddEnlaceView ( { el: "#modal", collection: this.enlaces } );
  	this.boxView = new BoxView( { el: "#info-supernodo" } );

	this.mapView.on("viewenlace", this.viewenlace);
	this.mapView.on("activelink", this.activelink);
	this.mapView.on("closeall", this.defaultAction);
	this.addEnlaceView.on("closeall", this.defaultAction);
	this.editEnlaceView.on("closeall", this.defaultAction);
	this.editEnlaceView.on("closeall", this.defaultAction);
    },

    viewenlace: function(enlaceId) {
	    this.navigate("view/enlace/" + enlaceId);
	    var enlace = this.enlaces.get(enlaceId);
	    this.viewEnlaceView.model = enlace;
	    this.viewEnlaceView.render();
    },

    addenlace: function() {
	    this.addEnlaceView.render();
    },

    addmarker: function() {
	    this.mapView.addmarker();
    },

    editenlace: function(enlaceId) {
    	var enlace = this.enlaces.get(enlaceId);
    	this.editEnlaceView.model = enlace;
    	this.editEnlaceView.render();
    },

    editsupernodo: function(supernodoId) {
  	var supernodo = this.supernodos.get(supernodoId);
    	this.editSupernodoView.model = supernodo;
    	this.editSupernodoView.render();
    },

    centermap: function(placeId) {
	this.trigger("centermap", placeId);
    }, 

    help: function() {
	this.helpView.render();
    },
 
    activelink: function(enlace) {
	    this.boxView.model = enlace;
	    this.boxView.render();
    }, 

    defaultAction: function(actions){
	    this.mapView.closeall();
    }

  });

  return AppRouter;

});
