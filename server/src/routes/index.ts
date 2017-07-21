var express = require('express');
var router = express.Router();
var debug = require('debug')('site:routes')
import GHI, { GitHubRepo } from '../model/GitHubInterface'


/* GET home page. */
router.get('/', async function (req, res, next) {
    let repos = await GHI.getRepositories(5)
    res.render('index', {
        repos: repos,
    })
});


module.exports = router;