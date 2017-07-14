import World from "./World"
import * as THREE from 'three'
import FileLoader from "src/FileLoader";

export default class WorldMaterial extends THREE.ShaderMaterial {
    public get sharedPreface(): string {
        return `
float map(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

vec2 map(vec2 value, vec2 inMin, vec2 inMax, vec2 outMin, vec2 outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

vec3 map(vec3 value, vec3 inMin, vec3 inMax, vec3 outMin, vec3 outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

vec4 map(vec4 value, vec4 inMin, vec4 inMax, vec4 outMin, vec4 outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}
uniform float radius;
uniform float maxHeight;
uniform float minHeight;
uniform sampler2D texture;
varying vec3 v_pos;
        `
    }
    public produceFragmentShader(): string {
        return this.sharedPreface + `
        void main() {
            float diameter = radius*2.0;
            float d = abs(length(v_pos)-radius);
            float l = map(d, minHeight, maxHeight, 0.0, 1.0);
            gl_FragColor = texture2D(texture, vec2(l,l));
}`
    }

    public produceVertexShader(): string {
        return this.sharedPreface + `
        void main() {
            v_pos = position;
            float diameter = radius*2.0;
            gl_Position = projectionMatrix *
                            modelViewMatrix *
                            vec4(position,1.0);
}`
    }
    constructor(public readonly world: World, private readonly maxHeight: number, private readonly minHeight: number) {
        super()
        this.fragmentShader = this.produceFragmentShader()
        this.vertexShader = this.produceVertexShader()
        this.needsUpdate = true
        this.uniforms['radius'] = { value: this.world.radius }
        this.uniforms['maxHeight'] = { value: maxHeight }
        this.uniforms['minHeight'] = { value: 0 }
        const that = this
        let l = new THREE.TextureLoader()
        l.load('texture.png', (d) => {
            this.uniforms['texture'] = { value: d }
            that.needsUpdate = true
        })
    }
}