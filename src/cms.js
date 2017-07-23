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
    if (data.issingle)
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