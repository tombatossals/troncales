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
	zoom: 13,
        showLinks: false,
        newmarker: false
    });

    $scope.hash = $location.path();

    $http.get("/api/supernodo/").success(function(response) {
        $scope.markers = response;
    });

    $scope.gps = function() {
        $scope.step1 = true;
    };

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
        $scope.showLinks = false;
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

    $scope.toggleLinks = function() {
        $scope.newmarker = false;
        $scope.showLinks = !$scope.showLinks;

        if ($scope.showLinks) {
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
}
