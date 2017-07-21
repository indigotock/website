import mongo = require('mongodb')
let client = mongo.MongoClient
import auths = require('./auths')
var debug = require('debug')('site:database')


let ret: mongo.Db
client.connect(auths.mongo.location)
    .then((d) => {
        debug('Connected to the database')
        ret = d
    }).catch(err => {
        debug('Error connecting to the database', err)
    })


export default {
    repositories: function () {
        return ret.collection('repositories')
    }
}