angular.module('BlankApp').service('hg', function($http, $q, $mdDialog, nAuth){

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
            console.log(JSON.stringify(result.data));
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

    this.update = function(changeset, repoName){
        var deferred = $q.defer();
        showSpinner();
        $http.get("/repo/update?repoName="+repoName+"&changeset="+changeset).then(function(result){
            if (result.data){
                hideSpinner();
                deferred.resolve();
            } else {
                hideSpinner();
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
        showSpinner();
        $http({
            method : "POST",
            url: "/cloneRepo",
            data: repo
        }).then(function(response){
            hideSpinner();
           deferred.resolve();
        });
        return deferred.promise;
    }

    this.commit = function(repoName, filenames, commitMsg){
        var deferred = $q.defer();
        showSpinner();
        $http({
            method : "POST",
            url : "/repo/commit",
            data: {
                "repoName" : repoName,
                "filenames" : filenames,
                "commitMsg" : commitMsg
            }
        }).then(function(response){
            hideSpinner();
            deferred.resolve();
        })
        return deferred.promise;
    }

    this.revertFile = function(repoName, filename){
        var deferred = $q.defer();
        showSpinner();
        $http({
            method : "GET",
            url: "/repo/revertFile?repoName="+repoName+"&filename="+encodeURI(filename)
        }).then(function(response){
           hideSpinner();
           deferred.resolve();
        });
        return deferred.promise;
    }


    this.getIncoming = getIncoming;

    function getIncoming(repoName, repoUrl, username, password, saved){
        var deferred = $q.defer();
        showSpinner();
        $http({
            method : "POST",
            url: "/repo/incoming",
            data: {
                "repoName" : repoName,
                "username" : username,
                "password" : password
            }
        }).then(function(response){
            if ((response.data != false && response.data != "false") || response.data == ''){
                hideSpinner();
                deferred.resolve({"username" : username, "password" : password, "changes" : response.data});
            } else {
                //Show username & password dialog
                hideSpinner();
                if (saved) {
                    //If the creds are saved but don't work, delete them
                    nAuth.clearCredentials(repoName);
                }
                nAuth.showUsernameAndPassword(nAuth.getUsernameFromUrl(repoUrl), repoName).then(function (auth) {
                    getIncoming(repoName, repoUrl, auth.username, auth.password, auth.remember).then(function (result) {
                        deferred.resolve(result);
                    });
                });

            }
        });
        return deferred.promise;
    }

    this.getOutgoing = getOutgoing;

    function getOutgoing(repoName, repoUrl, username, password, saved){
        var deferred = $q.defer();
        showSpinner();
        $http({
            method : "POST",
            url: "/repo/outgoing",
            data: {
                "repoName" : repoName,
                "username" : username,
                "password" : password
            }
        }).then(function(response){
            if ((response.data != false && response.data != "false") || response.data == ''){
                hideSpinner();
                deferred.resolve({"username" : username, "password" : password, "changes" : response.data});
            } else {
                //Show username & password dialog
                hideSpinner();
                if (saved) {
                    //If the creds are saved but don't work, delete them
                    nAuth.clearCredentials(repoName);
                    auth.remember = false;
                }
                nAuth.showUsernameAndPassword(nAuth.getUsernameFromUrl(repoUrl), repoName).then(function (auth) {
                    getOutgoing(repoName, repoUrl, auth.username, auth.password, auth.remember).then(function (result) {
                        deferred.resolve(result);
                    });
                });
            }
        });
        return deferred.promise;
    }

    this.pull = function(repoName, repoUrl, username, password){
        var deferred = $q.defer();
        showSpinner();
        $http({
            method: "POST",
            url: "/repo/pull",
            data: {
                "repoName": repoName,
                "username": username,
                "password": password
            }
        }).then(function(result){
            hideSpinner();
            deferred.resolve();
        });
        return deferred.promise;
    }

    this.push = function(repoName, repoUrl, username, password){
        var deferred = $q.defer();
        showSpinner();
        $http({
            method: "POST",
            url: "/repo/push",
            data: {
                "repoName": repoName,
                "username": username,
                "password": password
            }
        }).then(function(result){
            hideSpinner();
            deferred.resolve();
        });
        return deferred.promise;
    }

    function showSpinner(){
        $('.spinnerContainer').show();
    }

    function hideSpinner(){
        $('.spinnerContainer').hide();
    }
});