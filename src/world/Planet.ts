import { SimplexNoise, PerlinNoise } from "../Util/Noise";
import { ICelestialBody } from '../Bodies/ICelestialBody';
import { CloudsMaterial } from '../Materials/CloudsMaterial';
import { PlanetMaterial } from '../Materials/PlanetMaterial';
import { Engine } from "../Engine";

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value))
}
function map(value, inMin, inMax, outMin, outMax) {
    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

function randomFrom<T>(things: T[]): T {
    return things[Math.trunc(Math.random() * things.length)]
}

export enum TerrainDepth {
    DeepOcean = 4 / 256,
    Ocean = 11 / 256,
    Water = 14 / 256,
    ShallowWater = 14 / 256,
    Beach = 4 / 256,
}
export class Planet implements ICelestialBody {

    private readonly noise = new SimplexNoise(new Date().getTime());
    public readonly geometry: THREE.Geometry;
    public mesh: THREE.Mesh;
    public readonly highestPeak: number;
    public readonly lowestTrough: number;
    public readonly rotation: THREE.Euler;
    public readonly tilt: number;

    public clouds: THREE.Mesh;

    constructor(public readonly radius: number, public readonly texture: string) {
        const diam = radius * 2;
        // this.geometry = new THREE.CubeGeometry(diam, diam, diam,
        //     radius / 2, radius / 2, radius / 2);
        this.geometry = new THREE.IcosahedronGeometry(radius, 5);
        this.texture = './textures/' + texture;
        this.rotation = new THREE.Euler(THREE.Math.degToRad(1 + (Math.random() * 30)), 0, THREE.Math.degToRad(1 + (Math.random() * 26)));
        // this.axis = new THREE.Euler(0, 0, THREE.Math.degToRad(90));
        var rmat = new THREE.Matrix4();
        rmat.makeRotationFromEuler(this.rotation);
        var material = new PlanetMaterial(this.radius, this.texture, rmat);

        this.highestPeak = .1 * radius;
        this.lowestTrough = 0;
        let scl = .8//map(Math.random(), 0, 1, .9)
        let low = 0;
        let high = 0;
        var verts: number[] = []
        for (let i = 0; i < this.geometry.vertices.length; i++) {
            let v = this.geometry.vertices[i];

            v.normalize().multiplyScalar(this.radius);
            let val = 0;
            let amp = 1;
            let mod = radius / scl;
            let nx = v.x / mod;
            let ny = v.y / mod;
            let nz = v.z / mod;

            for (var oct = 0; oct < 8; oct++) {
                let off = Math.pow(2.666, oct);
                let n = this.noise.get(off * nx, off * ny, off * nz);
                val += amp * n;
                amp *= .5;
            }
            verts[i] = (Math.pow(val, 2.5)) * .015 * (radius / 2);

            let y = Math.abs(v.clone().normalize().y);
            if (y > .9666) {
                verts[i] += (.05 * radius) * (this.noise.get(nx * 2, ny * 2, 2 * nz)*.5)
            }

            if (verts[i] < low)
                low = verts[i];
            if (verts[i] > high)
                high = verts[i];

        }
        const that = this;

        verts = verts.map(e => {
            return map(e, low, high, this.lowestTrough, this.highestPeak);
        });

        if (material instanceof PlanetMaterial) {
            material.setMin(this.lowestTrough);
            material.setMax(this.highestPeak);
        }

        this.geometry.vertices = this.geometry.vertices.map(
            (e, i) => e.add(e.clone().normalize().multiplyScalar(verts[i]))
        );


        this.mesh = new THREE.Mesh(this.geometry, material);

        this.mesh.setRotationFromEuler(this.rotation);
        Engine.Instance.scene.add(this.mesh);

        Engine.Instance.addUpdateHandler(dt => {
            this.mesh.rotateY( dt / 10);
        })

        // var cloudrad = this.radius / .95;
        // this.clouds = new THREE.Mesh(
        //     new THREE.SphereBufferGeometry(cloudrad, cloudrad, cloudrad),
        //     new CloudsMaterial(cloudrad));
        // this.mesh.add(this.clouds);
    }
}