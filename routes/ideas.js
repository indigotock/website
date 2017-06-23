var express = require('express');
var router = express.Router();


var Elemeno = require('elemeno');

var elemeno = new Elemeno(require('../apikey'));
let cache
elemeno.getCollectionItems('ideas', function (err, response) {
  cache = response
  console.log(response.data[0])
});

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('ideas', { title: 'Ideas', res: cache });
});

module.exports = router;
