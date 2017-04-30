System.register(["Planet", "Environment", "OrbitControls", "three"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Planet_1, Environment_1, OrbitControls_1, THREE, Engine;
    return {
        setters: [
            function (Planet_1_1) {
                Planet_1 = Planet_1_1;
            },
            function (Environment_1_1) {
                Environment_1 = Environment_1_1;
            },
            function (OrbitControls_1_1) {
                OrbitControls_1 = OrbitControls_1_1;
            },
            function (THREE_1) {
                THREE = THREE_1;
            }
        ],
        execute: function () {
            Engine = class Engine {
                constructor(_window) {
                    this.readyHandlers = [];
                    this.updateFunctions = [];
                    this.loadRequirements = new Set();
                    const that = this;
                    this.addLoadRequirement(this);
                    Engine.Instance = this;
                    this.clock = new THREE.Clock(true);
                    this.window = _window;
                    this.scene = new THREE.Scene();
                    this.camera = new THREE.PerspectiveCamera(50, 1, .1, Number.MAX_SAFE_INTEGER);
                    if (Environment_1.Environment.supportsWebGL)
                        this.renderer = new THREE.WebGLRenderer({
                            antialias: true,
                        });
                    else
                        this.renderer = new THREE.CanvasRenderer();
                    this.container = this.window.document.getElementsByTagName('main')[0];
                    this.controls = new OrbitControls_1.OrbitControls(this.camera, this.renderer.domElement);
                    this.controls.enablePan = false;
                    this.controls.enableZoom = false;
                    this.controls.rotateSpeed /= 10;
                    this.controls.enableDamping = true;
                    this.controls.dampingFactor = .12;
                    this.container.appendChild(this.renderer.domElement);
                    this.renderer.domElement.classList.add('hidden');
                    this.raycaster = new THREE.Raycaster();
                    function makeplanet() {
                        if (that.planet !== null) {
                            that.planet.mesh.children.forEach(element => {
                                element.parent.remove(element);
                            });
                            that.scene.remove(that.planet.mesh);
                        }
                        that.planet = new Planet_1.Planet(100, "tex2.png");
                        that.camera.position.set(0, 0, that.planet.radius * 2.5);
                    }
                    this.container.addEventListener('dblclick', function (e) {
                        makeplanet();
                    });
                    var light = new THREE.DirectionalLight(0xffffff);
                    light.position.set(2, 1, 1);
                    this.scene.add(light);
                    var canv = this.renderer.domElement;
                    this.window.addEventListener('resize', () => {
                        this.onWindowResize();
                    }, false);
                    makeplanet();
                    this.onWindowResize();
                }
                whenReady(callback) {
                    this.readyHandlers.push(callback);
                    return this;
                }
                onWindowResize() {
                    var cheit = Math.min(600, this.window.innerWidth);
                    var dist = this.camera.position.length();
                    var heit = this.planet.radius * 3;
                    this.camera.fov = 2 * Math.atan(heit / (2 * dist)) * (180 / Math.PI);
                    this.camera.aspect = this.window.innerWidth / cheit;
                    this.camera.updateProjectionMatrix();
                    this.renderer.setSize(this.window.innerWidth, cheit);
                }
                toString() {
                    return 'Engine';
                }
                addUpdateHandler(func) {
                    this.updateFunctions.push(func);
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
                        this.readyHandlers.map(e => e(this));
                    }
                }
                draw() {
                    var dt = this.clock.getDelta();
                    this.controls.update();
                    for (var i = 0; i < this.updateFunctions.length; i++) {
                        this.updateFunctions[i].call(this, dt);
                    }
                    this.renderer.render(this.scene, this.camera);
                }
            };
            exports_1("Engine", Engine);
        }
    };
});
//# sourceMappingURL=Engine.js.map