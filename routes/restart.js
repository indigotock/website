var express = require('express');
var router = express.Router();


/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.query.pass && req.query.pass == require('../restartCode')) {
    res.write('Confirmed', (e) => {
      res.end();
    })
  } else {
    res.sendStatus(403)
  }
});

module.exports = router;
