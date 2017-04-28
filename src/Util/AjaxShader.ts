export class AjaxShader {
    private doneCallback: (f: string, v: string) => void;
    private vertexSource: string;
    private fragmentSource: string;
    private vertexPath: string;
    private fragmentPath: string;
    private vertexDone: boolean;
    private fragmentDone: boolean;
    private fragreq: XMLHttpRequest;
    private vertreq: XMLHttpRequest;

    private finalise() {
        this.doneCallback.call(this, this.fragmentSource, this.vertexSource);
    }

    constructor(_vertexPath: string, _fragmentPath: string, callback: (f: string, v: string) => void) {
        this.fragreq = new XMLHttpRequest();
        this.doneCallback = callback;

        this.vertexPath = './shaders/' + _vertexPath;
        this.fragmentPath = './shaders/' + _fragmentPath;

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

    public toString(){
        return `AjaxShader to ${[this.fragmentPath, this.vertexPath]}`
    }

    private setupRequest(dest: string, callback: Function) {
        if (fetch === undefined) {
            var req = new XMLHttpRequest();

            req.onreadystatechange = function () {
                if (req.readyState == XMLHttpRequest.DONE) {
                    if (req.status == 200) {
                        callback.call(null, req.responseText);
                    }
                    else {
                        console.error(`Non-success HTTP response ${req.status} from shader request to ${dest}`);
                    }
                }
            };

            req.open("GET", dest, true);
            req.send();
        } else {
            fetch(dest, {
                method: 'get'
            }).then((r)=>{
                return r.text()
            }).then(function (response) {
                callback.call(null, response);
            }).catch(function (err) {
                console.error(`Non-success HTTP response from shader request to ${dest}`);
            });
        }
    }
}