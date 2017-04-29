import * as ShaderLibrary from 'ShaderLibrary'
import { AjaxShader } from 'AjaxShader'
import { Engine } from 'Engine'
import * as THREE from 'three';

export class StarMaterial extends THREE.ShaderMaterial {
    constructor(radius: number) {
        super({
            uniforms: {
                radius: { type: "float", value: radius },
                time: { type: "f", value: Math.random() * 100 },
                maxTemp: { type: "f", value: 5778 },
                texture: { type: "t", value: null },
            },
        });

        const that = this;
        var shader = new AjaxShader('star-vertex.glsl', 'star-fragment.glsl', (frag, vert) => {
            that.fragmentShader = ShaderLibrary.SimplexInclude + frag;
            that.vertexShader = ShaderLibrary.SimplexInclude + vert;
            that.needsUpdate = true;
            Engine.Instance.markLoaded(that);
        });
        Engine.Instance.addLoadRequirement(that);
        new THREE.TextureLoader().load('textures/star_heat.png', (data) => {
            that.uniforms.texture.value = data;
        });
        Engine.Instance.addUpdateHandler((delta) => {
            that.uniforms.time.value += delta;
        });
    }
}