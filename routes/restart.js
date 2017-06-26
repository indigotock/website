var express = require('express');
var router = express.Router();
var path = require('path');
var process = require('process');

router.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'restart.html'))
})



router.post('/', function (req, res, next) {
  if (req.body.pass && req.body.pass == require('../restartCode')) {
    res.write('Confirmed', (e) => {
      console.log(require('child_process'))
      res.end();
      require('child_process').exec(`pkill ${process.pid}`, function (e, o, se) {
        console.log('Attempted reboot', e, o, se)
      });
    })
  } else {
    res.sendStatus(403)
  }
});

module.exports = router;
