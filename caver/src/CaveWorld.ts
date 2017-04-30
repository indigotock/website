import * as THREE from "three";
import { TriplanarMaterial } from "TriplanarMaterial";

export class CaveWorld {
    public static Instance: CaveWorld;
    public ground: THREE.Mesh;
    public camera: THREE.Camera;
    private loadRequirements: Set<any>;
    private scene: THREE.Scene;
    private clock: THREE.Clock;
    private renderer: THREE.WebGLRenderer;
    private readyHandlers: Array<((w: CaveWorld) => void)> = [];

    constructor(public container: HTMLElement) {
        this.loadRequirements = new Set<any>();
        this.addLoadRequirement(this);
        this.scene = new THREE.Scene();
        this.ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100),
            new TriplanarMaterial("dirt.jpg", this));
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

    public draw() {
        const dt = this.clock.getDelta();

        // this.controls.update();

        // for (var i = 0; i < this.updateFunctions.length; i++) {
        //     this.updateFunctions[i].call(this, dt);
        // }
        this.renderer.render(this.scene, this.camera);
    }

    public whenReady(callback: (w: CaveWorld) => void): CaveWorld {
        this.readyHandlers.push(callback);
        return this;
    }

    public addLoadRequirement(obj: any) {
        if (this.loadRequirements.has(obj))
            console.debug(`Attempted to add existing load requirement ${obj}`);
        else {
            console.debug(`Added load requirement ${obj}`);
            this.loadRequirements.add(obj);
        }
    }

    public markLoaded(obj: any) {
        console.debug(`Loaded ${obj}`);
        this.loadRequirements.delete(obj);

        if (this.loadRequirements.size === 0) {
            this.readyHandlers.map((e) => e(this));
        }
    }
}
