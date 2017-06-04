import * as THREE from 'three'

let s = new THREE.Scene()

let ah = new THREE.AxisHelper(100)
s.add(ah)

let gg = new THREE.PlaneBufferGeometry(100, 100)
let gm = new THREE.MeshBasicMaterial();
let ground = new THREE.Mesh(gg, gm);

ground.rotateX(THREE.Math.degToRad(-90))

s.add(ground);

export default s