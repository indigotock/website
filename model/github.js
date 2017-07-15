var debugx = require('debug')
var debug = debugx('site:models')
var auths = require('./auths')
var cache = require('memory-cache')
var http = require('request')

const USERNAME = auths.github.username

const GITHUB_BASE = 'https://api.github.com/'

const FORGET_TIME = (10 * 60 * 1000) // ten minutes

function http_get(uri, cb) {
    uri += '?access_token=' + auths.github.token
    debugx('site:network')('getting from ' + uri)
    http.get(uri, {
        headers: {
            'User-Agent': 'indigotock/website'
        }
    }, function (error, response, body) {
        if (error) {
            cb(error, null);
        } else {
            cb(null, JSON.parse(body))
        }
    })
}

function repo(body, cb) {
    return {
        id: body.id,
        name: body.name,
        site: body.html_url,
        description: body.description,
        lastUpdate: body.pushed_at
    }
}

module.exports.repository_image = function (user, name, cb) {
    http_get(GITHUB_BASE + 'repos/' + user + '/' + name + '/contents/image.png', function (err, data) {
        if (data.name) {
            cb(data.download_url)
        } else {
            cb('./project_image_fallback.png')
        }
    })
}

var repositories = function (user, cb) {
    http_get(GITHUB_BASE + 'users/' + user + '/repos', function (err, body) {
        let total = body.length
        let done = 0
        let newbodies = []
        body.forEach(rep => {
            module.exports.repository_image(USERNAME, rep.name, function (response) {
                done++
                let newitem = repo(rep)
                newitem.imageUri = response
                newbodies.push(newitem)
                if (done == total) {
                    cb(err, newbodies)
                }
            })
        })
    })
}

let my_repos_time = 0

module.exports.my_repositories = function (cb) {
    let timeRemaining = Date.now() - my_repos_time
    if (timeRemaining < FORGET_TIME) {
        debug('Reading my-repositories from cache. Forget in ' + (FORGET_TIME - timeRemaining))
        cb(null, cache.get('my-repositories'))
    } else
        repositories(USERNAME, function (err, data) {
            data = data.sort((a, b) => {
                let da = new Date(a.lastUpdate)
                let db = new Date(b.lastUpdate)
                return db - da
            })
            my_repos_time = Date.now()
            debug('Saving my-repositories to cache')
            cache.put('my-repositories', data)
            cb(err, data)
        })
}