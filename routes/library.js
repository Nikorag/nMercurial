var express = require('express');
var hgService = require('../services/hgService');
var router = express.Router();

/* Render the library page */
router.get('/', function(req, res, next) {
    var model = {
        title: "nMercurial hg App",
        subTitle: "RepoLibrary",
    }
    res.render('library', model);
});

/* Render the addRepoPopup */
router.get('/addRepoPopup', function(req, res, next){
    var model = {
        title: "Add Repo",
    }
    res.render('addRepo', model);
});

/* get the repo library */
router.get("/repoLibrary", function(req, res, next){
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(hgService.getRepos()));
})

router.get("/isRepo", function(req, res, next){
    hgService.getRepoPath(req.param('path')).then(function(result){
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result));
    });
});

router.get("/addRepo", function(req, res, next){
    var repo = {
        name: req.param("name"),
        path: req.param("path"),
        url: req.param("url")
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(hgService.saveRepo(repo)));
});

router.get("/removeRepo", function(req, res, next){
    var repoName = req.param("repoName");
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(hgService.removeRepo(repoName)));
});
module.exports = router;
