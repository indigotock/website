var express = require('express');
var router = express.Router();
var path = require('path');

router.post('/', function (req, res, next) {
  console.log(req.body);
});

module.exports = router;