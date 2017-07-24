var express = require('express');
var router = express.Router();
var debug = require('debug')('site:routes')

let posts = require('../posts')

router.get('/', function (req, res, next) {
    posts.getPosts(function (err, data) {
        if (err) {
            res.render('err', {
                posts: data,
                error: err
            })
        } else
            res.render('posts', {
                posts: data
            })
    })
});

router.get('/:slug([a-zA-Z0-9-_]+)', function (req, res, next) {
    posts.getPostBySlug(req.params.slug, function (err, data) {
        if (err) {
            next()
        } else
            res.render('post', data)
    })
});

module.exports = router;