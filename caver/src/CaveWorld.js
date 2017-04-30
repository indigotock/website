System.register(["three", "TriplanarMaterial"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var THREE, TriplanarMaterial_1, CaveWorld;
    return {
        setters: [
            function (THREE_1) {
                THREE = THREE_1;
            },
            function (TriplanarMaterial_1_1) {
                TriplanarMaterial_1 = TriplanarMaterial_1_1;
            }
        ],
        execute: function () {
            CaveWorld = class CaveWorld {
                constructor(container) {
                    this.container = container;
                    this.readyHandlers = [];
                    this.loadRequirements = new Set();
                    this.addLoadRequirement(this);
                    this.scene = new THREE.Scene();
                    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new TriplanarMaterial_1.TriplanarMaterial("dirt.jpg", this));
                    this.ground.rotateX(THREE.Math.degToRad(-90));
                    this.scene.add(this.ground);
                    this.clock = new THREE.Clock();
                    this.renderer = new THREE.WebGLRenderer();
                    this.container.appendChild(this.renderer.domElement);
                    this.camera = new THREE.PerspectiveCamera(50, 4 / 3);
                    this.camera.position.set(0, 500, 0);
                    this.camera.lookAt(this.ground.position);
                    this.renderer.setSize(640, 480);
                    const light = new THREE.DirectionalLight(0xffffff);
                    light.position.set(2, 1, 1);
                    this.scene.add(light);
                    CaveWorld.Instance = this;
                }
                draw() {
                    const dt = this.clock.getDelta();
                    this.renderer.render(this.scene, this.camera);
                }
                whenReady(callback) {
                    this.readyHandlers.push(callback);
                    return this;
                }
                addLoadRequirement(obj) {
                    if (this.loadRequirements.has(obj))
                        console.debug(`Attempted to add existing load requirement ${obj}`);
                    else {
                        console.debug(`Added load requirement ${obj}`);
                        this.loadRequirements.add(obj);
                    }
                }
                markLoaded(obj) {
                    console.debug(`Loaded ${obj}`);
                    this.loadRequirements.delete(obj);
                    if (this.loadRequirements.size === 0) {
                        this.readyHandlers.map((e) => e(this));
                    }
                }
            };
            exports_1("CaveWorld", CaveWorld);
        }
    };
});
//# sourceMappingURL=CaveWorld.js.map