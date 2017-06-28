var express = require('express');
var router = express.Router();
var path = require('path');
var cms = require('../cms');

router.post('/', function (req, res, next) {
  cms.clearCache();
  res.sendStatus(200);
});

module.exports = router;