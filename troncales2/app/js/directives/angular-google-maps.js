(function () {
  
  "use strict";
  
  var saturationColor = {
      0: "#00FF00",
      1: "#FFFF00",
      2: "#FF8800",
      3: "#FF0000"
  };

  function floatEqual (f1, f2) {
    return (Math.abs(f1 - f2) < 0.000001);
  }
  
  var MapModel = (function () {
    
    function PrivateMapModel(opts) {
      
      var _instance = null,
        _markers = [],  // caches the instances of google.maps.Marker
        _infowindow = null,  
        _supernodos = [],
        overlay = undefined,
        o = opts,
        that = this;
      
      this.zoom = opts.zoom || 15;    
      this.center = opts.center;
      this.position = new google.maps.LatLng(0, 0); 
      this.dragging = false;
      this.selector = o.container;
      this.markers = [];
      this.links = [];
      this.polylines = [];
      
      this.draw = function () {
        
        if (that.center == null) {
          // TODO log error
          return;
        }
        
        if (_instance == null) {
         
          // Create a new map instance
          
          _instance = new google.maps.Map(that.selector, {
            center: that.center,
            zoom: that.zoom,
            draggable: true,
            panControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            mapTypeId: google.maps.MapTypeId.HYBRID,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL
            }
          });
          
      	  var overlay = new google.maps.OverlayView();
      	  overlay.draw = function() {};
      	  overlay.setMap(_instance); 
          this.projection = undefined;

          google.maps.event.addListener(_instance, "idle", function () {
      	      that.projection = overlay.getProjection();
          });
        }
        else {
          // Refresh the existing instance
          google.maps.event.trigger(_instance, "resize");
          
          var instanceCenter = _instance.getCenter();
          
          if (!floatEqual(instanceCenter.lat(), that.center.lat())
            || !floatEqual(instanceCenter.lng(), that.center.lng())) {
              _instance.setCenter(that.center);
          }
        
          if (_instance.getZoom() != that.zoom) {
            _instance.setZoom(that.zoom);
          }          
        }
      };
   
      this.clearInfo = function() {
          if (_infowindow) {
              _infowindow.setMap(null);
          }
      };
 
      this.newMarker = function() {
        _infowindow = new google.maps.InfoWindow({
            content: "Drag me to the new location.<br />Click <strong>Save</strong> when done."
        });

        var icon = new google.maps.MarkerImage("/img/star.png", null, null, new google.maps.Point(16, 16));
        var marker = new google.maps.Marker({
          position: _instance.getCenter(),
          draggable: true,
          map: _instance,
          icon: icon
        });
        _infowindow.open(_instance, marker);

        return marker;

      }; 
 
      this.getById = function(id) {
          for (var i=0; i< _supernodos.length; i++) {
              var s = _supernodos[i];
              if (s._id == id) {
                  return s;
              }
          }
      };

      this.clearMap = function() {
          this.clearInfo();
          this.clearMarkers();
          this.clearLinks();
      };

      this.clearMarkers = function() {
          angular.forEach(_markers, function(marker) {
              marker.setMap(null);
          });
      };

      this.deactivateMarker = function(supernodo) {
          var marker = null;
          for (var i=0;i<_markers.length; i++) {
              if (_markers[i].name === supernodo) {
                 marker = _markers[i];
                 break;
              } 
          }
          var hicon = new google.maps.MarkerImage("img/star.png", null, null, new google.maps.Point(16, 16));
          marker.setIcon(hicon);
      };

      this.activateMarker = function(marker) {
          var hicon = new google.maps.MarkerImage("img/wifiRed.png", null, null, new google.maps.Point(16, 16));
          marker.setIcon(hicon);
      };

      this.clearLinks = function() {
          angular.forEach(this.polylines, function(poly) {
              poly.setMap(null);
          });
      };
 
      this.renderLink = function(enlace) {
          var point = this.getById(enlace.supernodos[0].id).latlng;
          var p0 = new google.maps.LatLng(point["lat"], point["lng"]);
          point = this.getById(enlace.supernodos[1].id).latlng;
          var p1 = new google.maps.LatLng(point["lat"], point["lng"]);

          var weight = 3;
          if (enlace.bandwidth > 50) {
              weight = 10;
          } else if (enlace.bandwidth > 30) {
              weight = 8;
          } else if (enlace.bandwidth > 20) {
              weight = 5;
          } else if (enlace.bandwidth > 10) {
              weight = 3;
          }

          var polyOptions = {
              strokeColor: saturationColor[enlace.saturation],
              strokeOpacity: 1.0,
              strokeWeight: weight,
              map: _instance,
              path: [p0, p1]
          };

          var poly = new google.maps.Polyline(polyOptions);

          this.polylines.push(poly);

          return poly;
      };

      this.fit = function () {
        if (_instance && _markers.length) {
          
          var bounds = new google.maps.LatLngBounds();
          
          angular.forEach(_markers, function (m, i) {
            bounds.extend(m.getPosition());
          });
          
          _instance.fitBounds(bounds);
        }
      };
      
      this.addMarker = function (supernodo) {
        var lat = supernodo.latlng.lat;
        var lng = supernodo.latlng.lng;

        _supernodos.push(supernodo);
 
        var icon = new google.maps.MarkerImage("/img/star.png", null, null, new google.maps.Point(16, 16));

        if (that.findMarker(lat, lng) != null) {
          return;
        }

        var position = new google.maps.LatLng(lat, lng); 
        var marker = new google.maps.Marker({
          name: supernodo.name,
          position: position,
          map: _instance,
          icon: icon
        });
    
        // Cache marker 
        _markers.unshift(marker);
       
        // Cache instance of our marker for scope purposes
        that.markers.unshift({
          lat: lat,
          lng: lng,
          draggable: false
        });
        
        // Return marker instance
        return marker;
      };      
      
      this.findMarker = function (lat, lng) {
        for (var i = 0; i < _markers.length; i++) {
          var pos = _markers[i].getPosition();
          
          if (floatEqual(pos.lat(), lat) && floatEqual(pos.lng(), lng)) {
            return _markers[i];
          }
        }
        
        return null;
      };  
      
      this.findMarkerIndex = function (lat, lng) {
        for (var i = 0; i < _markers.length; i++) {
          var pos = _markers[i].getPosition();
          
          if (floatEqual(pos.lat(), lat) && floatEqual(pos.lng(), lng)) {
            return i;
          }
        }
        
        return -1;
      };
      
      this.hasMarker = function (lat, lng) {
        return that.findMarker(lat, lng) !== null;
      };  
      
      this.getMarkerInstances = function () {
        return _markers;
      };
      
      this.removeMarkers = function (markerInstances) {
        
        var s = this;
        
        angular.forEach(markerInstances, function (v, i) {
          var pos = v.getPosition(),
            lat = pos.lat(),
            lng = pos.lng(),
            index = s.findMarkerIndex(lat, lng);
          
          // Remove from local arrays
          _markers.splice(index, 1);
          s.markers.splice(index, 1);
          
          // Remove from map
          v.setMap(null);
        });
      };
    }
    
    // Done
    return PrivateMapModel;
  }());
  
  // End model
  
  // Start Angular directive
  
  var googleMapsModule = angular.module("google-maps", []);

  /**
   * Map directive
   */
  googleMapsModule.directive("googleMap", ["$log", "$timeout", "$filter", function ($log, $timeout, 
      $filter) {
    
    return {
      restrict: "EC",
      priority: 100,
      transclude: true,
      template: "<div class='angular-google-map' ng-transclude></div>",
      replace: false,
      scope: {
        center: "=center", // required
        markers: "=markers", // optional
        gps: "=gps", // optional
        path: "=path", // optional
        newmarker: "=newmarker", // optional
        links: "=links", // optional
        latitude: "=latitude", // required
        longitude: "=longitude", // required
        zoom: "=zoom" // optional, default 8
      },

      controller: function ($scope, $element) {
        var _m = $scope.map;
      },      

      link: function (scope, element, attrs, ctrl) {
        
        // Center property must be specified and provide lat & 
        // lng properties
        if (!angular.isDefined(scope.center) || 
            (!angular.isDefined(scope.center.lat) || 
                !angular.isDefined(scope.center.lng))) {
          
          $log.error("Could not find a valid center property");
          
          return;
        }
        
        angular.element(element).addClass("angular-google-map");
       
        // Create our model
        var _m = new MapModel({
          container: element[0],
          center: new google.maps.LatLng(scope.center.lat, 
                  scope.center.lng),
          zoom: scope.zoom
        });       
     
        // Put the map into the scope
        scope.map = _m;
        
        // Check if we need to refresh the map
        if (!scope.hasOwnProperty('refresh')) {
          // No refresh property given; draw the map immediately
          _m.draw();
        }
        else {
          scope.$watch("refresh()", function (newValue, oldValue) {
            if (newValue && !oldValue) {
              _m.draw();
            }
          }); 
        }
      
       function getById(id) {
           for (var i=0; i< scope.markers.length; i++) {
               var s = scope.markers[i];
               if (s._id == id) {
                   return s;
               }
           }
       };

        scope.$watch("links", function(newArray, oldArray) {
            _m.clearLinks();
            if (newArray.length > 0) {
              $timeout(function () {
                angular.forEach(newArray, function(enlace) {
                   var poly =  _m.renderLink(enlace);
                   var path = poly.getPath(); 
                   enlace.distance = google.maps.geometry.spherical.computeLength(path.getArray());
                   if (scope.zoom) { 
                       google.maps.event.addListener(poly, "mouseout", (function(enlace, poly) {
                           return function() {
                               poly.setOptions({
                                   strokeColor: saturationColor[enlace.saturation]
                               });
                           };
                       })(enlace, poly));

                       google.maps.event.addListener(poly, "mouseover", (function(enlace, poly) {
                           return function(event) {
                               poly.setOptions({
                                   strokeColor: "#FFFFFF"
                               });

                               var s1 = getById(enlace.supernodos[0].id);
                               var s2 = getById(enlace.supernodos[1].id);

                               var pixel = scope.map.projection.fromLatLngToContainerPixel(event.latLng);
            	               var pos = [pixel.x, pixel.y];

                               poly.tooltip = $('<div />').qtip({
                                   content: '<a href="/enlace/#/' + s1.name + '/' + s2.name + '"><img src="' + "/graph/" + s1.name + "/" + s2.name + '" /></a>',
                                   style: {
                                       classes: 'ui-tooltip-bootstrap ui-tooltip-shadow graph'
                                   },
                                   position: {
                                       at: "right center",
                                       my: "left center",
                                       adjust: {
                                           method: "flip shift",
                                           x: 15
                                       },
                                       target: pos
                                   },
                                   show: {
                                       delay: 1,
                                       ready: true,
                                       event: false,
                                       solo: true
                                   },
                                   hide: {
                                       fixed: true,
                                       delay: 50,
                                       event: 'mouseleave unfocus',
                                       inactive: 2000
                                   }
                               }).qtip('api');
                           };
                       })(enlace, poly));

                       google.maps.event.addListener(poly, "click",
                           (function(enlace) {
                               return function() {
                                   var s1 = getById(enlace.supernodos[0].id);
                                   var s2 = getById(enlace.supernodos[1].id);
                                   window.location = "/enlace/#/" + s1.name + "/" + s2.name;
                               };
                           })(enlace)
                       );
                   }
               });
               }, 300);
            }
        }); 

        // Markers
        scope.$watch("markers", function (newValue, oldValue) {

          if (newValue.length == 0) return;
          if (newValue.length == 1 && oldValue.length == 1 && newValue[0].name == oldValue[0].name) return;

          $timeout(function () {
          
            _m.clearMap();
            angular.forEach(newValue, function (v, i) {
              if (!_m.hasMarker(v.latlng.lat, v.latlng.lng)) {
                var supernodo = v;
                var marker = _m.addMarker(v);
                if (scope.zoom) {
                    google.maps.event.addListener(marker, 'mouseover', function(event) {
                        var pixel = scope.map.projection.fromLatLngToContainerPixel(event.latLng);
                        var pos = [pixel.x, pixel.y];
                        marker.tooltip = $('<div />').qtip({
                            content: {
                                text: supernodo.mainip,
                                title: {
                                    text: supernodo.name,
                                    button: true
                                }
                            },
                            style: {
                                classes: 'ui-tooltip-bootstrap ui-tooltip-shadow'
                            },
                            position: {
                                at: "right center",
                                my: "left center",
                                adjust: {
                                    method: "flip shift",
                                    x: 15
                                },
                                target: pos
                            },
                            show: {
                                ready: true,
                                event: false,
                                solo: true
                            },
                            hide: {
                                fixed: true,
                                delay: 100,
                                event: 'mouseleave unfocus',
                                inactive: 2000
                            }
                        }).qtip('api');
	            });
                    
                    google.maps.event.addListener(marker, "click",
                        (function(supernodo) {
                            return function() {
                                if (scope.gps) {
                                    var found = false;
                                    for (var i=0; i<scope.path.length;i++) {
                                        if (supernodo.name == scope.path[i].name) {
                                            _m.deactivateMarker(scope.path[i].name);
                                            scope.path.splice(i, 1);
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (found === false) {
                                        if (scope.path.length == 2) {
                                            _m.deactivateMarker(scope.path[1].name);
                                            scope.path.splice(1, 1);
                                        }
                                        _m.activateMarker(marker);
                                        scope.path.push(supernodo);
                                    }
                                    scope.$apply();
                                } else {
                                    window.location = "/supernodo/#/" + supernodo.name;
                                }
                            };
                        })(supernodo)
                    );
                }
              }
            });
            
            // Clear orphaned markers
            var orphaned = [];
            
            angular.forEach(_m.getMarkerInstances(), function (v, i) {
              // Check our scope if a marker with equal latitude and longitude. 
              // If not found, then that marker has been removed form the scope.
              
              var pos = v.getPosition(),
                lat = pos.lat(),
                lng = pos.lng(),
                found = false;
              
              // Test against each marker in the scope
              for (var si = 0; si < scope.markers.length; si++) {
                
                var sm = scope.markers[si];
                
                if (floatEqual(sm.latlng.lat, lat) && floatEqual(sm.latlng.lng, lng)) {
                  // Map marker is present in scope too, don't remove
                  found = true;
                }
              }
              
              // Marker in map has not been found in scope. Remove.
              if (!found) {
                orphaned.push(v);
              }
            });
            
            _m.removeMarkers(orphaned);           
            
            // Fit map when there are more than one marker. 
            // This will change the map center coordinates
            if (newValue.length > 1) {
              _m.fit();
            }
          });
          
        }, true);
        

        // Update map when center coordinates change
        scope.$watch("center", function (newValue, oldValue) {
          if (newValue === oldValue) {
            return;
          }
          
          if (!_m.dragging) {
            _m.center = new google.maps.LatLng(newValue.lat, 
                newValue.lng);          
            _m.draw();
          }
        }, true);
        
        scope.$watch("newmarker", function (newValue, oldValue) {
            if (newValue === true) {
                _m.clearMap();
                var marker = _m.newMarker();
                var cm = null;
                google.maps.event.addListener(marker, "dragend", function(e) {
                    if (cm == null) {
                        cm = {
                            latitude: e.latLng.lat(),
                            longitude: e.latLng.lng()
                        };
                    } else {
                        cm.latitude = e.latLng.lat();
                        cm.longitude = e.latLng.lng();
                    }
                    scope.$apply(function () {
                        scope.newmarker = cm;
                    });
                });
            }
        });
      }
    };
  }]);  
}());
