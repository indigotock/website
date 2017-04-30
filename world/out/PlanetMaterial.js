System.register(["ShaderLibrary", "AjaxShader", "Engine", "three"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var ShaderLibrary, AjaxShader_1, Engine_1, THREE, PlanetMaterial;
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
            PlanetMaterial = class PlanetMaterial extends THREE.ShaderMaterial {
                setMin(min) {
                    this.uniforms.minHeight.value = min;
                }
                setMax(max) {
                    this.uniforms.maxHeight.value = max;
                }
                constructor(radius, texture, euler) {
                    super({
                        uniforms: {
                            texture: { type: "t", value: null },
                            radius: { type: "float", value: radius },
                            minHeight: { type: "float", value: 0 },
                            maxHeight: { type: "float", value: 1 },
                        },
                    });
                    const that = this;
                    Engine_1.Engine.Instance.addLoadRequirement(this);
                    var shader = new AjaxShader_1.AjaxShader('planet-vertex.glsl', 'planet-fragment.glsl', (frag, vert) => {
                        that.fragmentShader = ShaderLibrary.SimplexInclude + frag;
                        that.vertexShader = vert;
                        that.needsUpdate = true;
                        Engine_1.Engine.Instance.markLoaded(that);
                    });
                    new THREE.TextureLoader().load(texture, (data) => {
                        that.uniforms.texture.value = data;
                    });
                }
                toString() {
                    return `PlanetMaterial`;
                }
            };
            exports_1("PlanetMaterial", PlanetMaterial);
        }
    };
});
//# sourceMappingURL=PlanetMaterial.js.map