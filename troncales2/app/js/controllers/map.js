(function () {
   "use strict";
}());

function MapController($scope, $location, $http) {

    $(".search").select2({
        placeholder: "Supernodos",
        ajax: {
            url: "/api/supernodos/search",
            data: function(term, page) {
                return {
                    q: term
                }
            },
            results: function(data) {
                return {
                    results: data
                }
            }
        }
    });

    $(".search").on("change", function(data) {
        window.location = "/supernodo/#/" + $(this).val();
    });

    angular.extend($scope, {
	center: {
		lat: 40.000531,
                lng: -0.039139
	},
	markers: [],
	links: [],
        path: [],
	zoom: 13,
        gps: true,
        newmarker: false
    });

    $scope.hash = $location.path();

    $http.get("/api/supernodo/").success(function(response) {
        $scope.markers = response;
    });

    $scope.openModal = function() {
        $scope.shouldBeOpen = true;
    };

    $scope.close = function() {
        $scope.shouldBeOpen = false;
    };

    $scope.addMarker = function() {
        $scope.links = [];
        $scope.markers = [];
        $scope.newmarker = true;
        $scope.gps = false;
        $("#all-links").removeClass("active");
    };

    $scope.postMarker = function() {
        $http.post("/api/supernodo/", $scope.newmarker).success(function(response) {
            $scope.newmarker = false;
            $http.get("/api/supernodo/").success(function(response) {
               $scope.markers = response;
            });
        });
    };

    $scope.updateLinks = function() {
        if ($scope.links.length > 0) {
            for (var e in $scope.links) {
                var enlace = $scope.links[e];
                var distance = parseInt(enlace.distance)/1000;
                $http.put("/api/enlace/" + enlace._id, { distance: distance });
            }
        }
    };

    $scope.toggleGps = function() {
        $scope.gps = !$scope.gps;
        $scope.newmarker = false;

        if (!$scope.gps) {
            $http.get("/api/enlace/").success(function(response) {
               $scope.links = response;
            });
            $http.get("/api/supernodo/").success(function(response) {
               $scope.markers = response;
            });
        } else {
            $scope.links = [];
        }
    };

    $scope.$watch("path", function(newValue, oldValue) {
        var path = newValue;
        $scope.links = [];
        if (path.length == 2) {
            $http.get("/api/path/" + path[0].name + "/" + path[1].name).success(function(response) {
                $scope.links = response;
            });
        }
    }, true);

    $scope.toggleGps();

}
