var express = require('express');
var router = express.Router();
var debug = require('debug')('site:routes')
var gh = require('../model/github')


/* GET home page. */
router.get('/', function (req, res, next) {
    gh.api_status((e, status) => {
        gh.my_repositories((error, data) => {
            data = data.slice(0, 5)
            res.render('index', {
                repos: data,
                apistatus: status,
                apistatusgood: status === 'good',
                apistatusbad: status !== 'good'
            })
        })
    })
});

module.exports = router;