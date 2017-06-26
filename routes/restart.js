var express = require('express');
var router = express.Router();
var path = require('path');


router.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'restart.html'))
})

router.post('/', function (req, res, next) {
  if (req.body.pass && req.body.pass == require('../restartCode')) {
    res.write('Confirmed', (e) => {
      res.end();
    })
  } else {
    res.sendStatus(403)
  }
});

module.exports = router;
