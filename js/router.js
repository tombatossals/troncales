// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/modal'
], function ($, _, Backbone, ModalView) {
  var AppRouter = Backbone.Router.extend({
    routes: {
      // Pages
      '/show/:supernodo': 'show',
      '/backbone': 'backbone',
    
      // Default - catch all
      '*actions': 'defaultAction'
    },
    show: function(id) {
	this.enlaces.each(function(e) {
		console.log(e);
	});
	console.log(this.enlaces.supernodos.get("castalia"));
	console.log(this.enlaces.get(id));
	console.log(this.enlaces.pluck("id"));
        var modalView = new ModalView ( { el: "#modal", model: this.enlaces.get(id) } );
        modalView.render();
        modalView.show();
    },
    defaultAction: function(actions){
    },
    initialize: function(options) {
	this.enlaces = options.enlaces;
    }
  });

  var initialize = function(ListaEnlaces){
    var listaEnlaces = new ListaEnlaces();
    var app_router = new AppRouter( { enlaces: listaEnlaces });
    Backbone.history.start();
  };
  return {
    initialize: initialize
  };
});
