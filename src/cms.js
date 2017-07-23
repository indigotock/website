var _elemeno = require('elemeno')
var _db = require('./db'),
    db = _db.database()

var debug = require('debug'),
    debugx = debug('site:cms')

if (!process.env.ELEMENO_KEY) {
    throw new Error('No environment variable \'ELEMENO_KEY\'. Is the .env file setup correctly?')
}

let Elemeno = new _elemeno(process.env.ELEMENO_KEY)

function storeItem(data) {
    let shorthand = ''
    if (data.isSingle)
        shorthand = 'singles/' + data.slug
    else {
        shorthand = data.collectionSlug + '/' + data.slug
    }
    db.update({
        id: data.id
    }, data, {
        upsert: true
    }, function (err) {
        if (err)
            throw new Error(err)
        debugx('Stored item ' + data.id + `(${shorthand})`)
    })
}


let exp = {}
exp.updateItem = function (id, cb) {
    db.findOne({
        id: id
    }, function (err, data) {
        if (!data) {
            debugx('Attempted to update non-found item ' + id)
            cb('Attempted to update non-found item ' + id)
            exp.initialise()
            return
        }
        if (err)
            throw new Error(err)
        if (data.isSingle) {
            Elemeno.getSingle(data.slug, function (err, data) {
                if (err)
                    throw new Error(err)
                data.data.isSingle = true
                storeItem(data.data)
                cb(err)
            })
        } else {
            Elemeno.getCollectionItem(data.collectionSlug, data.slug, function (err, data2) {
                if (err)
                    throw new Error(err)
                data2.data.isSingle = false
                data2.data.collectionSlug = data.collectionSlug
                storeItem(data2.data)
                cb(err)
            })
        }
        debugx('Updated item ' + id)
    })
}

exp.forgetItem = function (id, cb) {
    db.remove({
        id: id
    }, function (err) {
        if (err)
            throw new Error(err)
        debugx(`Deleted item ${id} from storage`)
        if (cb)
            cb(err)
    })
}
exp.setPublishState = function (id, published, cb) {
    db.update({
        id: id
    }, {
        published: published
    }, function (err) {
        if (err)
            throw new Error(err)
        debugx(`Set publish state for ${id} to ${published}`)
        if (cb)
            cb(err)
    })
}

exp.initialise = function () {
    Elemeno.getCollections(null, function (err, data) {
        if (err)
            throw new Error(err)
        data.data.forEach(function (collection) {
            Elemeno.getCollectionItems(collection.slug, null, function (err2, data2) {
                if (err2)
                    throw new Error(err2)
                data2.data.forEach(function (item) {
                    item.collectionSlug = collection.slug
                    item.isSingle = false
                    storeItem(item)
                })
            })
        }, this);
    })
    Elemeno.getSingles(null, function (err, data) {
        if (err)
            throw new Error(err)
        data.data.forEach(function (single) {
            let item = data.data
            item.isSingle = true
            storeItem(item)
        })
    })
}


module.exports = exp