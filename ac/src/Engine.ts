import * as THREE from 'three'


export class Engine {
    private renderer: THREE.WebGLRenderer;
    public camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    constructor(element: HTMLElement) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        element.appendChild(this.renderer.domElement);

        window.addEventListener('resize', (e) => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix();
        })

        this.render = this.render.bind(this)
    }

    public start() {
        this.render()
    }

    render() {
        window.requestAnimationFrame(this.render)
        if (this.scene)
            this.renderer.render(this.scene, this.camera)
    }

    setScene(s: THREE.Scene) {
        if (this.scene)
            while (this.scene.children.length > 0)
                this.scene.remove(this.scene.children[0])

        this.scene = s
    }
}
