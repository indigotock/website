var _db = require('./db'),
    db = _db.database()

let exp = {}

exp.getProjects = function (callback) {
    db.find({
        collectionSlug: 'ideas'
    }).sort({
        'content.order.number': 1
    }).exec(callback)
}


module.exports = exp