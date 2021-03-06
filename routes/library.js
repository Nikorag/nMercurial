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

/* Render the checkoutRepo */
router.get('/checkoutRepoPopup', function(req, res, next){
    var model = {
        title: "Checkout Repo",
    }
    res.render('checkoutRepo', model);
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

router.post("/cloneRepo", function(req, res, next){
    var url = req.body.url;
    var path = req.body.path;
    var username = req.body.username;
    var password = req.body.password;
    var name = req.body.name;
    hgService.clone(url, path, username, password).then(function(result){
        var repo = {
            "name" : name,
            "path": path,
            "url": url
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(hgService.saveRepo(repo)));
    }, function(){
        res.setHeader('Content-Type', 'application/json');
        res.send(false);
    });
});

module.exports = router;
