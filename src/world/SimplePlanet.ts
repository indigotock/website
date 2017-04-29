import { SimplexNoise, PerlinNoise } from "Noise";
import { ICelestialBody } from 'ICelestialBody';
import { Engine } from "Engine";
import { Environment } from "Environment";
import * as THREE from 'three';

export class SimplePlanet implements ICelestialBody {
    private readonly noise = new SimplexNoise();
    public readonly geometry: THREE.BufferGeometry;
    public readonly mesh: THREE.Mesh;

    constructor(public readonly radius: number, public readonly texture: string) {
        this.geometry = new THREE.SphereBufferGeometry(radius);
        this.texture = './textures/' + texture;
        var tex = this.makeTexture();
        var material = new THREE.MeshBasicMaterial({
            map: tex
        });




        this.mesh = new THREE.Mesh(this.geometry, material);

        Engine.Instance.addUpdateHandler((dt) => {
            this.mesh.rotateY(dt / 10)
        })
    }

    private makeTexture(): THREE.Texture {
        const that = this;

        var c = document.createElement('canvas');
        c.width = 128;
        c.height = 128;
        var con = c.getContext('2d');
        var num = 0;

        for (var y = 0; y < c.height; y++)
            for (var x = 0; x < c.width; x++) {
                num += 1
                con.fillStyle = '0x'+Math.random().toString(16);
                con.fillRect(x, y, 1, 1);
            }

        var v = new SimplexNoise();

        var tex = new THREE.Texture(c)
        tex.needsUpdate = true;
        return tex;
    }
}

/*
float map(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

vec4 mixcol(vec4 t0, vec4 t1){
    return t0.a * t0 + (1.0 - t0.a) * t1;
}

void main() {
    vec3 norm = normalize(pos);
    vec3 sealevel = norm * radius;

    float heightAboveSealevel = length(pos-sealevel);

    float scaled = map(heightAboveSealevel, minHeight, maxHeight, 0., 1.);

    float val = snoise(pos/.50);

    vec4 col = vec4(val,val,val,.04);
    float moist = (snoise(pos/(radius/3.))+1.)/2.;
    gl_FragColor = mixcol(col, texture2D(texture, vec2(moist,scaled)));

}
*/