angular.module('BlankApp').service('hg', function($http, $q){

    this.getBranches = function(repoName){
        var deferred = $q.defer();
        $http.get("/repo/getBranches?repoName="+repoName).then(function(result){
            deferred.resolve(result.data);
        });
        return deferred.promise;
    };

    this.getHistory = function(params, repoName){
        var deferred = $q.defer();
        $http.get("/repo/getHistory"+params+"&repoName="+repoName).then(function(result){
            deferred.resolve(result.data);
        });
        return deferred.promise;
    };

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

    this.getFileChanges = function(changeset, filename, repoName){
        var deferred = $q.defer();
        $http.get("/repo/getChanges?repoName="+repoName+"&revision="+changeset+"&filename="+filename).then(function(result){
            deferred.resolve(result.data[0]);
        });
        return deferred.promise;
    }

    this.isRepo = function(repoPath){
        var deferred = $q.defer();
        $http.get("/isRepo?path="+repoPath).then(function(result){
            deferred.resolve(result.data);
        });
        return deferred.promise;
    }
});