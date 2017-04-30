System.register(["AjaxShader", "CaveWorld", "ShaderLibrary", "three"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var AjaxShader_1, CaveWorld_1, ShaderLibrary_1, THREE, TriplanarMaterial;
    return {
        setters: [
            function (AjaxShader_1_1) {
                AjaxShader_1 = AjaxShader_1_1;
            },
            function (CaveWorld_1_1) {
                CaveWorld_1 = CaveWorld_1_1;
            },
            function (ShaderLibrary_1_1) {
                ShaderLibrary_1 = ShaderLibrary_1_1;
            },
            function (THREE_1) {
                THREE = THREE_1;
            }
        ],
        execute: function () {
            TriplanarMaterial = class TriplanarMaterial extends THREE.ShaderMaterial {
                constructor(texture, world) {
                    super({
                        uniforms: {
                            texture: { type: "t", value: null },
                            time: { type: "f", value: Math.random() * 100 },
                        },
                    });
                    world.addLoadRequirement(this);
                    const that = this;
                    const shader = new AjaxShader_1.AjaxShader("triplanar-vertex.glsl", "triplanar-fragment.glsl", (frag, vert) => {
                        that.fragmentShader = ShaderLibrary_1.SimplexInclude + frag;
                        that.vertexShader = vert;
                        that.needsUpdate = true;
                        CaveWorld_1.CaveWorld.Instance.markLoaded(that);
                    });
                    new THREE.TextureLoader().load('../textures/' + texture, (data) => {
                        that.uniforms.texture.value = data;
                    });
                }
            };
            exports_1("TriplanarMaterial", TriplanarMaterial);
        }
    };
});
//# sourceMappingURL=TriplanarMaterial.js.map