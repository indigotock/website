import { Star } from './Bodies/Star'
import { Planet } from './Bodies/Planet'
import { Engine } from './Engine'
import { ICelestialBody } from "./Bodies/ICelestialBody";
import { Environment } from "./Environment";
import Stats from 'stats.js';

var engine: Engine;

var stats = new Stats();
if (Environment.QueryVariable('dev'))
    document.body.appendChild(stats.dom);

function animate() {
    stats.begin();
    requestAnimationFrame(animate);
    engine.draw();
    stats.end();
}


function start() {
    if (Environment.supportsWebGL == false) {
        document.getElementsByClassName('spinner')[0].classList.add('hidden');
        return;
    }
    engine = new Engine(window)
        .whenReady(() => {
            document.getElementsByClassName('spinner')[0].classList.add('hidden');
            engine.renderer.domElement.classList.remove('hidden');
            animate();
        });
    engine.markLoaded(engine)
}

start();