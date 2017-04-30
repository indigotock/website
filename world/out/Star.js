System.register(["StarMaterial", "three"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var StarMaterial_1, THREE, Star;
    return {
        setters: [
            function (StarMaterial_1_1) {
                StarMaterial_1 = StarMaterial_1_1;
            },
            function (THREE_1) {
                THREE = THREE_1;
            }
        ],
        execute: function () {
            Star = class Star {
                constructor(radius) {
                    this.radius = radius;
                    this.geometry = new THREE.SphereBufferGeometry(radius);
                    var material = new StarMaterial_1.StarMaterial(this.radius);
                    this.mesh = new THREE.Mesh(this.geometry, material);
                }
            };
            exports_1("Star", Star);
        }
    };
});
//# sourceMappingURL=Star.js.map