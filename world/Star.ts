import { StarMaterial } from 'StarMaterial'
import { PerlinNoise } from "Noise";
import { ICelestialBody } from 'ICelestialBody';
import * as THREE from 'three';

export class Star implements ICelestialBody {
    public readonly geometry: THREE.BufferGeometry;
    public readonly mesh: THREE.Mesh;


    constructor(public readonly radius: number) {
        this.geometry = new THREE.SphereBufferGeometry(radius);
        var material = new StarMaterial(this.radius);
        this.mesh = new THREE.Mesh(this.geometry, material);
    }
}