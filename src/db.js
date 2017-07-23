var nedb = require('nedb'),
    db = new nedb('datastore.db')

var debug = require('debug'),
    debugx = debug('site:database')

let exp = {}

exp.initialise = function () {
    db.loadDatabase(function (err) {
        if (err)
            debugx('Error loading database: ' + err)
        else
            debugx('Succesfully loaded database')
    })
}

exp.database = function () {
    return db
}

module.exports = exp