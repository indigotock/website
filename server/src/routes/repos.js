var express = require('express');
var router = express.Router();
var gh = require('../model/GitHubInterface')


router.get('/:slug([a-zA-Z0-9-]+)', function (req, res, next) {
    let repo = gh.GitHubRepo.fromName('indigotock', req.params.slug)
    repo.then(repo => {
        res.render('repo', repo)
    }).catch(err => {
        res.render('error', {
            message: 'Repository not found',
            status: '404',
            body: `<p>Whoops! Are you sure that's definitely a repository of mine? Have a look at <a href='https://github.com/indigotock?tab=repositories'>my GitHub</a> to see if it's listed there. If not, it may be private, or you might have just ended up here by accident.</p>`
        })
    })
});

module.exports = router;