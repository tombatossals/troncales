(function () {
   "use strict";
}());

function EnlaceController($scope, $location, $http) {

    var supernodos = $location.path().replace("/", "").split("/");
    if (supernodos.length != 2) return;

    var s1 = supernodos[0];
    var s2 = supernodos[1];

    $http.get("/api/enlace/" + s1 + "/" + s2).success(function(response) {
        $scope.enlace = response.enlace;
        $scope.s1 = response.s1;
        $scope.s2 = response.s2;
        $scope.graph_image_url = "/graph/" + response.s1.name + "/" + response.s2.name;
        $scope.graph_image_url_weekly = $scope.graph_image_url + "?interval=weekly";
        $scope.graph_image_url_monthly = $scope.graph_image_url + "?interval=monthly";
        $scope.graph_image_url_year = $scope.graph_image_url + "?interval=year";
        $scope.title = "Enlace " + s1 + " - " + s2; 
    });

    $scope.goto = function(s) {
        window.location = "/supernodo/#/" + s.name;
    }

    $scope.saveUser = function() {
        $scope.messageOk = false;
        $http.put("/api/user/", { phone: $scope.phone }).success(function(response) {
            $scope.messageOk = true;
        });
    }

    $scope.removeLink = function(s1, s2) {
        $http.delete("/api/enlace/" + $scope.enlace._id).success(function(response) {
            window.location = "/";
        });
    };

    $scope.openModal = function() {
        console.log("hoal");
        $scope.shouldBeOpen = true;
    };

    $scope.close = function() {
        $scope.shouldBeOpen = false;
    };
}
