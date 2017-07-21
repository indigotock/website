var express = require('express')
var router = express.Router()
import GHI, { GitHubRepo } from '../model/GitHubInterface'

import gh = require('github')

let github = new gh({
    protocol: 'https',
    headers: {
        'User-Agent': 'indigotock/website'
    },
})


router.get('/repos', function (req: any, res: any) {
    GHI.getRepositories().then((response) => {
        res.status(200).json(response);
    });
});

router.get('/repo/:slug([a-zA-Z0-9-_]+)', function (req: any, res: any) {
    GHI.specificRepository(req.params.slug).then((response) => {
        res.status(200).json(response);
    });
});

console.log('Loaded github api')

module.exports = router;