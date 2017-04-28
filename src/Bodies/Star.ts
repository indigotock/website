import { StarMaterial } from '../Materials/StarMaterial'
import { ICelestialBody } from './ICelestialBody'
import { PerlinNoise } from "../Util/Noise";

export class Star implements ICelestialBody {
    public readonly geometry: THREE.BufferGeometry;
    public readonly mesh: THREE.Mesh;


    constructor(public readonly radius: number) {
        this.geometry = new THREE.SphereBufferGeometry(radius);
        var material = new StarMaterial(this.radius);
        this.mesh = new THREE.Mesh(this.geometry, material);
    }
}