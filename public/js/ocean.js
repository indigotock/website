var Ocean;
(function (Ocean) {
    var OceanCanvas = /** @class */ (function () {
        function OceanCanvas(canvas) {
            this.canvas = canvas;
            this.context = canvas.getContext("2d");
            this.resetCanvasDimensions();
            window.addEventListener("resize", this.resetCanvasDimensions.bind(this));
            this.turbulenceRate = 10;
            this.time = new Date().getTime();
            this.baseNoise = new window.Noise(Math.random());
            this.waveNoise = new window.Noise(Math.random());
            this.intensityNoise = new window.Noise(Math.random());
            this.numWaves = 5;
        }
        OceanCanvas.prototype.width = function () {
            return window.innerWidth;
        };
        OceanCanvas.prototype.height = function () {
            return window.innerHeight;
        };
        OceanCanvas.prototype.scaledTime = function () {
            return this.time / 2500;
        };
        OceanCanvas.prototype.resetCanvasDimensions = function () {
            this.canvas.width = this.width();
            this.canvas.height = this.height();
        };
        OceanCanvas.prototype.draw = function () {
            this.time = Date.now();
            this.context.clearRect(0, 0, this.width(), this.height());
            this.context.strokeStyle = "transparent";
            function offset(i) {
                var diff = 1 + ((((this.numWaves - i) / 5)));
                return ((i) * diff) * 20;
            }
            for (var i = 0; i < this.numWaves + 1; i++) {
                this.drawWave(offset.bind(this)(i), i, .8 + ((this.numWaves / (i + 1)) * .33));
            }
            window.requestAnimationFrame(this.draw.bind(this));
        };
        OceanCanvas.prototype.drawWave = function (yOffset, index, speedModifier) {
            var segmentWidth = 10;
            var segmentCount = Math.ceil(this.width() / segmentWidth) + 1;
            var heightOffs = this.baseNoise.simplex2(this.scaledTime(), 65535 + (index * 50)) * 20;
            var startY = (heightOffs + (this.height() / 1) - yOffset) + 20;
            this.context.save();
            this.context.beginPath();
            this.context.moveTo(0, startY);
            this.context.fillStyle = window.getComputedStyle(this.canvas).color;
            function getValue(wave, time) {
                function applyWave(value) {
                    var intensity = this.intensityNoise.simplex2(time, 0) + 1.5;
                    var scale = (this.waveNoise.simplex2(time + (index * .1), wave / 100) * 2);
                    scale = Math.max(1, scale);
                    return (value * scale);
                }
                function turbulence(x, y, f) {
                    var t = -.5;
                    for (; f <= 192 / 12; f *= 2) {
                        t += Math.abs(this.baseNoise.simplex2((x), y) / f);
                    }
                    return t;
                }
                var value = turbulence.bind(this)((time * speedModifier) + (index * 1), (wave) / 20, this.turbulenceRate) * 100;
                return applyWave.bind(this)(value);
            }
            for (var i = 0; i < segmentCount; i++) {
                this.context.lineTo(i * segmentWidth, startY + getValue.bind(this)(i, this.scaledTime()));
            }
            this.context.lineTo(this.width(), this.height());
            this.context.lineTo(0, this.height());
            this.context.clip();
            this.context.fillRect(0, 0, this.width(), this.height());
            this.context.restore();
        };
        return OceanCanvas;
    }());
    Ocean.OceanCanvas = OceanCanvas;
})(Ocean || (Ocean = {}));
window.addEventListener("DOMContentLoaded", function () {
    var element = document.getElementById("background");
    if (!element) {
        return;
    }
    var ocean = new Ocean.OceanCanvas(element);
    ocean.draw();
});
