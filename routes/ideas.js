var express = require('express');
var router = express.Router();
var cms = require('./../cms');


/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log(cms.ideas)
  res.render('ideas', { title: 'Ideas', res: cms.ideas });

});

module.exports = router;
