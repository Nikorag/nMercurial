angular.module('BlankApp').controller("repoCtrl", function($scope, $http, $mdDialog, hg, $rootScope, $location){

    $scope.repoName = $('.repoName').attr("data-repoName"); //Current reponame, rendered on the page by the route
    $scope.repoUrl = $('.repoName').attr("data-repoUrl"); //Current reponame, rendered on the page by the route
    $scope.branches = []; //List of branches
    $scope.tags = []; //List of tags
    $scope.currentRevision = "nothing"; //Current revision hash
    $scope.selectedChangeset = {}; //Selected change set
    $scope.changedFiles = {}; //Files changed in selected change set
    $scope.fileChanges = {}; //Changes to selected file
    $scope.totalHistory = 0;
    $scope.gridActions = {};
    $scope.selectedFile = {}; //Currently diffing file
    $scope.gridOptions = {
        sort: {
            predicate: 'date',
            direction: 'asc'
        },
        data: [],
        getData : getData,
        main : true
    };

    function getData(params, callback){
        $scope.updateCurrentRevision(function(){
            hg.getHistory(params, $scope.repoName).then(function(result){
                if ($scope.currentRevision == "" && getSearchParamsFromString(params).page == '1'){
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
        });
    }

    $scope.updateCurrentRevision = function(promise){
        hg.getStatus($scope.repoName).then(function(status){
           if (status.length == 0){
               hg.getCurrentRevision($scope.repoName).then(function(result){
                   $scope.currentRevision = result;
                   promise();
               });
           } else {
               $scope.currentRevision = "";
               promise()
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
            hg.update(branchName, $scope.repoName).then(function(result){
                for (var i in $scope.branches){
                    $scope.branches[i].active = false;
                }

                $scope.branches.filter(function(branch){
                    return branch.name == branchName;
                })[0].active = true;
                $scope.updateCurrentRevision(function(){});
                $rootScope.reloadDataGrid();
                $scope.clearSelection();
            });
        }, function() {
            //TODO didn't confirm
        });

    }

    $scope.changeToRepo = function(changeset, ev){
        var confirm = $mdDialog.confirm()
            .title('Change to revision '+changeset)
            .textContent('Would you like to change to this revision and discard all changes')
            .targetEvent(ev)
            .ok('Ok')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function() {
            hg.update(changeset, $scope.repoName).then(function(result){
                $scope.updateCurrentRevision(function(){});
                $rootScope.reloadDataGrid();
                $scope.clearSelection();
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
            $scope.selectedFile = {};
        });
    }

    $scope.getFileChanges = function(file){
        $scope.selectedFile = file;
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

    $scope.commit = function(commitMsg, ev){
        if ($scope.getCheckedFiles().length > 0) {
            var confirm = $mdDialog.confirm()
                .title('Commit file(s)')
                .textContent('Would you like to commit file(s)')
                .targetEvent(ev)
                .ok('Commit')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function () {
                hg.commit($scope.repoName, $scope.getCheckedFiles(), commitMsg).then(function(){
                    window.location.reload();
                });
            }, function () {
                //TODO reject deleting a repo
            });
        }
    }

    $scope.getCheckedFiles = function(){
        var filenames = [];
        $('.fileList md-checkbox.md-checked').each(function(){
            filenames.push($(this).attr("data-filename"));
        });
        return filenames;
    }

    $scope.refreshRepo = function(){
        $scope.updateCurrentRevision(function(){
            $rootScope.reloadDataGrid();
            if ($scope.selectedChangeset == '' && $scope.currentRevision != ''){
                $scope.clearSelection();
            }
        });

    }

    $scope.clearSelection = function(){
        $scope.selectedChangeset = {};
        $scope.changedFiles = {};
        $scope.fileChanges = {};
        $scope.selectedFile= {};
    }

    $scope.undo = function(file, ev){

        var confirm = $mdDialog.confirm()
            .title('Revert file')
            .textContent('Would you like to revert this file? (It will be deleted if it is currently untracked)')
            .targetEvent(ev)
            .ok('Revert')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function () {
            hg.revertFile($scope.repoName, file.filename).then(function(){
                //Check to see if we have any remaining uncommited files, if we don't refresh the list, if not just remove this file from the list
                if ($scope.changedFiles.length > 1){
                    $scope.viewRevision($scope.selectedChangeset);
                } else {
                    $scope.refreshRepo();
                }
            });
        }, function () {
            //TODO reject deleting a repo
        });
    }

    $scope.pull = function(){
        hg.getIncoming($scope.repoName, $scope.repoUrl, undefined, undefined).then(function(result){
            $mdDialog.show({
                controller: "incomingChangesCtrl",
                templateUrl: '/repo/incomingChangesPopup',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                locals: {result : result}
            }).then(function(result){
                if (result){
                    hg.pull($scope.repoName, $scope.repoUrl, result.username, result.password).then(function(result){
                        $scope.refreshRepo();
                        $scope.clearSelection();
                    });
                }
            })
        });
    }

    //Render the initial page
    hg.getBranches($scope.repoName).then(function(result){
        $scope.branches = result;
    });
    hg.getTags($scope.repoName).then(function(result){
       $scope.tags = result;
    });

    function getSearchParamsFromString(str){
        var params = {};
        var couples = str.substr(1).split('&');
        for (var i in couples){
            var couple = couples[i].split("=");
            params[couple[0]] = couple[1];
        }
        return params;
    }
})
angular.module('BlankApp').controller("incomingChangesCtrl", function($scope, $http, $mdDialog, hg, libraryService, result){
    $scope.incomingChanges = result.changes.length > 0;
    $scope.gridOptions = {
        sort: {
            predicate: 'date',
            direction: 'asc'
        },
        data: $scope.incomingChanges ? result.changes : [{
            summary: "No incoming changes"
        }]
    };

    $scope.pull = function(){
        $mdDialog.hide({"username" : result.username, "password" : result.password});
    }
});


