var express = require('express');
var path = require('path');
var router = express.Router();
var debug = require('debug')('site:libraryMapper')

const BASE = path.join(__dirname, '../../node_modules/')

const LIBRARY_MAP = {
    'vue.js': path.join(BASE, 'vue/dist/vue.js'),
    'font-awesome.css': path.join(BASE, 'font-awesome/css/font-awesome.css')
}

/* GET home page. */
router.get('/lib/:name', function (req, res, next) {
    res.sendFile(LIBRARY_MAP[req.params.name] || null);
});
router.get('/fonts/:name', function (req, res, next) {
    if (req.params.name.indexOf('.svg') > -1) {
        res.contentType('image/svg+xml')
    }
    res.sendFile(path.join(BASE, 'font-awesome/fonts/', req.params.name));
});


module.exports = router;