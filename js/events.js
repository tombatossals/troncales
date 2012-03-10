var dispatcher = _.clone(Backbone.Events);

dispatcher.on("polyout", function(enlace) {
    enlace.model.get("poly").setOptions({ strokeColor: enlace.model.get("state") });
});

dispatcher.on("polyin", function(enlace) {
    enlace.model.get("poly").setOptions({ strokeColor: "#FFFFFF" });
    var enlaceBoxView = new EnlaceBoxView( { model: enlace.model } );
    $("#info-supernodo").empty().append(enlaceBoxView.render().el);
});

dispatcher.on("polyclick", function(enlace) {
    var linkModalView = new EnlaceModalView({ model: enlace.model });
    $("#modal").empty().append(linkModalView.render().el);
});
