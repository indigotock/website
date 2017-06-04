import { Engine } from './Engine'
import TestScene from './scenes/TestScene'

let e = new Engine(document.getElementById('container'));
e.setScene(TestScene)
e.camera.position.set(0, 10, 100)
e.start()