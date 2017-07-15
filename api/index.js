var express = require('express')
var router = express.Router()


router.use('/elemeno', require('./elemeno'))
router.use('/github', require('./github'))

module.exports = router