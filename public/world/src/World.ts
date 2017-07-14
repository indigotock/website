import * as THREE from 'three'
import WorldTerrain from './WorldTerrain'
import { Biome, Biomes } from './Biome'

export interface WorldOptions {
    maxHeight: number,
    seed: number,
    radius: number
}

export default class World {
    /**
     * The radius of the planet in kilometers
     */
    public readonly terrain: WorldTerrain;

    public get circumfrance() {
        return this.radius * 2 * Math.PI
    }

    public readonly options: WorldOptions = {
        maxHeight: 150,
        seed: Math.random() * 10000,
        radius: 60
    }

    constructor(public readonly radius: number, public readonly biomes: Biome[], opts?: Partial<WorldOptions>) {
        this.terrain = new WorldTerrain(this);

        this.options = Object.assign(this.options, opts)
    }

    public cartesian3ToGeographic(x: number, y: number, z: number) {
        if (z) {
            return {
                long: ((270 + (Math.atan2(x, z)) * 180 / Math.PI) % 360) - 180,
                lat: 90 - (Math.acos(y / this.radius)) * 180 / Math.PI
            }
        } else
            return {
                long: x / this.radius,
                lat: 2 * Math.atan(Math.exp(y / this.radius)) - Math.PI / 2
            }
    }

    public cartesian3ToMercator(x: number, y: number, z: number) {
        return this.geographicToMercator(this.cartesian3ToGeographic(x, y, z))
    }

    public geographicToMercator(geo: { lat: number, long: number }): { x: number, y: number } {
        const d2r = (Math.PI * 2) / 360
        return {
            x: (d2r * geo.long) * this.radius,
            y: Math.log(Math.tan(Math.PI / 4 + (d2r * geo.lat) / 2)) * this.radius
        }
    }
}