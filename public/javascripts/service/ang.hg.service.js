angular.module('BlankApp').service('hg', function($http, $q){

    this.getBranches = function(repoName){
        var deferred = $q.defer();
        $http.get("/repo/getBranches?repoName="+repoName).then(function(result){
            deferred.resolve(result.data);
        });
        return deferred.promise;
    };

    this.getTags = function(repoName){
        var deferred = $q.defer();
        $http.get("/repo/getTags?repoName="+repoName).then(function(result){
            deferred.resolve(result.data);
        });
        return deferred.promise;
    }

    this.getHistory = function(params, repoName){
        var deferred = $q.defer();
        $http.get("/repo/getHistory"+params+"&repoName="+repoName).then(function(result){
            deferred.resolve(result.data);
        });
        return deferred.promise;
    };

    this.getStatus = function(repoName){
        var deferred = $q.defer();
        $http.get("/repo/getStatus?repoName="+repoName).then(function(result){
            deferred.resolve(result.data);
        });
        return deferred.promise;
    }

    this.getCurrentRevision = function(repoName){
        var deferred = $q.defer();
        $http.get("/repo/getCurrentRevision?repoName="+repoName).then(function(result){
            deferred.resolve(result.data);
        });
        return deferred.promise;
    };

    this.changeBranch = function(branchName, repoName){
        var deferred = $q.defer();
        $http.get("/repo/changeBranch?repoName="+repoName+"&branchName="+branchName).then(function(result){
            if (result.data){
                deferred.resolve();
            } else {
                deferred.reject();
            }
        });
        return deferred.promise;
    }

    this.getModifiedFiles = function(changeSet, repoName){
        var deferred = $q.defer();
        $http.get("/repo/getModifiedFiles?repoName="+repoName+"&revision="+changeSet).then(function(result){
            deferred.resolve(result.data);
        });
        return deferred.promise;
    }

    this.getFileChanges = function(changeset, file, repoName){
        var deferred = $q.defer();
        if (file.mod == '?'){
            console.log(JSON.stringify(file));
            $http.get("/repo/fullPatch?repoName=" + repoName + "&filename=" + file.filename).then(function (result) {
                deferred.resolve(result.data[0]);
            });
        } else {
            $http.get("/repo/getChanges?repoName=" + repoName + "&revision=" + changeset + "&filename=" + file.filename).then(function (result) {
                deferred.resolve(result.data[0]);
            });
        }
        return deferred.promise;
    }

    this.isRepo = function(repoPath){
        var deferred = $q.defer();
        $http.get("/isRepo?path="+repoPath).then(function(result){
            deferred.resolve(result.data);
        });
        return deferred.promise;
    }

    this.cloneRepo = function(repo){
        var deferred = $q.defer();
        $http({
            method : "POST",
            url: "/cloneRepo",
            data: repo
        }).then(function(response){
           deferred.resolve();
        });
        return deferred.promise;
    }

    this.commit = function(repoName, filenames, commitMsg){
        var deferred = $q.defer();
        $http({
            method : "POST",
            url : "/repo/commit",
            data: {
                "repoName" : repoName,
                "filenames" : filenames,
                "commitMsg" : commitMsg
            }
        }).then(function(response){
            deferred.resolve();
        })
        return deferred.promise;
    }
});