var storage = require('node-persist');

storage.initSync();

module.exports = {
    getRepos : getRepos,
    getRepo : getRepo,
    saveRepo : saveRepo,
    removeRepo : removeRepo
}

function getRepos() {
    var repos = storage.getItemSync("repos");
    if (repos !== undefined){
        return repos;
    } else {
        storage.setItemSync("repos", []);
        return [];
    }
}

function getRepo(repoName){
    return getRepos().filter(function(repo){
        return repo.name == repoName;
    })[0];
}

function saveRepo(repo){
    repos = getRepos();
    if (validateNewRepo(repo, repos)) {
        repos.push(repo);
        storage.setItemSync("repos", repos);
        return true;
    }
    return false;
}

function removeRepo(repoName){
    var index = false;
    repos = getRepos();
    repos = repos.filter(function(repo){
        return repo.name !== repoName;
    })
    storage.setItemSync("repos", repos);
    return true;
}

function validateNewRepo(newRepo, repos){
    for (var i in repos){
        var repo = repos[i];
        if (repo.path == newRepo.path || repo.name == newRepo.name){
            return false;
        }
    }
    return true;
}
