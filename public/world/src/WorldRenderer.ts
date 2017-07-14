import World from "./World"
import WorldMaterial from "./WorldMaterial"
import * as THREE from 'three'

export interface WorldRendererOptions {
    width: number, height: number
}

export class WorldRenderer {
    public options: WorldRendererOptions = {
        width: 800,
        height: 600,
    }

    public readonly renderer: THREE.Renderer
    public readonly scene: THREE.Scene
    public readonly camera: THREE.Camera

    private worldMesh: THREE.Mesh

    public get canvas(): HTMLCanvasElement {
        return this.renderer.domElement;
    }


    constructor(public readonly world: World, public readonly container: HTMLElement, opts?: Partial<WorldRendererOptions>) {
        this.options = Object.assign(this.options, opts)
        this.renderer = new THREE.WebGLRenderer({ alpha: true })
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(65, this.options.width / this.options.height, .001, 1500)
        this.container.appendChild(this.canvas)

        this.camera.position.set(0, 0, world.radius * 2.5)

        this.applyOptions();

        this.canvas.style.border = 'solid 1px black'

        this.worldMesh = this.createWorldMesh()
        this.worldMesh.rotateZ(-6)

        this.scene.add(this.worldMesh)
        let light = new THREE.AmbientLight(0x404040)
        light.position.set(0, 1000, 1500)
        this.scene.add(light)
        this.render()
    }

    private render() {
        this.update()
        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.render.bind(this))
    }

    private update() {
        this.worldMesh.rotateY(-.005)
    }

    public createWorldMesh() {
        let baseg = new THREE.CubeGeometry(1, 1, 1, 50, 50, 50)
        let mxh = 0
        let mnh = Number.MAX_VALUE
        baseg.vertices.forEach(e => {
            let h = this.world.terrain.getTerrainAtPoint(e).height
            e.normalize().multiplyScalar(this.world.radius + h)
            if (h > mxh)
                mxh = h
            if (h < mnh)
                mnh = h
        })

        baseg.verticesNeedUpdate = true
        baseg.computeVertexNormals()
        return new THREE.Mesh(baseg, new WorldMaterial(this.world, mxh, mnh))
    }

    private applyOptions() {
        this.canvas.width = this.options.width
        this.canvas.height = this.options.height
        this.renderer.setSize(this.options.width, this.options.height)
        if (this.camera instanceof THREE.PerspectiveCamera) {
            this.camera.aspect = this.options.width / this.options.height
        }
    }
}