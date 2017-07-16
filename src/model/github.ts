import debugx = require('debug')
var debug = debugx('site:models')
import auths = require('./auths')
import cache = require('memory-cache')
import request = require('request')

const USERNAME = auths.github.username

const GITHUB_BASE = 'https://api.github.com/'

const FORGET_TIME = (10 * 60 * 1000) // ten minutes
let my_repos_time = 0,
    api_time = 0

interface GitHubRepo {
    id: number,
    name: string,
    site: string,
    description: string,
    lastUpdate: Date,
    imageUri?: string
}
function repositoryFromResponse(body): GitHubRepo {
    return {
        id: body.id,
        name: body.name,
        site: body.html_url,
        description: body.description,
        lastUpdate: new Date(body.pushed_at)
    }
}

type HttpRequestCallback<T> = (response: HttpRequestResponse<T>) => void
interface HttpRequestResponse<T> {
    error: Error,
    body: T,
}
class GitHubInterface {
    private async http_get(uri, cb: HttpRequestCallback<any>) {
        debugx('site:network')('getting from ' + uri)
        uri += '?access_token=' + auths.github.token
        request.get(uri, {
            headers: {
                'User-Agent': 'indigotock/website'
            }
        }, function(error, body) {
            let res: HttpRequestResponse<any> = {
                error: error ? error : null,
                body: JSON.parse(body.body)
            }
            cb(res)
        })
    }
    constructor(public readonly username: string) {

    }

    public repositories(cb: HttpRequestCallback<GitHubRepo[]>) {
        const that: GitHubInterface = this
        let timeRemaining = Date.now() - my_repos_time
        if (timeRemaining < FORGET_TIME) {
            debug('Reading my-repositories from cache. Forget in ' + (FORGET_TIME - timeRemaining))
            cb({
                error: null,
                body: cache.get('my-repositories')
            })
        } else {
            this.http_get(GITHUB_BASE + 'users/' + this.username + '/repos', function(res) {
                let ret: HttpRequestResponse<GitHubRepo>
                if (res.error) {
                    ret = {
                        error: res.error,
                        body: null
                    }
                } else {
                    let total = res.body.length
                    let done = 0
                    let newbodies = []
                    res.body.forEach((e) => {
                        let r = repositoryFromResponse(e)
                        that.repositoryFilePath(r.name, 'image.png', function(res) {
                            r.imageUri = res.body
                            newbodies.push(r)
                            done++
                            if (done == total) {

                                newbodies = newbodies.sort((a, b) => {
                                    let da = new Date(a.lastUpdate).valueOf()
                                    let db = new Date(b.lastUpdate).valueOf()
                                    return db - da
                                })
                                my_repos_time = Date.now()
                                cache.put('my-repositories', newbodies)
                                cb({
                                    error: null,
                                    body: newbodies
                                })
                            }
                        }, './project_image_fallback.png')
                    })
                }
            })
        }
    }

    public repositoryFilePath(repo: string, path: string, cb: HttpRequestCallback<string>, fallback?: string) {
        this.http_get(GITHUB_BASE + 'repos/' + this.username + '/' + repo + '/contents/' + path, function(res) {
            cb({
                error: res.error || null,
                body: res.body.download_url || fallback || ''
            })
        })
    }

    public apiStatus(cb: HttpRequestCallback<string>) {
        let timeRemaining = Date.now() - api_time
        if (timeRemaining < FORGET_TIME) {
            cb({
                error: null,
                body: cache.get('api-status')
            })
        } else {
            this.http_get('https://status.github.com/api/status.json', function(response) {
                api_time = Date.now()
                cache.put('api-status', response.body.status)
                cb({
                    error: response.error,
                    body: response.body.status || null
                })
            })
        }
    }
}

export = new GitHubInterface('indigotock')