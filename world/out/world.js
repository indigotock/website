System.register(["Engine", "Environment", "stats.js"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function animate() {
        stats.begin();
        requestAnimationFrame(animate);
        engine.draw();
        stats.end();
    }
    function start() {
        if (Environment_1.Environment.supportsWebGL === false) {
            document.getElementsByClassName('spinner')[0].classList.add('hidden');
            return;
        }
        engine = new Engine_1.Engine(window)
            .whenReady(() => {
            document.getElementsByClassName('spinner')[0].classList.add('hidden');
            engine.renderer.domElement.classList.remove('hidden');
            animate();
        });
        engine.markLoaded(engine);
    }
    var Engine_1, Environment_1, stats_js_1, engine, stats;
    return {
        setters: [
            function (Engine_1_1) {
                Engine_1 = Engine_1_1;
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
            if (Environment_1.Environment.devMode) {
                console.debug('Running in dev mode');
                document.body.appendChild(stats.dom);
            }
            start();
        }
    };
});
//# sourceMappingURL=world.js.map