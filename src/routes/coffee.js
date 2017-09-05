var express = require('express');
var router = express.Router();
var debug = require('debug')('site:routes')

let projects = require('../projects')

/* GET home page. */
router.get('/', function (req, res, next) {
    projects.getProjects(function (err, data) {
        if (err) {
            res.render('index', {
                projects: null
            })
        } else
            res.render('index', {
                projects: data
            })
    })
});

module.exports = router;
