var hg = require("hg");
var storageService = require("./storageService");
var fs = require('fs');
var parse = require('parse-diff');
var path = require("path");
var patchService = require("./patchService");

HGRepo = hg.HGRepo;

module.exports = {
    getStatus : getStatus, //Get current file status
    getRepoPath : getRepoPath, //Get URL from repo
    getRepos : getRepos, //Get saved Repos
    getRepo : getRepo, //Get saved Repo by name
    saveRepo : saveRepo, //Save a repo
    removeRepo : removeRepo, //Remove a repo
    getBranches : getBranches, //Get branches of a repo
    getHistory : getHistory, //Get history of a repo
    changeBranch : changeBranch, //Change branch on a repo
    getCurrentRevision : getCurrentRevision, //Get repo's current revision
    getChanges : getChanges, //Get changes in a file and revision
    getModifiedFiles : getModifiedFiles, //Get modified files in a revision
    clone : clone, //Clone a repo
    getTags : getTags, //Get a list of tags for a repo
    fullPatch : fullPatch, //patch file for unversioned files
    commit : commit, //Commit
    revertFile : revertFile //Revert a file
}

function getStatus(repo, callback){
    var repo = new HGRepo(repo.path);
    var status = [];
    repo.status(function(err, output) {
        if (err) {
            throw err;
        }
        for (var i =0;i<output.length;i=i+2){
            if (output[i].channel="o" && output[i].length == 2) {
                var fileStatus = {
                    path : output[i+1].body
                }
                switch (output[i].body){
                    case "M ":
                        fileStatus.status = "Modified";
                        break;
                    case "? ":
                        fileStatus.status = "Added";
                }
                status.push(fileStatus);
            }
        }
        callback(status);
    });
}

function getRepoPath(path){
    return new Promise(function(resolve, reject){
        //Check if the directory exists
        if (fs.existsSync(path)) {
            var repo = new HGRepo(path);
            //Check the repos path
            repo.runCommand("path", "default", function(pathErr, pathOutput){
                if (pathErr){
                    reject();
                } else {
                    resolve(pathOutput[0].body);
                }
            });
        } else {
            reject();
        }
    });
}

function getRepos(){
    return storageService.getRepos();
}

function getRepo(repoName){
    return storageService.getRepo(repoName);
}

function saveRepo(repo){
    return storageService.saveRepo(repo);
}

function removeRepo(repoName){
    return storageService.removeRepo(repoName);
}

function getBranches(repo, promise){
    var repo = new HGRepo(repo.path);
    repo.runCommand("identify", "-b", function(err, output){
        getBranchesPromise(repo, output[0].body.trim(), promise);
    });
}

function getBranchesPromise(repo, currentBranch, promise){
    var branches = [];
    var repo = new HGRepo(repo.path);
    repo.runCommand("branches", [], function(err, output){
        if (err){
            promise(false);
        } else {
            for (var i in output){
                if (output[i].body && output[i].body.trim() && !output[i].body.trim().match("^[0-9]*\\:[0-9a-zA-Z]{12}$") && !output[i].body.trim().match("(inactive)")) {
                    var next = parseInt(i)+1;
                    var branch = {
                        name : output[i].body.trim(),
                        revNo: output[next].body.trim().split(":")[0],
                        revName: output[next].body.trim().split(":")[1],
                        active: output[i].body.trim() == currentBranch
                    }
                    branches.push(branch);
                }
            }
            promise(branches);
        }
    });
}

function getCurrentRevision(repo, promise){
    var repo = new HGRepo(repo.path);
    repo.runCommand("id", "-i", function(err, output){
        promise(output[0].body.trim());
    });
}

function getHistory(repo, page, sort, itemsPerPage, promise){
    var history = {
        data: [],
        count: 0
    };
    var repo = new HGRepo(repo.path);
    repo.runCommand("log", "", function(err, output){
        history.count = output.length;
        for (var i in output){
            if (output[i].body) {
                var historyItem = {};
                var change = output[i].body.split('\n');

                for (var x in change) {
                    if (change[x].split(":")[1]) {
                        historyItem[change[x].split(":")[0]] = change[x].split(":")[1].trim();
                        if (change[x].split(":")[2] && change[x].split(":")[0] == 'changeset'){
                            historyItem.revision = change[x].split(":")[2].trim();
                        }
                    }else {
                        historyItem[change[x].split(":")[0]] = "";
                    }
                }
                history.data.push(historyItem);
            }
        }
        history.data = history.data.slice(getPageStart(itemsPerPage, page), getPageEnd(itemsPerPage,page, history.count));
        promise(history);
    });
}

function changeBranch(repo, branchName, promise){
    var repo = new HGRepo(repo.path);
    repo.runCommand("update", ["--clean", "\""+branchName+"\""], function(err, output){
        console.log(err);
        if (err){
            console.log(err);
            promise(false);
        } else {
            promise(true);
        }
    });
}

function getPageStart(itemsPerPage, pageNo){
    var pageStart = (parseInt(pageNo) - 1) * parseInt(itemsPerPage);
    return pageStart;
}

function getPageEnd(itemsPerPage, pageNo, total){
    var pageEnd = parseInt(pageNo) * parseInt(itemsPerPage);
    var pageEnd = pageEnd < total ? pageEnd : total;
    return pageEnd;
}

function getModifiedFiles(repo, revision, promise){
    var repo = new HGRepo(repo.path);
    var modifiedFiles = [];
    repo.runCommand("status", ["--change", revision], function(err, output) {
        if (err){
            console.log(err);
            promise([]);
        } else {
            for (var i in output){
                if (output[i].body) {
                    if (i % 2 == 0) {
                        var modifiedFile = {
                            mod: output[i].body.trim(),
                            filename: output[parseInt(i)+1].body.trim()
                        };
                        modifiedFiles.push(modifiedFile);
                    }
                }
            }
            promise(modifiedFiles);
        }
    });
}

function getChanges(repo, revision, filename, promise){
    var repo = new HGRepo(repo.path);
    repo.runCommand("diff", ["-c", revision, filename], function(err, output) {
        if (err) {
            console.log(err);
            promise({});
        } else {
            var diff = "";
            for (var i in output) {
                diff += output[i].body;
            }
            var files = parse(diff);
            promise(files);
        }
    });
}

function clone(url, dest, username, password){
    return new Promise(function(resolve, reject){
        var destPath = path.resolve(dest);
        var urlMatch = /^(https?\:\/\/)(.*)/g;
        var match = urlMatch.exec(url);
        var fullUrl = `${match[1]}${username}:${password}@${match[2]}`;
        new HGRepo().runCommand("clone", [fullUrl, destPath], function(err, output){
            if (err){
                reject(err);
                throw err;
            }
            resolve(destPath);
        });
    });
}

function getTags(repo, promise){
    var tags = [];
    var repo = new HGRepo(repo.path);
    repo.runCommand("tags", [], function(err, output){
        if (err){
            console.log(err);
            throw err;
        }
        for (var i in output){
            if (i % 2 == 0 && output[i].body && output[i].body.trim() != ''){
                var next = parseInt(i)+1;
                if (output[next].body.includes(":")) {
                    var tag = {
                        name: output[i].body.trim(),
                        changeset: output[next].body.split(":")[0].trim(),
                        revision: output[next].body.split(":")[1].trim()
                    }
                }
                tags.push(tag);
            }
        }
        promise(tags);
    })
}

function fullPatch(repo, filename, promise){
    var filePath = path.join(repo.path, filename);
    patchService.createPatch(filePath, function(result){
        promise(result);
    });
}

function commit(repo, filenames, commitMsg, promise){
    //Check for unversioned files
    var repo = new HGRepo(repo.path);
    var filesToAdd = [];
    var filesToRemove = [];
    repo.runCommand("status", filenames, function(err, output){
        for (var i in output){
            var next = parseInt(i)+1;
            if (output[i].body == '? '){
                filesToAdd.push(output[next].body.trim());
            } else if (output[i].body == "! "){
                filesToRemove.push(output[next].body.trim());
            }
        }
        repo.runCommand("add", filesToAdd, function(err, output){
            repo.runCommand("remove", filesToRemove, function(err, output){
                var commitOpts = {
                    "-m": commitMsg
                };
                repo.commit(filenames, commitOpts, function(err, output){
                    if (err){
                        console.log(err);
                    }
                    promise();
                });
            });

        });
    });
}

function revertFile(repo, filename, promise){
    var fileStatus = ""
    var repo = new HGRepo(repo.path);
    repo.runCommand("status", [filename], function(err, output){
        for (var i in output){
            var next = parseInt(i)+1;
            if (output[i].body == '? '){
                fileStatus = "doNothing";
            } else if (output[i].body == "A "){
                fileStatus = "forget";
            } else if (output[i].body == "M " || output[i].body == "! "){
                fileStatus = "revert";
            }
        }
        if (fileStatus == "forget") {
            //Forget the file
            repo.runCommand("forget", [filename], function (err, output) {
                promise();
            });
        } else if (fileStatus == "revert"){
            //Revert the file
            repo.runCommand("revert", [filename, "--no-backup"], function (err, output) {
                promise();
            });
        } else if (fileStatus == "doNothing") {
            //Delete the file
            fs.unlink(path.join(repo.path, filename), function(){
               promise();
            });
        }
    })
}