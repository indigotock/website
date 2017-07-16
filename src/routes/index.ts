var express = require('express');
var router = express.Router();
var debug = require('debug')('site:routes')
import gh = require('../model/github')


/* GET home page. */
router.get('/', function (req, res, next) {
    gh.apiStatus((statusres) => {
        gh.repositories((reposres) => {
            reposres.body = reposres.body.slice(0, 5)
            res.render('index', {
                repos: reposres.body,
                apistatus: statusres.body,
                apistatusgood: statusres.body === 'good',
                apistatusbad: statusres.body !== 'good'
            })
        })
    })
});

module.exports = router;