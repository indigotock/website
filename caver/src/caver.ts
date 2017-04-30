import { CaveWorld } from "CaveWorld";
import { Environment } from "Environment";
import Stats from "stats.js";
import * as THREE from "three";

let world: CaveWorld;

const stats = new Stats();
function animate() {
    stats.begin();
    const gr = world.ground;
    const d = new Date().getTime()/1000;
    gr.position.set(
        Math.sin(d)*100,
        200,
        Math.cos(d)*100,
    )
    requestAnimationFrame(animate);
    world.draw();
    stats.end();
}

function start() {
    if (Environment.supportsWebGL === false) {
        const msg = document.createElement("p");
        msg.innerText = "Your browser does not support WebGL and as such this will not work.";
        document.body.appendChild(msg);
        return;
    }
    if (Environment.devMode) {
        console.debug("Running in dev mode");
        document.body.appendChild(stats.dom);
    }
    world = new CaveWorld(document.getElementById("container"))
        .whenReady(() => { animate(); });
    world.markLoaded(world);

}

start();
