window.ListaSupernodos = Backbone.Collection.extend({
        model: Supernodo,
        url: 'json/supernodos.json',
        initialize: function() {
                this.fetch();  
        }
});

window.ListaEnlaces = Backbone.Collection.extend({
        model: Enlace,
        url: 'json/enlaces.json',
        initialize: function() {
                this.fetch();  
        }
});
