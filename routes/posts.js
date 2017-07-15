var express = require('express');
var router = express.Router();
var elemeno = require('../model/elemeno')


/* GET home page. */
router.get('/', function (req, res, next) {
    elemeno.posts(function (error, data) {
        res.render('post', {
            title: 'Posts',
            posts: data
        });
    })
});
router.get('/:slug([a-zA-Z0-9-]+)', function (req, res, next) {
    elemeno.specific_post(req.params.slug, function (error, data) {
        res.render('post', {
            title: 'Posts',
            posts: data
        });
    })
});

module.exports = router;