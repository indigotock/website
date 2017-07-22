var express = require('express');
var router = express.Router();
var debug = require('debug')('site:routes')
/* GET home page. */
router.get('/', async function (req, res, next) {
    res.render('index', {
        repos: {},
    })
});


module.exports = router;