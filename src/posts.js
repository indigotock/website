var _db = require('./db'),
    db = _db.database()

let exp = {}

exp.getPosts = function (callback) {
    db.find({
        collectionSlug: 'posts'
    }).sort({
        datePublished: 1
    }).exec(callback)
}

exp.getPostBySlug = function (slug, callback) {
    db.findOne({
        collectionSlug: 'posts',
        slug: slug
    }).exec(callback)
}


module.exports = exp