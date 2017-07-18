var express = require('express')
var router = express.Router()
import { GitHubRepo, getRepositoriesForUser } from '../model/GitHubInterface'

router.get('/repos', function (req, res) {
    getRepositoriesForUser('indigotock').then((response) => {
        res.status(200).json(response);
    });
});

console.log('Loaded github api')

module.exports = router;