import * as THREE from 'three'
import WorldTerrain from './WorldTerrain'
import Noise from 'open-simplex-noise'

export default class FileLoader {
    private _done: boolean
    public get done() {
        return this._done
    }

    constructor(public readonly path: string, private readonly handler: (d) => void) {
        fetch(path)
            .then(d => {
                this._done = true
                handler(d)
            }).catch(
            e => {
                console.log('Error fetching ' + path + '\n' + e)
            })
    }
}