var express = require('express');
var router = express.Router();
var cms = require('./../cms');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('post', {
        title: 'Posts',
        posts: cms.posts.data
    });
});
router.get('/:slug([a-zA-Z0-9-]+)', function (req, res, next) {
    console.log('Visiting posts route with id ' + req.params.slug)
    let post = cms.posts.data.filter(e =>
        e.slug == req.params.slug
    )
    res.render('post', {
        title: 'Posts',
        posts: post
    });
});

module.exports = router;