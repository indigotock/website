var express = require('express')
var router = express.Router()
var gh = require('../model/github')

router.get('/repos', function (req, res) {
  gh.my_repositories(function (error, data) {
    if (!error) {
      console.log('DEBUG')
      res.status(200).json(data);
    }
  });
});

console.log('Loaded github api')

module.exports = router;