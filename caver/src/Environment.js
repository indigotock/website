System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Environment;
    return {
        setters: [],
        execute: function () {
            (function (Environment) {
                Environment.devMode = (QueryVariable('dev') ||
                    location.hostname === "localhost" ||
                    location.hostname === "127.0.0.1");
                Environment.supportsWebGL = (!QueryVariable('nowebgl')) && ((function () { try {
                    return !!window['WebGLRenderingContext'] && !!document.createElement('canvas').getContext('experimental-webgl');
                }
                catch (e) {
                    return false;
                } })());
                function QueryVariable(variable) {
                    var args = window.location.search.substring(1).split("&");
                    for (var i = 0; i < args.length; i++) {
                        var pair = args[i].split("=");
                        if (pair[0] === variable) {
                            if (pair.length === 1) {
                                return true;
                            }
                            else {
                                return pair[1];
                            }
                        }
                    }
                    return undefined;
                }
                Environment.QueryVariable = QueryVariable;
                console.debug(`WebGL supported: ${Environment.supportsWebGL}`);
            })(Environment || (Environment = {}));
            exports_1("Environment", Environment);
        }
    };
});
//# sourceMappingURL=Environment.js.map