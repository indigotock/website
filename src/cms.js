var elemeno = require('elemeno')
var _db = require('./db'),
    db = _db.database()

if (!process.env.ELEMENO_KEY) {
    throw new Error('No environment variable \'ELEMENO_KEY\'. Is the .env file setup correctly?')
}

let Elemeno = new elemeno(process.env.ELEMENO_KEY)

let exp = {}

exp.initialise = function () {

}

module.exports = exp