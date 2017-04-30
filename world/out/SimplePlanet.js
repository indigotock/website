System.register(["Noise", "Engine", "three"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Noise_1, Engine_1, THREE, SimplePlanet;
    return {
        setters: [
            function (Noise_1_1) {
                Noise_1 = Noise_1_1;
            },
            function (Engine_1_1) {
                Engine_1 = Engine_1_1;
            },
            function (THREE_1) {
                THREE = THREE_1;
            }
        ],
        execute: function () {
            SimplePlanet = class SimplePlanet {
                constructor(radius, texture) {
                    this.radius = radius;
                    this.texture = texture;
                    this.noise = new Noise_1.SimplexNoise();
                    this.geometry = new THREE.SphereBufferGeometry(radius);
                    this.texture = './textures/' + texture;
                    var tex = this.makeTexture();
                    var material = new THREE.MeshBasicMaterial({
                        map: tex
                    });
                    this.mesh = new THREE.Mesh(this.geometry, material);
                    Engine_1.Engine.Instance.addUpdateHandler((dt) => {
                        this.mesh.rotateY(dt / 10);
                    });
                }
                makeTexture() {
                    const that = this;
                    var c = document.createElement('canvas');
                    c.width = 128;
                    c.height = 128;
                    var con = c.getContext('2d');
                    var num = 0;
                    for (var y = 0; y < c.height; y++)
                        for (var x = 0; x < c.width; x++) {
                            num += 1;
                            con.fillStyle = '0x' + Math.random().toString(16);
                            con.fillRect(x, y, 1, 1);
                        }
                    var v = new Noise_1.SimplexNoise();
                    var tex = new THREE.Texture(c);
                    tex.needsUpdate = true;
                    return tex;
                }
            };
            exports_1("SimplePlanet", SimplePlanet);
        }
    };
});
//# sourceMappingURL=SimplePlanet.js.map