var map;
var supernodos;
var enlaces;

var statusColor = {
    "down": "FF0000",
    "ok": "00FF00",
    "saturated": "FFd660"
}

function getMarker(node, map, name) {
    var icon = new google.maps.MarkerImage("img/wifi.png", null, null, new google.maps.Point(16, 16));
    var marker2 = new google.maps.Marker({
            map: map,
            position: node,
            icon: icon
    });
    var marker = new StyledMarker({
      map: map,
      styleIcon: new StyledIcon(StyledIconTypes.BUBBLE, { color:"CCCCCC", text: name }),
      draggable: false,
      position: node
    });
    return marker;
}

function updatelink(poly) {
    var distance = (google.maps.geometry.spherical.computeDistanceBetween(supernodos[poly.link1].latlng, supernodos[poly.link2].latlng) / 1000).toFixed(3);
    $("#graph1").html("<img src=\"http://10.228.144.163:81/cacti/graph_image.php?local_graph_id=" + poly.graph_id + "\" />");
    $("#graph2").html("<img src=\"http://10.228.144.163:81/cacti/graph_image.php?local_graph_id=" + poly.traffic_graph_id + "\" />");

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
    var distance = "0.0";

    var polyOptions = {
        strokeColor: statusColor[poly.status],
        strokeOpacity: 1.0,
        strokeWeight: 9,
        map: map,
    };

    poly.setOptions(polyOptions);
}

function initialize() {
    supernodos = {
        castalia: { name: "Castalia", latlng: new google.maps.LatLng(39.995174, -0.036052) },
        laplana: { name: "La Plana", latlng: new google.maps.LatLng(39.996424, -0.000437)},
        ujihumanas: { name: "UJI Humanas", latlng: new google.maps.LatLng(39.995347, -0.070050)},
        pabello: { name: "Pabelló Ciutat de Castelló", latlng: new google.maps.LatLng(39.974999, -0.055556) }
    }

    var myOptions = {
        zoom: 13,
        center: new google.maps.LatLng(40.000531,-0.039139),
        mapTypeId: google.maps.MapTypeId.SATELLITE
    };

    map = new google.maps.Map(document.getElementById('map_canvas'),
      myOptions);

    for (var i in supernodos) {
        supernodos[i].marker = getMarker(supernodos[i].latlng, map, supernodos[i].name);
    }
         

  //var bounds = new google.maps.LatLngBounds(castalia.marker.getPosition(), laplana.marker.getPosition());
  //map.fitBounds(bounds);

  enlaces = [ { status: "ok", graph_id: 24, traffic_graph_id: 5, p2p: [ "castalia", "laplana" ] }, { status: "saturated", graph_id: 23, traffic_graph_id: 6, p2p: [ "castalia", "ujihumanas" ] }, { status: "down", graph_id: 28, traffic_graph_id: 19, p2p: [ "ujihumanas", "pabello" ] } ];
  var path = {};
  var link1 = "";
  var link2 = "";
  var poly = {};

  for (enlace in enlaces) {
    link1 = enlaces[enlace]["p2p"][0];
    link2 = enlaces[enlace]["p2p"][1];

    var polyOptions = {
        strokeColor: statusColor[enlaces[enlace]["status"]],
        strokeOpacity: 1.0,
        strokeWeight: 9,
        map: map,
    };

    var poly = new google.maps.Polyline(polyOptions);
    path = [ supernodos[link1].marker.getPosition(), supernodos[link2].marker.getPosition()];
    poly.setPath(path);
    poly.link1 = link1;
    poly.link2 = link2;
    poly.graph_id = enlaces[enlace]["graph_id"];
    poly.traffic_graph_id = enlaces[enlace]["traffic_graph_id"];
    poly.status = enlaces[enlace]["status"];
    google.maps.event.addListener(poly, "mouseout", 
        (function(poly) {
            return function() {
                out(poly);
            };
        })(poly)
    );
    google.maps.event.addListener(poly, "mouseover", 
        (function(poly) {
            return function() {
                updatelink(poly);
            };
        })(poly)
    );
  }
}

google.maps.event.addDomListener(window, 'load', initialize);
