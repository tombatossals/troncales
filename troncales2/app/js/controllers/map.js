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
	graph: {},
	zoom: 13,
    });

    $http.get("/api/supernodos/").success(function(response) {
        $scope.markers = response;
    });

    $scope.showLinks = function() {
        $http.get("/api/enlaces/").success(function(response) {
            $scope.links = response;
        });
    };
}
