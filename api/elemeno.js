var express = require('express')
var router = express.Router()
var elemeno = require('../model/elemeno')

router.get('/posts', function (req, res) {
  elemeno.posts(function (error, data) {
    if (!error) {
      res.status(200).json(data);
    }
  });
});

router.get('/post/:slug([a-zA-Z0-9-]+)', function (req, res) {
  elemeno.specific_post(req.params.slug, function (error, data) {
    if (!error) {
      res.status(200).json(data);
    }
  });
});

console.log('Loaded elemeno api')

module.exports = router;