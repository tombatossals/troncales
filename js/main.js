var map;

$(function() {
    var mapView = new MapView({ el: $("#map_canvas") });
    var enlaces = new ListaEnlaces();

    $(".modal .modal-footer .btn-primary").click(function() {
    	$("#linkInfo").modal("hide");
    });
});
