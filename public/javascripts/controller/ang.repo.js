angular.module('BlankApp').controller("repoCtrl", function($scope, $http, $mdDialog, hg){

    $scope.repoName = $('.repoName').attr("data-repoName"); //Current reponame, rendered on the page by the route
    $scope.branches = []; //List of branches
    $scope.currentRevision = ""; //Current revision hash
    $scope.selectedChangeset = {}; //Selected change set
    $scope.changedFiles = {}; //Files changed in selected change set
    $scope.fileChanges = {}; //Changes to selected file
    $scope.gridOptions = {
        sort: {
            predicate: 'date',
            direction: 'asc'
        },
        data: [],
        getData : function(params, callback){
            hg.getHistory(params, $scope.repoName).then(function(result){
                callback(result.data, result.count);
            });
        }
    };

    $scope.updateCurrentRevision = function(){
        hg.getCurrentRevision($scope.repoName).then(function(result){
            $scope.currentRevision = result;
        });
    };

    $scope.changeBranch = function(branchName, ev){

        var confirm = $mdDialog.confirm()
            .title('Change to branch '+branchName)
            .textContent('Would you like to change to this branch and discard all changes')
            .targetEvent(ev)
            .ok('Ok')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function() {
            hg.changeBranch(branchName, $scope.repoName).then(function(result){
                for (var i in $scope.branches){
                    $scope.branches[i].active = false;
                }

                $scope.branches.filter(function(branch){
                    console.log(branch.name);
                    return branch.name == branchName;
                })[0].active = true;
                $scope.updateCurrentRevision();
            });
        }, function() {
            //TODO didn't confirm
        });

    }

    $scope.viewRevision = function(changeSet){
        hg.getModifiedFiles(changeSet, $scope.repoName).then(function(result){
            $scope.selectedChangeset = changeSet;
            $scope.changedFiles = result;
            $scope.fileChanges = {};
        });
    }

    $scope.getFileChanges = function(filename){
        hg.getFileChanges($scope.selectedChangeset, filename, $scope.repoName).then(function(result){
            $scope.fileChanges = result;
        });
    };

    $scope.getChangeContent = function(change){
        alert(JSON.stringify(change));
    }

    $scope.goHome = function(){
        window.location.href="/";
    }

    //Render the initial page
    hg.getBranches($scope.repoName).then(function(result){
        $scope.branches = result;
    });
    $scope.updateCurrentRevision();
});