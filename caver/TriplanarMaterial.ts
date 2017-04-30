import { AjaxShader } from "AjaxShader";
import { CaveWorld } from "CaveWorld";
import { SimplexInclude } from "ShaderLibrary";
import * as THREE from "three";

export class TriplanarMaterial extends THREE.ShaderMaterial {
    constructor(texture: string, world: CaveWorld) {
        super({
            uniforms: {
                texture: { type: "t", value: null },
                time: { type: "f", value: Math.random() * 100 },
            },
        });
        world.addLoadRequirement(this);

        const that = this;
        const shader = new AjaxShader("triplanar-vertex.glsl", "triplanar-fragment.glsl", (frag, vert) => {
            that.fragmentShader = SimplexInclude + frag;
            that.vertexShader = vert;
            that.needsUpdate = true;
            CaveWorld.Instance.markLoaded(that);
        });
        new THREE.TextureLoader().load('../textures/' + texture, (data) => {
            that.uniforms.texture.value = data;
        });
    }
}
