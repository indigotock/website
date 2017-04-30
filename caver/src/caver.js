System.register(["CaveWorld", "Environment", "stats.js"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function animate() {
        stats.begin();
        const gr = world.ground;
        const d = new Date().getTime() / 1000;
        gr.position.set(Math.sin(d) * 100, 200, Math.cos(d) * 100);
        requestAnimationFrame(animate);
        world.draw();
        stats.end();
    }
    function start() {
        if (Environment_1.Environment.supportsWebGL === false) {
            const msg = document.createElement("p");
            msg.innerText = "Your browser does not support WebGL and as such this will not work.";
            document.body.appendChild(msg);
            return;
        }
        if (Environment_1.Environment.devMode) {
            console.debug("Running in dev mode");
            document.body.appendChild(stats.dom);
        }
        world = new CaveWorld_1.CaveWorld(document.getElementById("container"))
            .whenReady(() => { animate(); });
        world.markLoaded(world);
    }
    var CaveWorld_1, Environment_1, stats_js_1, world, stats;
    return {
        setters: [
            function (CaveWorld_1_1) {
                CaveWorld_1 = CaveWorld_1_1;
            },
            function (Environment_1_1) {
                Environment_1 = Environment_1_1;
            },
            function (stats_js_1_1) {
                stats_js_1 = stats_js_1_1;
            }
        ],
        execute: function () {
            stats = new stats_js_1.default();
            start();
        }
    };
});
//# sourceMappingURL=caver.js.map