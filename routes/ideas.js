var express = require('express');
var router = express.Router();
var cms = require('./../cms');


/* GET users listing. */
router.get('/', function (req, res, next) {
  let c = cms.getCollection('ideas', function (e, r) {
    res.render('ideas', { title: 'Ideas', res: r });
  });
});

module.exports = router;
