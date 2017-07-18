import debug = require('debug')
let debugx = debug('site:github-i')
import request = require('request-promise')
import auths = require('./auths')
var b64 = require('js-base64').Base64
import md = require('meta-marked')
import { HttpRequestCallback, HttpRequestResponse } from '../util/HttpRequest'
const GITHUB_BASE = 'https://api.github.com/'

import cache = require('memory-cache')

export interface GitHubFile {
    readonly url: string
    readonly size: number
}

export async function getRepositoriesForUser(user: string): Promise<GitHubRepo[]> {
    let incache = cache.get(`repolist-${user}`)
    if (incache) {
        debug('Reading ' + `repolist-${user}` + ' from cache. Forget in ' + incache)
        let promises = incache.map(e => GitHubRepo.fromName(user, e))
        let res = await Promise.all<GitHubRepo>(promises)
        return res
    }
    try {
        let array = await http_get(GITHUB_BASE + 'users/' + user + '/repos')
        array.sort((a, b) => {
            let da = new Date(a.pushed_at).valueOf()
            let db = new Date(b.pushed_at).valueOf()
            return db - da
        })
        array = array.map(e => e.name)
        cache.put(`repolist-${user}`, array, getNewForgetTime())
        let promises = array.map(e => GitHubRepo.fromName(user, e))
        let res = await Promise.all<GitHubRepo>(promises)
        return res
    } catch (err) {
        return []
    }
}

function getNewForgetTime() {
    return (10 * 60 * 1000) // Ten minutes time
}


export class GitHubRepo {
    public readonly birthTime: number;
    id: number
    site: string
    description: string
    lastUpdate: Date
    imageUri: string
    private readmeMD: string = null
    private readmeHTML: string = null
    private metadata: { [key: string]: string } = null
    readonly apiUri: string

    private constructor(public readonly user, public readonly name) {
        this.birthTime = Date.now()
        this.apiUri = `https://api.github.com/repos/${user}/${name}`
    }

    public static async fromName(user: string, name: string): Promise<GitHubRepo> {
        let incache = cache.get(`repo-${user}/${name}`)
        if (incache) {
            return incache
        }
        let repo = await new Promise<GitHubRepo>((good, bad) => {
            http_get(GITHUB_BASE + 'repos/' + user + '/' + name).then((body: any) => {
                let repo = new GitHubRepo(user, name)
                repo.id = body.id
                repo.site = body.html_url
                repo.description = body.description
                repo.lastUpdate = new Date(body.pushed_at)
                cache.put(`repo-${user}/${name}`, repo, getNewForgetTime())
                good(repo)
            }).catch(error => {
                bad(error)
            })
        })
        try {
            let readme = await new Promise((good, bad) => {
                http_get(GITHUB_BASE + 'repos/' + repo.user + '/' + repo.name + '/readme').then(res => {
                    let data = res.content

                    let encoding = res.encoding
                    if (encoding === 'base64') {
                        let decoded = b64.decode(data)
                        repo.consumeReadme(decoded)
                        good(decoded)
                    } else {
                        bad('Unknown file encoding: ' + encoding)
                    }
                }).catch(error => {
                    repo.readmeMD = ''
                    bad({ status: error.statusCode || 501, error: error })
                })
            })
        } catch (erro) {
            repo.consumeReadme(null)
        }
        try {
            let img = await repo.getFile('image.png')
            repo.imageUri = img.url
        } catch (erro) {
            repo.imageUri = './project_image_fallback.png'
        }
        return repo
    }

    private consumeReadme(markdown: string) {
        if (markdown === null)
            return
        let marked = md(this.readmeMD)
        this.readmeMD = markdown
        this.readmeHTML = marked.html
        this.metadata = marked.meta

        for (var key in this.metadata) {
            if (this.metadata.hasOwnProperty(key)) {
                var element = this.metadata[key]
                delete this.metadata[key]
                this.metadata[key.toLowerCase()] = element
            }
        }
    }
    getFile(path: string): Promise<GitHubFile> {
        return new Promise((good, bad) => {
            http_get(GITHUB_BASE + 'repos/' + this.user + '/' + this.name + '/contents/' + path).then(res => {
                good({
                    size: res.size,
                    url: res.download_url
                })
            }).catch(error => {
                bad({ status: error.statusCode || 500 })
            })
        })
    }
}

export function http_get(uri) {
    debugx('getting from ' + uri)
    return new Promise((good: (any) => void, bad: (any) => void) => {
        request.get(uri, {
            qs: {
                'access_token': auths.github.token
            },
            headers: {
                'User-Agent': 'indigotock/website'
            }
        }).then(function (data) {
            good(JSON.parse(data))
        }).catch(function (error) {
            bad(error)
        })
    })
}