requirejs.config({
    paths: {
        // Major libraries
        jquery: 'libs/jquery/jquery-min',
        underscore: 'libs/underscore/underscore-min',
        backbone: 'libs/backbone/backbone-min',
        d3: 'libs/d3/d3.v2.min',
        async: 'libs/require/async',

        // Require.js plugins
        text: 'libs/require/text',
        templates: '../templates'
    },

    shim: {
        'jquery': {
            exports: '$'
        },

        'underscore': {
            exports: '_'
        },

        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        }
    }

});

// Let's kick off the application
require([
    'app'
], function(App){
    App.initialize();
});
