angular.module('BlankApp').service('libraryService', function($http, $q) {
    this.getSavedRepos = function () {
        var deferred = $q.defer();
        $http.get("/repoLibrary").then(function (result) {
            deferred.resolve(result.data);
        });
        return deferred.promise;
    }

    this.deleteRepo = function(repoName){
        var deferred = $q.defer();
        $http.get("/removeRepo?repoName="+repoName).then(function(result) {
            if (result.data == true) {
                deferred.resolve();
            } else {
                deferred.reject();
            }
        });
        return deferred.promise;
    }

    this.addRepo = function(repo){
        var deferred = $q.defer();
        $http({
            url: "/addRepo",
            method: "GET",
            params: repo
        }).then(function(result){
            if (result.data == true){
                deferred.resolve();
            } else {
                deferred.reject();
            }
        })
        return deferred.promise;
    }
});