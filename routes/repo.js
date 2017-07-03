var express = require('express');
var hgService = require('../services/hgService');
var router = express.Router();

/* Render the repo page */
router.get('/repo', function(req, res, next) {
    var model = {
        title: "nMercurial hg App",
        subTitle: req.param("repoName"),
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
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(true));
    });
});

module.exports = router;