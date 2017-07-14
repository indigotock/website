import * as THREE from 'three'
import World from "./World"
import Noise from 'open-simplex-noise'
import WorldMaterial from "./WorldMaterial"
import { Biome } from "./Biome";

export interface TerrainData {
    height: number,
    biome: Biome
}

export default class WorldTerrain {
    private noise2D(x: number, y: number, z: number) {
        x *= 10
        y *= 10
        z *= 10
        return (this.noise.noise3D(x, y, z) + 1) / 2
    }
    private noise: Noise
    public constructor(public readonly world: World) {
        this.noise = new Noise(world.options.seed)
    }

    public getTerrainHeightAtPoint(point: THREE.Vector3) {
        let acc = 0
        this.world.biomes.forEach(b => {
            let masked = b.mask(b, point.x, point.y, point.z) *
                Math.abs(b.heightGenerator(b, point.x, point.y, point.z))
            acc += masked
        })
        return acc * this.world.options.maxHeight
    }

    public getTerrainAtPoint(point: THREE.Vector3): TerrainData {
        return {
            height: this.getTerrainHeightAtPoint(point.clone()),
            biome: null
        }
    }
}