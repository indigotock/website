System.register(["ShaderLibrary", "AjaxShader", "Engine", "three"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var ShaderLibrary, AjaxShader_1, Engine_1, THREE, StarMaterial;
    return {
        setters: [
            function (ShaderLibrary_1) {
                ShaderLibrary = ShaderLibrary_1;
            },
            function (AjaxShader_1_1) {
                AjaxShader_1 = AjaxShader_1_1;
            },
            function (Engine_1_1) {
                Engine_1 = Engine_1_1;
            },
            function (THREE_1) {
                THREE = THREE_1;
            }
        ],
        execute: function () {
            StarMaterial = class StarMaterial extends THREE.ShaderMaterial {
                constructor(radius) {
                    super({
                        uniforms: {
                            radius: { type: "float", value: radius },
                            time: { type: "f", value: Math.random() * 100 },
                            maxTemp: { type: "f", value: 5778 },
                            texture: { type: "t", value: null },
                        },
                    });
                    const that = this;
                    var shader = new AjaxShader_1.AjaxShader('star-vertex.glsl', 'star-fragment.glsl', (frag, vert) => {
                        that.fragmentShader = ShaderLibrary.SimplexInclude + frag;
                        that.vertexShader = ShaderLibrary.SimplexInclude + vert;
                        that.needsUpdate = true;
                        Engine_1.Engine.Instance.markLoaded(that);
                    });
                    Engine_1.Engine.Instance.addLoadRequirement(that);
                    new THREE.TextureLoader().load('textures/star_heat.png', (data) => {
                        that.uniforms.texture.value = data;
                    });
                    Engine_1.Engine.Instance.addUpdateHandler((delta) => {
                        that.uniforms.time.value += delta;
                    });
                }
            };
            exports_1("StarMaterial", StarMaterial);
        }
    };
});
//# sourceMappingURL=StarMaterial.js.map