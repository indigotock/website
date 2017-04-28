export module Environment {
    export const supportsWebGL = (!QueryVariable('nowebgl')) && ((function () { try { return !!window['WebGLRenderingContext'] && !!document.createElement('canvas').getContext('experimental-webgl'); } catch (e) { return false; } })());
    export function QueryVariable(variable) {
        var args = window.location.search.substring(1).split("&");
        for (var i = 0; i < args.length; i++) {
            var pair = args[i].split("=");

            if (pair[0] == variable) {
                if (pair.length == 1) {
                    return true;
                } else {
                    return pair[1];
                }
            }
        }
        return undefined;
    }

    console.debug(`WebGL supported: ${supportsWebGL}`);
}