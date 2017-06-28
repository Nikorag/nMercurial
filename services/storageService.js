var storage = require('node-persist');

module.exports = {
    getRepos : getRepos,
    getRepo : getRepo,
    saveRepo : saveRepo,
    removeRepo : removeRepo
}

function getRepos() {
    storage.initSync();
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
    console.log(validateNewRepo(repo, repos));
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
        if (repo.url == newRepo.url || repo.path == newRepo.path || repo.name == newRepo.name){
            return false;
        }
    }
    return true;
}
