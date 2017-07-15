var express = require('express');
var router = express.Router();
var cms = require('./../cms');
var debug = require('debug')('site:routes')
var gh = require('../model/github')


/* GET home page. */
router.get('/', function (req, res, next) {
    gh.my_repositories((error, data) => {
        res.render('index', {
            repos: data,
        });
    });
});

module.exports = router;