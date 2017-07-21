let github = require('./github')
let elemeno = require('./elemeno')

import cache = require('memory-cache')

let models = {
    github,
    elemeno
}

export default abstract class InterfaceBase {
    protected readonly forgetTime: number
    protected lastChecked: number;

    constructor(updateTime: number = 10 * 60 * 1000) {
        this.forgetTime = updateTime
    }

    public async ensureUpdated() {
        if (this.needsUpdate())
            await this.update()
    }
    public needsUpdate(): boolean {
        return !this.lastChecked || (Date.now() - this.lastChecked) > this.forgetTime
    }

    public async abstract update(): Promise<any>
}