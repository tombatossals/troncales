(function () {
   "use strict";
}());

function SupernodoController($scope, $location, $http) {
    var supernodo = $location.path().replace("/", "");

    $http.get("/api/supernodo/" + supernodo).success(function(response) {
        $scope.supernodo = response;
        $scope.title = "Supernodo " + response.name;

        $http.get("/api/supernodo/" + response._id + "/neighbours").success(function(response) {
            $scope.supernodos = response.supernodos;
        });
    });

    $scope.goto = function(neighbour) {
        window.location = "/enlace/#/" + $scope.supernodo.name + "/" + neighbour.name;
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

    $scope.openModal = function() {
        $scope.shouldBeOpen = true;
    };

    $scope.close = function() {
        $scope.shouldBeOpen = false;
    };
}
