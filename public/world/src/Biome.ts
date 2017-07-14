import * as THREE from 'three'
import WorldTerrain from './WorldTerrain'
import Noise from 'open-simplex-noise'

export type Generator = (b: Biome, x: number, y: number, z: number) => number

export class Biome {
    noise1: Noise;
    noise2: Noise;
    constructor(public readonly name: string, public readonly colour: THREE.Color, public readonly heightGenerator: Generator, public readonly mask: Generator) {
        this.noise1 = new Noise(Math.random())
        this.noise2 = new Noise(Math.random())
    }
}

export class Biomes {

    public static readonly Ocean: Biome = new Biome(
        'Ocean',
        new THREE.Color('#001f3f'),
        (b, x: number, y: number, z: number) => {
            return 0
        },
        (b, x: number, y: number, z: number) => {
            return b.noise1.noise3D(x, y, z)
        })

    private static amplifiedTerrain(noise, x, y, z, runs, mult) {
        let sum = 0
        let amp = 1
        let scl = 1
        let ampsum = 0
        for (let i = 0; i < runs; i++) {
            sum += noise(scl * x, scl * y, scl * z) * amp
            ampsum += amp
            amp *= mult
            scl *= 2
        }
        return sum / ampsum
    }

    public static readonly Mountains: Biome = new Biome(
        'Mountains',
        new THREE.Color('#121212'),
        (b, x: number, y: number, z: number) => {
            return Math.pow(Biomes.amplifiedTerrain(b.noise1.noise3D.bind(b.noise1), x, y, z, 5, .5), 1) / 3
        },
        (b, x: number, y: number, z: number) => {
            return 1
        })
}