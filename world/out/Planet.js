System.register(["Noise", "PlanetMaterial", "Engine", "three"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    function map(value, inMin, inMax, outMin, outMax) {
        return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
    }
    function randomFrom(things) {
        return things[Math.trunc(Math.random() * things.length)];
    }
    var Noise_1, PlanetMaterial_1, Engine_1, THREE, TerrainDepth, Planet;
    return {
        setters: [
            function (Noise_1_1) {
                Noise_1 = Noise_1_1;
            },
            function (PlanetMaterial_1_1) {
                PlanetMaterial_1 = PlanetMaterial_1_1;
            },
            function (Engine_1_1) {
                Engine_1 = Engine_1_1;
            },
            function (THREE_1) {
                THREE = THREE_1;
            }
        ],
        execute: function () {
            (function (TerrainDepth) {
                TerrainDepth[TerrainDepth["DeepOcean"] = 0.015625] = "DeepOcean";
                TerrainDepth[TerrainDepth["Ocean"] = 0.04296875] = "Ocean";
                TerrainDepth[TerrainDepth["Water"] = 0.0546875] = "Water";
                TerrainDepth[TerrainDepth["ShallowWater"] = 0.0546875] = "ShallowWater";
                TerrainDepth[TerrainDepth["Beach"] = 0.015625] = "Beach";
            })(TerrainDepth || (TerrainDepth = {}));
            exports_1("TerrainDepth", TerrainDepth);
            Planet = class Planet {
                constructor(radius, texture) {
                    this.radius = radius;
                    this.texture = texture;
                    this.noise = new Noise_1.SimplexNoise(new Date().getTime());
                    const diam = radius * 2;
                    this.geometry = new THREE.IcosahedronGeometry(radius, 5);
                    this.texture = './textures/' + texture;
                    this.rotation = new THREE.Euler(THREE.Math.degToRad(1 + (Math.random() * 30)), 0, THREE.Math.degToRad(1 + (Math.random() * 26)));
                    var rmat = new THREE.Matrix4();
                    rmat.makeRotationFromEuler(this.rotation);
                    var material = new PlanetMaterial_1.PlanetMaterial(this.radius, this.texture, rmat);
                    this.highestPeak = .1 * radius;
                    this.lowestTrough = 0;
                    let scl = .8;
                    let low = 0;
                    let high = 0;
                    var verts = [];
                    for (let i = 0; i < this.geometry.vertices.length; i++) {
                        let v = this.geometry.vertices[i];
                        v.normalize().multiplyScalar(this.radius);
                        let val = 0;
                        let amp = 1;
                        let mod = radius / scl;
                        let nx = v.x / mod;
                        let ny = v.y / mod;
                        let nz = v.z / mod;
                        for (var oct = 0; oct < 8; oct++) {
                            let off = Math.pow(2.666, oct);
                            let n = this.noise.get(off * nx, off * ny, off * nz);
                            val += amp * n;
                            amp *= .5;
                        }
                        verts[i] = (Math.pow(val, 2.5)) * .015 * (radius / 2);
                        let y = Math.abs(v.clone().normalize().y);
                        if (y > .9666) {
                            verts[i] += (.05 * radius) * (this.noise.get(nx * 2, ny * 2, 2 * nz) * .5);
                        }
                        if (verts[i] < low)
                            low = verts[i];
                        if (verts[i] > high)
                            high = verts[i];
                    }
                    const that = this;
                    verts = verts.map(e => {
                        return map(e, low, high, this.lowestTrough, this.highestPeak);
                    });
                    if (material instanceof PlanetMaterial_1.PlanetMaterial) {
                        material.setMin(this.lowestTrough);
                        material.setMax(this.highestPeak);
                    }
                    this.geometry.vertices = this.geometry.vertices.map((e, i) => e.add(e.clone().normalize().multiplyScalar(verts[i])));
                    this.mesh = new THREE.Mesh(this.geometry, material);
                    this.mesh.setRotationFromEuler(this.rotation);
                    Engine_1.Engine.Instance.scene.add(this.mesh);
                    Engine_1.Engine.Instance.addUpdateHandler(dt => {
                        this.mesh.rotateY(dt / 10);
                    });
                }
            };
            exports_1("Planet", Planet);
        }
    };
});
//# sourceMappingURL=Planet.js.map