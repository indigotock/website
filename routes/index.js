var express = require('express');
var router = express.Router();
var cms = require('./../cms');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Home',
        res: cms.ideas
    });
});

module.exports = router;