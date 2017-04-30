System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var AjaxShader;
    return {
        setters: [],
        execute: function () {
            AjaxShader = class AjaxShader {
                constructor(_vertexPath, _fragmentPath, callback) {
                    this.fragreq = new XMLHttpRequest();
                    this.doneCallback = callback;
                    this.vertexPath = '../shaders/' + _vertexPath;
                    this.fragmentPath = '../shaders/' + _fragmentPath;
                    this.setupRequest(this.vertexPath, (val) => {
                        this.vertexSource = val;
                        this.vertexDone = true;
                        if (this.fragmentDone)
                            this.finalise();
                    });
                    this.setupRequest(this.fragmentPath, (val) => {
                        this.fragmentSource = val;
                        this.fragmentDone = true;
                        if (this.vertexDone)
                            this.finalise();
                    });
                }
                toString() {
                    return `AjaxShader to ${[this.fragmentPath, this.vertexPath]}`;
                }
                finalise() {
                    this.doneCallback.call(this, this.fragmentSource, this.vertexSource);
                }
                setupRequest(dest, callback) {
                    if (fetch === undefined) {
                        const req = new XMLHttpRequest();
                        req.onreadystatechange = () => {
                            if (req.readyState === XMLHttpRequest.DONE) {
                                if (req.status === 200) {
                                    callback.call(null, req.responseText);
                                }
                                else {
                                    console.error(`Non-success HTTP response ${req.status} from shader request to ${dest}`);
                                }
                            }
                        };
                        req.open("GET", dest, true);
                        req.send();
                    }
                    else {
                        fetch(dest, {
                            method: 'get',
                        }).then((r) => {
                            return r.text();
                        }).then((response) => {
                            callback.call(null, response);
                        }).catch((err) => {
                            console.error(`Non-success HTTP response from shader request to ${dest}`);
                        });
                    }
                }
            };
            exports_1("AjaxShader", AjaxShader);
        }
    };
});
//# sourceMappingURL=AjaxShader.js.map