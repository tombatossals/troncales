var map;
var supernodos;
var enlaces;

function getMarker(node, map, name) {
    var marker = new StyledMarker({
      map: map,
      styleIcon: new StyledIcon(StyledIconTypes.BUBBLE, { color:"CCCCCC", text: name }),
      draggable: false,
      position: node
    });

    return marker;
}

function updatelink(name) {
    console.log(name);
    var distance = (google.maps.geometry.spherical.computeDistanceBetween(supernodos["castalia"].latlng, supernodos["laplana"].latlng) / 1000).toFixed(3);
    $("#distance").html(distance+"Km.");
}

function initialize() {
    supernodos = {
        castalia: { name: "Castalia", latlng: new google.maps.LatLng(39.995172, -0.035539) },
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

    map.controls[google.maps.ControlPosition.TOP].push(document.getElementById('info'));

    for (var i in supernodos) {
        supernodos[i].marker = getMarker(supernodos[i].latlng, map, supernodos[i].name);
    }
         

  //var bounds = new google.maps.LatLngBounds(castalia.marker.getPosition(), laplana.marker.getPosition());
  //map.fitBounds(bounds);

  var polyOptions = {
    strokeColor: '#00FF00',
    strokeOpacity: 1.0,
    strokeWeight: 6,
    map: map,
  };

  enlaces = [ [ "castalia", "laplana" ], [ "castalia", "ujihumanas" ], [ "ujihumanas", "pabello" ] ];
  var poly = {};
  var path = {};
  var link1 = "";
  var link2 = "";
  for (enlace in enlaces) {
    link1 = enlaces[enlace][0];
    link2 = enlaces[enlace][1];
    poly = new google.maps.Polyline(polyOptions);
    path = [ supernodos[link1].marker.getPosition(), supernodos[link2].marker.getPosition()];
    poly.setPath(path);

    google.maps.event.addListener(poly, 'mouseover', function() {
        var name = supernodos[link1].name + "-" + supernodos[link2].name;
        updatelink(name);
    });
  }

}

google.maps.event.addDomListener(window, 'load', initialize);
