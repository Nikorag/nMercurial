angular.module('BlankApp').controller("repoCtrl", function($scope, $http, $mdDialog, hg){

    $scope.repoName = $('.repoName').attr("data-repoName"); //Current reponame, rendered on the page by the route
    $scope.branches = []; //List of branches
    $scope.tags = []; //List of tags
    $scope.currentRevision = ""; //Current revision hash
    $scope.selectedChangeset = {}; //Selected change set
    $scope.changedFiles = {}; //Files changed in selected change set
    $scope.fileChanges = {}; //Changes to selected file
    $scope.totalHistory = 0;
    $scope.gridOptions = {
        sort: {
            predicate: 'date',
            direction: 'asc'
        },
        data: [],
        getData : function(params, callback){
            hg.getHistory(params, $scope.repoName).then(function(result){
                if ($scope.currentRevision == ""){
                    $scope.totalHistory = parseInt(result.count)+1;
                    var uncommitedChanges = {
                        changeset : "",
                        revision : "",
                        user : "",
                        date : "",
                        summary : "Uncommited Changes"
                    }
                    result.data.splice(0,0,uncommitedChanges);
                    callback(result.data, $scope.totalHistory);
                } else {
                    $scope.totalHistory = result.count;
                    callback(result.data, result.count);
                }
            });
        }
    };

    $scope.updateCurrentRevision = function(){
        hg.getStatus($scope.repoName).then(function(status){
           if (status.length == 0){
               hg.getCurrentRevision($scope.repoName).then(function(result){
                   $scope.currentRevision = result;
               });
           } else {
               $scope.currentRevision = "";
           }
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

    $scope.getFileChanges = function(file){
        hg.getFileChanges($scope.selectedChangeset, file, $scope.repoName).then(function (result) {
            $scope.fileChanges = result;
        });
    };

    $scope.getChangeContent = function(change){
        alert(JSON.stringify(change));
    }

    $scope.goHome = function(){
        window.location.href="/";
    }

    $scope.sanitizeDiffContent = function(change){
        if (change.del || change.add){
            return change.content.substr(1);
        } else {
            return change.content;
        }
    }

    //Render the initial page
    hg.getBranches($scope.repoName).then(function(result){
        $scope.branches = result;
    });
    hg.getTags($scope.repoName).then(function(result){
       $scope.tags = result;
    });
    $scope.updateCurrentRevision();
});