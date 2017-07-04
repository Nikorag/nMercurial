var express = require('express');
var hgService = require('../services/hgService');
var router = express.Router();

/* Render the repo page */
router.get('/repo', function(req, res, next) {
    var repo = hgService.getRepo(req.param("repoName"));
    var model = {
        title: "nMercurial hg App",
        subTitle: repo.name,
        repoUrl: repo.url
    }
    res.render('repo', model);
});

router.get('/repo/getBranches', function(req, res, next) {
    var repo = hgService.getRepo(req.param("repoName"));
    hgService.getBranches(repo, function (response) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
    });
});

router.get('/repo/getCurrentRevision', function(req, res, next) {
    var repo = hgService.getRepo(req.param("repoName"));
    hgService.getCurrentRevision(repo, function (response) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
    });
});

router.get('/repo/getHistory', function(req, res, next) {
    var repo = hgService.getRepo(req.param("repoName"));
    var page = req.param("page");
    var sort = req.param("sort");
    var itemsPerPage = req.param("itemsPerPage");
    if (itemsPerPage === undefined){
        itemsPerPage = 10;
    }
    hgService.getHistory(repo, page, sort, itemsPerPage, function (response) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
    });
});

router.get('/repo/changeBranch', function(req, res, next){
    var repo = hgService.getRepo(req.param("repoName"));
    var branchName  = req.param("branchName");
    hgService.changeBranch(repo, branchName, function (response) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
    });
});

router.get('/repo/getChanges', function(req, res, next) {
    var repo = hgService.getRepo(req.param("repoName"));
    var revision = req.param("revision");
    var filename = req.param("filename");
    hgService.getChanges(repo, revision, filename, function (response) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
    });
});

router.get('/repo/getModifiedFiles', function(req, res, next) {
    var repo = hgService.getRepo(req.param("repoName"));
    var revision = req.param("revision");
    hgService.getModifiedFiles(repo, revision, function (response) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
    });
});

router.get('/repo/getTags', function(req, res, next){
    var repo = hgService.getRepo(req.param("repoName"));
    hgService.getTags(repo, function(response){
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
    });
});

router.get('/repo/getStatus', function(req, res, next){
    var repo = hgService.getRepo(req.param("repoName"));
    hgService.getStatus(repo, function(response){
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
    });
});

router.get('/repo/fullPatch', function(req, res, next){
    var repo = hgService.getRepo(req.param("repoName"));
    var filename = req.param("filename");
    hgService.fullPatch(repo, filename, function (response) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
    });
});

router.post('/repo/commit', function(req, res, next){
    var repo = hgService.getRepo(req.param("repoName"));
    var filenames = req.param("filenames");
    var commitMsg = req.param("commitMsg");
    hgService.commit(repo, filenames, commitMsg, function(){
        try {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(true));
        } catch (e){
            console.log(e);
        }
    });
});

router.get("/repo/revertFile", function(req, res, next){
    var repo = hgService.getRepo(req.param("repoName"));
    var filename = req.param("filename");
    hgService.revertFile(repo, filename, function(){
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(true));
    });
});

//Get incoming without credentials
router.post("/repo/incoming", function(req, res, next){
    var repo = hgService.getRepo(req.param("repoName"));
    var username = req.param("username");
    var password = req.param("password");
    hgService.incoming(repo, username, password, function(result){
        try {
            res.send(JSON.stringify(result));
        } catch (e) {

        }
    });
});

router.post("/repo/pull", function(req, res, next){
    var repo = hgService.getRepo(req.param("repoName"));
    var username = req.param("username");
    var password = req.param("password");
    hgService.pull(repo, username, password, function(result){
        try {
            res.send(JSON.stringify(result));
        } catch (e) {

        }
    });
});

router.get("/repo/incomingChangesPopup", function(req, res, next){
    res.render('incomingChanges');
});

module.exports = router;