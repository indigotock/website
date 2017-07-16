var express = require('express')
var router = express.Router()
import gh = require('../model/github')

router.get('/repos', function(req, res) {
    gh.repositories((response) => {
        res.status(200).json(response.body);
    });
});

console.log('Loaded github api')

module.exports = router;