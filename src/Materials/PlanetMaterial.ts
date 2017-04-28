import * as ShaderLibrary from './ShaderLibrary'
import { AjaxShader } from '../Util/AjaxShader'
import { Engine } from "../Engine";

export class PlanetMaterial extends THREE.ShaderMaterial {
    public readonly uniforms: any;
    public setMin(min: number) {
        this.uniforms.minHeight.value = min;
    }
    public setMax(max: number) {
        this.uniforms.maxHeight.value = max;
    }
    constructor(radius: number, texture: string, euler: THREE.Matrix4) {
        super({
            uniforms: {
                texture: { type: "t", value: null },
                radius: { type: "float", value: radius },
                minHeight: { type: "float", value: 0 },
                maxHeight: { type: "float", value: 1 },
            },
            // wireframe:true
        });
        const that = this;
        Engine.Instance.addLoadRequirement(this);
        var shader = new AjaxShader('planet-vertex.glsl', 'planet-fragment.glsl', (frag, vert) => {
            that.fragmentShader = ShaderLibrary.SimplexInclude + frag;
            that.vertexShader = vert;
            that.needsUpdate = true;
            Engine.Instance.markLoaded(that);
        });
        new THREE.TextureLoader().load(texture, (data) => {
            that.uniforms.texture.value = data;
        });
    }

    public toString() {
        return `PlanetMaterial`
    }
}


