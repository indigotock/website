var express = require('express');
var router = express.Router();
var debug = require('debug')('site:routes')
import { GitHubRepo, getRepositoriesForUser } from '../model/GitHubInterface'


/* GET home page. */
router.get('/', function (req, res, next) {
    getRepositoriesForUser('indigotock').then((reposres) => {
        reposres = reposres.slice(0, 5)
        res.render('index', {
            repos: reposres,
        })
    }).catch(err => {

        res.render('index', {
            repos: [],
        })
    })
});


module.exports = router;