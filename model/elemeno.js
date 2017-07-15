var debugx = require('debug')
var debug = debugx('site:models')
var auths = require('./auths')
var cache = require('memory-cache')
var http = require('request')

const FORGET_TIME = (10 * 60 * 1000) // ten minutes

function http_get(uri, cb) {
    debugx('site:network')('getting from ' + uri)
    http.get(uri, {
        headers: {
            'User-Agent': 'indigotock/website',
            'Authorization': auths.elemeno.apikey
        }
    }, function (error, response, body) {
        if (error) {
            cb(error, null);
        } else {
            cb(null, JSON.parse(body))
        }
    })
}

function post(body) {
    return {
        title: body.title,
        slug: body.slug,
        date: body.datePublished,
        content: body.content
    }
}

var posts = function (cb) {
    http_get('https://api.elemeno.io/v1/collections/posts/items', function (err, body) {
        cb(err, body.data.map(e => post(e)))
    })
}

let posts_time = 0

module.exports.posts = function (cb) {
    let timeRemaining = Date.now() - posts_time
    if (timeRemaining < FORGET_TIME) {
        debug('Reading posts from cache. Forget in ' + (FORGET_TIME - timeRemaining))
        cb(null, cache.get('posts'))
    } else
        posts(function (err, data) {
            posts_time = Date.now()
            debug('Saving posts to cache')
            cache.put('posts', data)
            cb(err, data)
        })
}

module.exports.specific_post = function (slug, cb) {
    let posts = module.exports.posts(function (err, data) {
        cb(null, data.filter(e => e.slug == slug))
    })
}