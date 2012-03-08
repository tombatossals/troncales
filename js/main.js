var supernodos;
var enlaces;
var map;

var statusColor = {
    "down": "FF0000",
    "ok": "00FF00",
    "saturated": "FFd660"
}

function updatelink(poly) {
    $(".graph1").html("<img src=\"http://10.228.144.163/cacti/graph_image.php?local_graph_id=" + poly.graph_id + "\" />");
    $(".graph2").html("<img src=\"http://10.228.144.163/cacti/graph_image.php?local_graph_id=" + poly.traffic_graph_id + "\" />");
    $(".distance").html("Distancia del enlace: " + distance + "km.");

    var polyOptions = {
        strokeColor: '#FFFFFF',
        strokeOpacity: 1.0,
        strokeWeight: 9,
        map: map,
    };
    poly.setOptions(polyOptions);
    $("#distance").html("Distancia del enlace: <strong>" + distance + "</strong> Km.");
}

function out(poly) {

    var polyOptions = {
        strokeColor: statusColor[poly.state],
        strokeOpacity: 1.0,
        strokeWeight: 9,
        map: map,
    };

    poly.setOptions(polyOptions);
}

function initialize() {
    var myOptions = {
        zoom: 13,
        center: new google.maps.LatLng(40.000531,-0.039139),
        mapTypeId: google.maps.MapTypeId.SATELLITE
    };

    map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);

}

$(function() {
	google.maps.event.addDomListener(window, 'load', initialize);
	supernodos = new ListaSupernodos();
	enlaces = new ListaEnlaces();
    	$(".modal .modal-footer .btn-primary").click(function() {
	    $("#linkInfo").modal("hide");
    	});
});
