var express = require('express');
var router = express.Router();
var cms = require('./../cms');

var app = require('../app');



/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: null,
        res: cms.ideas
    });
});

module.exports = router;