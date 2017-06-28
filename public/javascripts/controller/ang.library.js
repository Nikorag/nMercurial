angular.module('BlankApp').controller("libraryCtrl", function($scope, $mdDialog, $http, libraryService){

    $scope.repos = []; //List of repos

    libraryService.getSavedRepos().then(function(result){
        $scope.repos = result;
    });

    //Show the add Repo dialog
    $scope.showAddRepo = function(ev) {
        $mdDialog.show({
            controller: "addRepoDialogCtrl",
            templateUrl: 'addRepoPopup',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
        .then(function (repo) {
            //Display the repo
            $scope.repos.push(repo);
        }, function () {
            $scope.status = 'You cancelled the dialog.';
        });
    }

    $scope.removeRepo = function(index, ev) {
        var confirm = $mdDialog.confirm()
            .title('Would you like to delete '+$scope.repos[index].name)
            .textContent('Would you like to remove the reference to '+$scope.repos[index].name+'. this will not delete the repo from the filesystem')
            .targetEvent(ev)
            .ok('Delete')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function() {
            libraryService.deleteRepo($scope.repos[index].name).then(function(result){
                $scope.repos = $scope.repos.filter(function(repo){
                    return repo.name !== $scope.repos[index].name;
                });
            });
        }, function() {
            //TODO reject deleting a repo
        });
    }

    $scope.editRepo = function(index, ex) {
        //TODO
    }

    $scope.openRepo = function(repoName) {
        window.location.href="repo?repoName="+repoName;
    }
});

angular.module('BlankApp').controller("addRepoDialogCtrl", function($scope, $http, $mdDialog, hg, libraryService){
    $scope.valid = false;
    $scope.repo = {};

    //Watch the path input and check it's a repo
    $scope.$watch('repo.path', function() {
        var segments = $scope.repo.path.split("/");
        $scope.repo.name = segments[segments.length - 1];
        hg.isRepo(encodeURIComponent($scope.repo.path)).then(function(result){
            $scope.valid = result;
        });
    });

    //What class for the tick/cross
    $scope.validClass = function(){
        if ($scope.valid != false){
            $scope.repo.url = $scope.valid;
            return "fa-check";
        } else {
            $scope.repo.url = "";
            return "fa-times";
        }
    }

    //Save the repo
    $scope.addRepo = function(repo){
        libraryService.addRepo(repo).then(function(result){
            $mdDialog.hide(repo);
        });
    }
});