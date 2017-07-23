var express = require('express');
var router = express.Router();
var debug = require('debug'),
    debugx = debug('site:webhooks')

let cms = require('../cms')

let hooks = {
    'single.item.publish': function (id, cb) {
        cms.updateItem(id, cb)
    },
    'single.item.unpublish': function (id, cb) {
        cms.setPublishState(id, false, cb)
    },
    'single.item.delete': function (id, cb) {
        cms.forgetItem(id, cb)
    },
    'collection.item.publish': function (id, cb) {
        cms.updateItem(id, cb)
    },
    'collection.item.unpublish': function (id, cb) {
        cms.setPublishState(id, false, cb)
    },
    'collection.item.delete': function (id, cb) {
        cms.forgetItem(id, cb)
    },
}

router.post('/', function (req, res, next) {
    let kind = req.body.event
    let id = req.body.id
    if (!kind || !id) {
        res.sendStatus(400)
        return
    }
    debugx('Received elemeno webhook ' + kind + ' for ' + id)

    if (hooks[kind]) {
        hooks[kind](id, function (err) {
            res.status(200).json({
                error: err,
                message: `Executed ${kind} on ${id}`
            })
        })
    }

});

module.exports = router;