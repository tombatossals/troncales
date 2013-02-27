(function () {
   "use strict";
}());

function SupernodoController($scope, $location, $http) {

    $scope.location = $location;
    $scope.$watch("location.path()", function() {
        if ($location.path()) {
            goto($location.path().replace("/", ""));
        }
    });
 
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

    $(".newlink").select2({
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

    $(".newlink").on("change", function(data) {
        $scope.newlink = $(this).val();
    });

    angular.extend($scope, {
        center: {
                lat: 40.000531,
                lng: -0.039139
        },
        zoom: 16,
        markers: [],
        links: [],
        showLinks: false,
        newmarker: false
    });

    function goto(supernodo) {
        $http.get("/api/supernodo/" + supernodo).success(function(response) {
            $scope.supernodo = response;
            $scope.center = response.latlng;
            $scope.markers = [ response ];
            $scope.title = "Supernodo " + response.name + " (" + response.mainip + ")";
            $scope.hash = response.name;

            $http.get("/api/supernodo/" + response._id + "/neighbours").success(function(response) {
                $scope.supernodos = response.supernodos;
            });
        });
    }

    $scope.saveUser = function() {
        $scope.messageOk = false;
        $http.put("/api/user/", { phone: $scope.phone }).success(function(response) {
            $scope.messageOk = true;
        });
    }

    $scope.removeSupernodo = function(s1, s2) {
        $http.delete("/api/supernodo/" + $scope.supernodo._id).success(function(response) {
            window.location = "/";
        });
    };

    $scope.login = function(url) {
        window.location = "/login?return=" + url + "#" + $location.path();
    };

    $scope.openAddEnlace = function() {
        $scope.isOpenAddEnlace = true;
    };

    $scope.closeAddEnlace = function() {
        $scope.isOpenAddEnlace = false;
    };

    $scope.openRemoveSupernodo = function() {
        $scope.isOpenRemoveSupernodo = true;
    };

    $scope.closeRemoveSupernodo = function() {
        $scope.isOpenRemoveSupernodo = false;
    };

    $scope.saveSupernodo = function() {
        $scope.messageOk = false;
        $http.put("/api/supernodo/" + $scope.supernodo._id, { name: $scope.supernodo.name, mainip: $scope.supernodo.mainip }).success(function(response) {
            $scope.messageOk = true;
        });
    }

    $scope.addEnlace = function() {
        var s2 = $scope.newlink;
        $http.post("/api/enlace/", { s1: $scope.supernodo.name, s2: s2 }).success(function(response) {
            $scope.isOpenAddEnlace = false;
            $http.get("/api/supernodo/" + $scope.supernodo._id + "/neighbours").success(function(response) {
                $scope.supernodos = response.supernodos;
            });
        });
    };
}
