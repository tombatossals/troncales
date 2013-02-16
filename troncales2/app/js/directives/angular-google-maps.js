/**!
 * The MIT License
 * 
 * Copyright (c) 2010-2012 Google, Inc. http://angularjs.org
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 * angular-google-maps
 * https://github.com/nlaplante/angular-google-maps
 * 
 * @author Nicolas Laplante https://plus.google.com/108189012221374960701
 */

(function () {
  
  "use strict";
  
  /*
   * Utility functions
   */
  
  /**
   * Check if 2 floating point numbers are equal
   * 
   * @see http://stackoverflow.com/a/588014
   */
  function floatEqual (f1, f2) {
    return (Math.abs(f1 - f2) < 0.000001);
  }
  
  /* 
   * Create the model in a self-contained class where map-specific logic is 
   * done. This model will be used in the directive.
   */
  
  var MapModel = (function () {
    
    var _defaults = { 
        zoom: 8,
        draggable: false,
        container: null
      };
    
    /**
     * 
     */
    function PrivateMapModel(opts) {
      
      var _instance = null,
        _markers = [],  // caches the instances of google.maps.Marker
        _handlers = [], // event handlers
        _enlaces = [],  
        _supernodos = [],
        overlay = undefined,
        o = angular.extend({}, _defaults, opts),
        that = this;
     
      this.center = opts.center;
      this.position = new google.maps.LatLng(0, 0); 
      this.zoom = o.zoom;
      this.draggable = o.draggable;
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
            draggable: that.draggable,
            panControl: false,
            streetViewControl: false,
            mapTypeId: google.maps.MapTypeId.HYBRID,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL
            }
          });
          
      	  var overlay = new google.maps.OverlayView();
      	  overlay.draw = function() {};
      	  overlay.setMap(_instance); 
          this.projection = undefined;

          google.maps.event.addListener(_instance, "dragstart",
              
              function () {
                that.dragging = true;
              }
          );
         
          google.maps.event.addListener(_instance, "idle",
              
              function () {
                that.dragging = false;
      		that.projection = overlay.getProjection();
              }
          );
          
          google.maps.event.addListener(_instance, "drag",
              
              function () {
                that.dragging = true;   
              }
          );  
          
          google.maps.event.addListener(_instance, "zoom_changed",
              
              function () {
                that.zoom = _instance.getZoom();
                that.center = _instance.getCenter();
              }
          );
          
          google.maps.event.addListener(_instance, "center_changed",
              
              function () {
                that.center = _instance.getCenter();
              }
          );
          
          // Attach additional event listeners if needed
          if (_handlers.length) {
            
            angular.forEach(_handlers, function (h, i) {
              
              google.maps.event.addListener(_instance, 
                  h.on, h.handler);
            });
          }
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
    
      this.addmarker = function() {
          console.log("oye");
      };
 
      this.getById = function(id) {
          for (var i=0; i<_supernodos.length; i++) {
              var s = _supernodos[i];
              if (s._id == id) {
                  return s;
              }
          }
      };

      this.clearLinks = function() {
          angular.forEach(this.polylines, function(poly) {
              poly.setMap(null);
          });
      };
 
      this.renderLink = function(enlace) {
          var saturationColor = {
              0: "#00FF00",
              1: "#FFFF00",
              2: "#FF8800",
              3: "#FF0000"
          };

          if (this.getById(enlace.supernodos[0]).system != "mikrotik") return;
          if (this.getById(enlace.supernodos[1]).system != "mikrotik") return;

          var point = this.getById(enlace.supernodos[0]).latlng;
          var p0 = new google.maps.LatLng(point["lat"], point["lng"]);
          point = this.getById(enlace.supernodos[1]).latlng;
          var p1 = new google.maps.LatLng(point["lat"], point["lng"]);

          var weight = 3;
          if (enlace.bandwidth > 30) {
              weight = 10;
          } else if (enlace.bandwidth > 20) {
              weight = 8;
          } else if (enlace.bandwidth > 10) {
              weight = 5;
          } else if (enlace.bandwidth > 4) {
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

          google.maps.event.addListener(poly, "mouseout", (function(enlace, ply) {
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
                  var s1 = that.getById(enlace.supernodos[0]);
                  var s2 = that.getById(enlace.supernodos[1]);

                  var pixel = that.projection.fromLatLngToContainerPixel(event.latLng);
            	  var pos = [pixel.x, pixel.y];
                  poly.tooltip = $('<div />').qtip({
                      content: '<a href="/enlace/' + s1.name + '/' + s2.name + '"><img src="' + "/graph/" + s1.name + "/" + s2.name + '" /></a>',
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

              };
          })(enlace, poly));

          google.maps.event.addListener(poly, "click",
            (function(enlace) {
                return function() {
                    var s1 = that.getById(enlace.supernodos[0]);
                    var s2 = that.getById(enlace.supernodos[1]);
                    window.location = "/enlace/#/" + s1.name + "/" + s2.name;
                };
            })(enlace)
          );
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
      
      this.on = function(event, handler) {
        _handlers.push({
          "on": event,
          "handler": handler
        });
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
          position: position,
          map: _instance,
          icon: icon
        });
     
        var ref = this; 
        google.maps.event.addListener(marker, 'mouseover', function(event) {
            var pixel = ref.projection.fromLatLngToContainerPixel(event.latLng);

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
                    window.location = "/supernodo/#/" + supernodo.name;
                };
           })(supernodo)
        );

        // Cache marker 
        _markers.unshift(marker);
        
        // Cache instance of our marker for scope purposes
        that.markers.unshift({
          "lat": lat,
          "lng": lng,
          "draggable": false
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
        newmarker: "=newmarker", // optional
        links: "=links", // optional
        latitude: "=latitude", // required
        longitude: "=longitude", // required
        zoom: "=zoom", // optional, default 8
        //refresh: "&refresh", // optional
        windows: "=windows" // optional"
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
              
          draggable: attrs.draggable == "true",
          zoom: scope.zoom
        });       
     
        _m.on("drag", function () {
          
          var c = _m.center;
        
          $timeout(function () {
            
            scope.$apply(function (s) {
              scope.center.lat = c.lat();
              scope.center.lng = c.lng();
            });
          });
        });
      
        _m.on("zoom_changed", function () {
          
          if (scope.zoom != _m.zoom) {
            
            $timeout(function () {
              
              scope.$apply(function (s) {
                scope.zoom = _m.zoom;
              });
            });
          }
        });
      
        _m.on("center_changed", function () {
          var c = _m.center;
        
          $timeout(function () {
            
            scope.$apply(function (s) {
              
              if (!_m.dragging) {
                scope.center.lat = c.lat();
                scope.center.lng = c.lng();
              }
            });
          });
        });
        
        if (attrs.markClick == "true") {
          (function () {
            var cm = null;
            
            _m.on("click", function (e) {                         
              if (cm == null) {
                
                cm = {
                  latitude: e.latLng.lat(),
                  longitude: e.latLng.lng() 
                };
                
                scope.markers.push(cm);
              }
              else {
                cm.latitude = e.latLng.lat();
                cm.longitude = e.latLng.lng();
              }
              
              $timeout(function () {
                scope.$apply();
              });
            });
          }());
        }
        
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
      
        scope.$watch("links", function(newArray, oldArray) {
            _m.clearLinks();
            if (newArray.length > 0) {
                angular.forEach(newArray, function(enlace) {
                    _m.renderLink(enlace);
                });
            }
        }); 

        // Markers
        scope.$watch("markers", function (newValue, oldValue) {
          
          $timeout(function () {
            
            angular.forEach(newValue, function (v, i) {
              if (!_m.hasMarker(v.latlng.lat, v.latlng.lng)) {
                _m.addMarker(v);
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
            if (attrs.fit == "true" && newValue.length > 1) {
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
                _m.addmarker();
            }
        });

        scope.$watch("zoom", function (newValue, oldValue) {
          if (newValue === oldValue) {
            return;
          }
          
          _m.zoom = newValue;
          _m.draw();
        });
      }
    };
  }]);  
}());
