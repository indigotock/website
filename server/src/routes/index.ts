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
    })
});


router.get('/repo/:name', function (req, res, next) {
    let r = GitHubRepo.fromName('indigotock', req.params.name).then(repo => {
        res.json(repo)
    }).catch(err => {
        res.json(err)
    })
})



module.exports = router;