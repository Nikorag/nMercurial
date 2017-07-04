angular.module('BlankApp').controller("authPopupCtrl", function($scope, $mdDialog){
    $scope.auth = function(auth){
        $mdDialog.hide(auth);
    }
});