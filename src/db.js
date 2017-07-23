var nedb = require('nedb'),
    db = new nedb({
        filename: __dirname + '/../datastore.db',
        autoload: true
    })

var debug = require('debug'),
    debugx = debug('site:database')

let exp = {}

exp.initialise = function () {
    db.ensureIndex(({
        fieldName: 'id',
        unique: true
    }, function (err) {
        if (err) {
            throw new Error('Unable to ensure index id ' + err)
        }
    }))
}

exp.database = function () {
    return db
}

module.exports = exp