var express = require('express');
var router = express.Router();
var debug = require('debug')('site:routes')
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        projects: require('../projects'),
    })
});

module.exports = router;