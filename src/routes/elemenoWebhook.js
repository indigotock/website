var express = require('express');
var router = express.Router();
var debug = require('debug')('site:routes')

let cms = require('../cms')

/* GET home page. */
router.get('/', function (req, res, next) {
    res.end()
});

module.exports = router;