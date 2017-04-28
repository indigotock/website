import { Star } from "./Bodies/Star";
import { Planet } from "./Bodies/Planet";
import { SimplePlanet } from "./Bodies/SimplePlanet";
import { Environment } from "./Environment";
import { ICelestialBody } from "./Bodies/ICelestialBody";
import { StarMaterial } from "./Materials/StarMaterial";

export class Engine {
    private readyHandlers: Function[] = [];
    private updateFunctions: ((number) => void)[] = [];
    private loadRequirements: Set<any> = new Set();

    public whenReady(callback: Function): Engine {
        this.readyHandlers.push(callback);
        return this;
    }

    public planet: Planet;
    public readonly star: ICelestialBody;
    public static Instance: Engine;
    private readonly clock: THREE.Clock;
    public readonly camera: THREE.PerspectiveCamera;
    public readonly controls: THREE.OrbitControls;
    public readonly renderer: THREE.Renderer;
    public readonly scene: THREE.Scene;
    public readonly window: Window;
    public readonly raycaster: THREE.Raycaster;
    public readonly container: Element;

    constructor(_window: Window) {
        const that = this;
        this.addLoadRequirement(this);
        Engine.Instance = this;
        this.clock = new THREE.Clock(true);
        this.window = _window;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, 1, .1, Number.MAX_SAFE_INTEGER);

        if (Environment.supportsWebGL)
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
            });
        else
            this.renderer = new THREE.CanvasRenderer();

        this.container = this.window.document.getElementsByTagName('main')[0];
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = false;
        this.controls.enableZoom = false;
        this.controls.rotateSpeed /= 10;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = .12
        this.container.appendChild(this.renderer.domElement);
        this.renderer.domElement.classList.add('hidden');

        this.raycaster = new THREE.Raycaster();

        function makeplanet() {
            if (that.planet != null) {
                that.planet.mesh.children.forEach(element => {
                    element.parent.remove(element);
                });
                that.scene.remove(that.planet.mesh);
            }
            that.planet = new Planet(100, "tex2.png");
            that.camera.position.set(0, 0, that.planet.radius * 2.5);
        }

        this.container.addEventListener('dblclick', function (e) {
            makeplanet();
        })


        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(2, 1, 1);
        this.scene.add(light);

        var canv = this.renderer.domElement;

        // canv.addEventListener('wheel', function (e) {
        //     that.controls.rotateLeft(e.deltaX / 10000);
        //     that.controls.rotateUp(e.deltaY / 10000);
        // });
        this.window.addEventListener('resize', () => {
            this.onWindowResize();
        }, false);

        makeplanet();



        this.onWindowResize()
    }

    private onWindowResize() {
        var cheit = Math.min(600, this.window.innerWidth);

        var dist = this.camera.position.length();
        var heit = this.planet.radius * 3;
        this.camera.fov = 2 * Math.atan(heit / (2 * dist)) * (180 / Math.PI);
        this.camera.aspect = this.window.innerWidth / cheit;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.window.innerWidth, cheit);

    }

    public toString() {
        return 'Engine'
    }

    public addUpdateHandler(func: (number) => void) {
        this.updateFunctions.push(func);
    }

    public addLoadRequirement(obj: any) {
        if (this.loadRequirements.has(obj))
            console.debug(`Attempted to add existing load requirement ${obj}`)
        else {
            console.debug(`Added load requirement ${obj}`)
            this.loadRequirements.add(obj);
        }
    }

    public markLoaded(obj: any) {
        console.debug(`Loaded ${obj}`)
        this.loadRequirements.delete(obj);

        if (this.loadRequirements.size == 0) {
            this.readyHandlers.map(e => e(this));
        }
    }

    public draw() {
        var dt = this.clock.getDelta();

        this.controls.update();

        for (var i = 0; i < this.updateFunctions.length; i++) {
            this.updateFunctions[i].call(this, dt);
        }
        this.renderer.render(this.scene, this.camera);
    }
}