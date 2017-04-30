System.register(["ShaderLibrary", "AjaxShader", "Engine", "three"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var ShaderLibrary, AjaxShader_1, Engine_1, THREE, CloudsMaterial;
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
            CloudsMaterial = class CloudsMaterial extends THREE.ShaderMaterial {
                constructor(radius) {
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
                    var shader = new AjaxShader_1.AjaxShader('clouds-vertex.glsl', 'clouds-fragment.glsl', (frag, vert) => {
                        that.fragmentShader = ShaderLibrary.SimplexInclude + frag;
                        that.vertexShader = vert;
                        that.needsUpdate = true;
                        Engine_1.Engine.Instance.markLoaded(that);
                    });
                    Engine_1.Engine.Instance.addLoadRequirement(that);
                    Engine_1.Engine.Instance.addUpdateHandler((dt) => {
                        this.uniforms.time.value += dt;
                    });
                }
                toString() {
                    return `CloudsMaterial`;
                }
            };
            exports_1("CloudsMaterial", CloudsMaterial);
        }
    };
});
//# sourceMappingURL=CloudsMaterial.js.map