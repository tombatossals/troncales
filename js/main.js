// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config({
  waitSeconds: 16,
  paths: {
    // Major libraries
    jquery: 'libs/jquery/jquery-min',
    underscore: 'libs/underscore/underscore-min', // https://github.com/amdjs
    backbone: 'libs/backbone/backbone-min', // https://github.com/amdjs
    sinon: 'libs/sinon/sinon.js',
    async: 'libs/require/async',
    depend: 'libs/require/depend',

    // Require.js plugins
    text: 'libs/require/text',
    order: 'libs/require/order',

    // Just a short cut so we can put our html outside the js dir
    // When you have HTML/CSS designers this aids in keeping them out of the js directory
    templates: '../templates'
  }

});

// Let's kick off the application
require([
  'collections/enlaces',
  'collections/supernodos',
  'router',
  'views/viewenlace',
  'views/box',
  'views/map',
  'views/help',
  'views/search',
  'views/editsupernodo',
  'views/editenlace',
  'views/newenlace',
  'depend!libs/bootstrap/bootstrap-dropdown[order!jquery]',
  'depend!libs/bootstrap/bootstrap-typeahead[order!jquery]'
], function(ListaEnlaces, ListaSupernodos, AppRouter, ViewEnlaceView, BoxView, MapView, HelpView, SearchView, EditSupernodoView, EditEnlaceView, NewEnlaceView){
  var listaSupernodos =	new ListaSupernodos();
  var listaEnlaces = new ListaEnlaces( { supernodos: listaSupernodos } );
  var router = new AppRouter( { enlaces: listaEnlaces } );
  var mapView = new MapView( { enlaces: listaEnlaces, router: router });
  var viewEnlaceView = new ViewEnlaceView ( { el: "#modal", router: router } );
  var helpView = new HelpView( { el: "#modal", router: router } );
  var searchView = new SearchView( { el: "#search", enlaces: listaEnlaces, router: router } );
  var editSupernodoView = new EditSupernodoView ( { el: "#modal", router: router } );
  var editEnlaceView = new EditEnlaceView ( { el: "#modal", router: router } );
  var newEnlaceView = new NewEnlaceView ( { el: "#modal", router: router } );
  var boxView = new BoxView( { el: "#info-supernodo", router: router } );
});
