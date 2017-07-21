import debug = require('debug')
let debugx = debug('site:github-i')
import request = require('request-promise')
import auths = require('../auths')
var md = require('meta-marked')
var b64 = require('js-base64').Base64
import gh = require('github')
import db = require('../db')
import { HttpRequestCallback, HttpRequestResponse } from '../util/HttpRequest'
import cache = require('memory-cache')
import InterfaceBase from "./index";

let github = new gh({
    protocol: 'https',
    headers: {
        'User-Agent': 'indigotock/website'
    },
})

const TEN_MINUTES = 10 * 60 * 1000

async function retrieveRepo(name) {
    let incache = cache.get('repository-' + name)
    if (incache) {
        debugx('Taking repository ' + name + ' from cache')
        return incache
    }
    let indb = await db.default.repositories().findOne({ name: name })
    if (indb) {
        cache.put('repository-' + name, indb, TEN_MINUTES)
        debugx('Taking repository ' + name + ' from db')
        return indb
    }
    let ret = await github.repos.get({ owner: auths.github.username, repo: name })
    ret = ret.data
    let repo = await createRepoFromPayload(ret)
    cache.put('repository-' + name, repo, TEN_MINUTES)
    return repo
}
async function createRepoFromPayload(payload): Promise<GitHubRepo> {
    let ret: GitHubRepo = {
        id: payload.id,
        name: payload.name,
        owner: payload.owner.login,
        httpUrl: payload.url,
        description: payload.description,
        descriptionHTML: payload.description,
        lastUpdate: payload.pushed_at,
        tileImage: './project_image_fallback.png',
        metadata: {},
        readmeMD: '',
        readmeHTML: ''
    }

    try {
        let emoji = await github.misc.getEmojis({})
        emoji = emoji.data
        let replaced: string = ret.description
        for (let key in emoji) {
            if (emoji.hasOwnProperty(key)) {
                let element = emoji[key];
                replaced = replaced.replace(':' + key + ':',
                    `<img class="emoji" src="${element}" alt="key"/>`
                )
            }
        }
        ret.descriptionHTML = replaced;
    } catch (error) {
        debugx('Unable to apply gitmoji transformations to repository: ' + error)
    }

    try {
        let tileimg = await request(`https://api.github.com/repos/${ret.owner}/${ret.name}/contents/image.png`,
            {
                qs: {
                    'access_token': auths.github.token
                },
                headers: {
                    'User-Agent': 'indigotock/website'
                }
            })
        tileimg = JSON.parse(tileimg)
        ret.tileImage = tileimg.download_url
    } catch (error) {
        debugx('Error getting tile image: ' + error)
    }

    try {
        let readme = await github.repos.getReadme({ owner: auths.github.username, repo: ret.name })
        readme = readme.data
        let decoded = b64.decode(readme.content)
        let mm = md(decoded)
        ret.metadata = mm.meta
        for (let key in ret.metadata) {
            if (ret.metadata.hasOwnProperty(key)) {
                let element = ret.metadata[key];
                delete ret.metadata[key];
                ret.metadata[key.toLowerCase()] = element
            }
        }
        ret.readmeHTML = mm.html.trim()

        let imgmatch = /<img.*?src=['"](.*?)['"]/g
        ret.readmeHTML = ret.readmeHTML.replace(imgmatch,
            (str, ...rest) => {
                // If url is absolute then ignore
                if (/^https?/i.test(rest[0]))
                    return '<img src=\'' + rest[0] + '\''
                return `<img src='https://github.com/${ret.owner}/${ret.name}/raw/master/` + rest[0] + '\''
            })

        ret.readmeMD = mm.markdown.trim()
    } catch (erro) {
        debugx('Unable to get readme for repository ' + ret.name + ': ' + erro)
    }
    try {
        db.default.repositories().updateOne({ id: ret.id }, ret, { upsert: true })
    } catch (error) {
        debugx(`Unable to upsert repository ${ret.name} into database: ${error}`)
    }
    return ret
}

function ghAuth() {
    github.authenticate({
        type: 'token',
        token: auths.github.token
    })
}
class GitHubInterface extends InterfaceBase {
    public async getRepositories(count = 5): Promise<GitHubRepo[]> {
        let done = await this.ensureUpdated()

        let incache: GitHubRepo[] = cache.get('my-repositories')
        try {
            if (incache) {
                ghAuth()
                debugx('Taking repositories from cache')
                incache.sort((a, b) => {
                    return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()
                })
                return incache.slice(0, count)
            } else {
                return []
            }
        } catch (error) {
            debugx('Error getting github repositories: ' + error)
        }
    }
    public async specificRepository(name): Promise<GitHubRepo> {
        try {
            let ret = await retrieveRepo(name)
            return ret
        } catch (error) {
            debugx('Error getting repository ' + name + ': ' + error)
            return null
        }
    }
    public async update(): Promise<any> {
        this.lastChecked = Date.now()
        try {
            ghAuth()

            let repos: any = await github.repos.getForUser({ username: auths.github.username })
            repos = repos.data
            let newrepos = await Promise.all(repos.map(async (e) => {
                let repo = await createRepoFromPayload(e)
                cache.put('repository-' + repo.name, repo)
                return repo
            }))
            debugx('Putting my-repositories into cache')
            cache.put('my-repositories', newrepos)
            return repos
        } catch (error) {
            debugx('Error updating github repositories: ' + error)
        }
    }
}

export interface GitHubRepo {
    id: number
    name: string,
    owner: string,
    httpUrl: string
    description: string
    descriptionHTML: string
    lastUpdate: Date
    tileImage: string
    readmeMD: string
    readmeHTML: string
    metadata: { [key: string]: string }
}

export default new GitHubInterface()
