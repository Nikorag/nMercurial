angular.module('BlankApp').service('nAuth', function($http, $q, $mdDialog, $cookies){

    var PASSWORD_SALT = "Im a wizard and THAT looks fucked up";

    this.showUsernameAndPassword = function(username, repoName){
        var deferred = $q.defer();
        getSavedCredential(repoName).then(function(auth){
            console.log(JSON.stringify(auth));
            deferred.resolve(auth);
        }, function(){
            $mdDialog.show({
                controller: "authPopupCtrl",
                templateUrl: '/auth?username='+username,
                parent: angular.element(document.body),
                clickOutsideToClose: true,
            }).then(function(result){
                if (result.remember){
                        saveCredentials(repoName, result);
                }
                deferred.resolve(result);
            });
        });
        return deferred.promise;
    }

    this.getUsernameFromUrl = function(url){
        var urlMatch = /^(https?\:\/\/)(.*)/g;
        var match = urlMatch.exec(url);
        return match[2].includes("@") ? match[2].split("@")[0] :"";
    }

    function saveCredentials(repoName, auth){
        var deferred = $q.defer();
        getSeed().then(function(seed){
            var authJson = JSON.stringify(auth);
            var authCookieName = repoName+"-creds";
            $cookies.put(authCookieName, CryptoJS.AES.encrypt(authJson, seed));
            console.log("Saving cookie: "+authCookieName+" with "+authJson);
            deferred.resolve();
        });
        return deferred.promise;
    }

    this.clearCredentials = function(repoName){
        var authCookieName = repoName+"-creds";
        $cookies.remove(authCookieName);
    }

    this.hasCredentials = function(repoName){
        var authCookieName = repoName+"-creds";
        var auth = $cookies.get(authCookieName);
        return auth != undefined;
    }

    this.getSavedCredential = getSavedCredential;

    function getSavedCredential(repoName){
        var deferred = $q.defer();
        getSeed().then(function(seed){
            var authCookieName = repoName+"-creds";
            var auth = $cookies.get(authCookieName);
            if (auth != undefined){
                var authJson = CryptoJS.AES.decrypt(auth, seed).toString(CryptoJS.enc.Utf8);
                console.log(authJson);
                var authObj = JSON.parse(authJson);
                deferred.resolve(authObj);
            } else {
                deferred.reject();
            }
        });
        return deferred.promise;
    }

    function getSeed(){
        var deferred = $q.defer();
        $http.get("/getSeed").then(function(result){
           deferred.resolve(result.data+PASSWORD_SALT);
        });
        return deferred.promise;
    }

    function pad(str) {
        var pad = Array(32).join("0");
        return (str + pad).substring(0, pad.length);
    }

});