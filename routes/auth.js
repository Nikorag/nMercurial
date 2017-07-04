var express = require('express');
var router = express.Router();

router.get('/auth', function(req, res, next) {
    var model = {
        username : req.param("username")
    }
    res.render('auth', model);
});

module.exports = router;