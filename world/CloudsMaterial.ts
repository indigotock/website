import * as ShaderLibrary from 'ShaderLibrary'
import { AjaxShader } from 'AjaxShader'
import { Engine } from "Engine";
import * as THREE from "three";


export class CloudsMaterial extends THREE.ShaderMaterial {
    public readonly uniforms: any;
    constructor(radius: number) {
        super({
            uniforms: {
                radius: { type: "float", value: radius },
                time: { type: "float", value: new Date().getSeconds() },
                seed1: { type: "float", value: Math.random() * 100 },
                seed2: { type: "float", value: Math.random() * 100 },
            },
            side: THREE.DoubleSide
        });
        const that = this;
        var shader = new AjaxShader('clouds-vertex.glsl', 'clouds-fragment.glsl', (frag, vert) => {
            that.fragmentShader = ShaderLibrary.SimplexInclude + frag;
            that.vertexShader = vert;
            that.needsUpdate = true;
            Engine.Instance.markLoaded(that);
        });
        Engine.Instance.addLoadRequirement(that);

        Engine.Instance.addUpdateHandler((dt) => {
            this.uniforms.time.value += dt;
        })
    }
    public toString() {
        return `CloudsMaterial`
    }
}


