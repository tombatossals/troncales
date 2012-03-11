// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone'
], function ($, _, Backbone) {
  var AppRouter = Backbone.Router.extend({
    routes: {
      // Pages
      '/modules': 'modules',	
      '/optimize': 'optimize',
      '/backbone/:section': 'backbone',
      '/backbone': 'backbone',
    
      // Default - catch all
      '*actions': 'defaultAction'
    },
    defaultAction: function(actions){
    }
  });

  var initialize = function(){
    var app_router = new AppRouter;
    Backbone.history.start();
  };
  return {
    initialize: initialize
  };
});
