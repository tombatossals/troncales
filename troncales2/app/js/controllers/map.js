(function () {
   "use strict";
}());

function MapController($scope, $location, $http) {

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

    $http.get("/api/supernodos/").success(function(response) {
        $scope.markers = response;
    });

    $scope.openModal = function() {
        console.log("hoal");
        $scope.shouldBeOpen = true;
    };

    $scope.close = function() {
        $scope.shouldBeOpen = false;
    };

    $scope.toggleLinks = function() {
        $scope.showLinks = !$scope.showLinks;

        if ($scope.showLinks) {
            $http.get("/api/enlaces/").success(function(response) {
               $scope.links = response;
            });
        } else {
            $scope.links = [];
        }
    };
}
