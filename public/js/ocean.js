var Ocean;
(function (Ocean) {
    var OceanCanvas = /** @class */ (function () {
        function OceanCanvas(canvas) {
            this.canvas = canvas;
            this.context = canvas.getContext('2d');
            this.resetCanvasDimensions();
            window.addEventListener('resize', this.resetCanvasDimensions.bind(this));
            this.turbulenceRate = 4; // 2 + (Math.random() * 5)
            this.time = new Date().getTime();
        }
        OceanCanvas.prototype.width = function () {
            return window.innerWidth;
        };
        OceanCanvas.prototype.height = function () {
            return window.innerHeight;
        };
        OceanCanvas.prototype.resetCanvasDimensions = function () {
            this.canvas.width = this.width();
            this.canvas.height = this.height();
        };
        OceanCanvas.prototype.draw = function () {
            this.context.clearRect(0, 0, this.width(), this.height());
            this.context.strokeStyle = 'transparent';
            this.time += .005;
            for (var i = 0; i < 4; i++) {
                this.drawWave(i * 50, i);
            }
            window.requestAnimationFrame(this.draw.bind(this));
        };
        OceanCanvas.prototype.drawWave = function (yOffset, index) {
            var segmentWidth = 10;
            var segmentCount = Math.ceil(this.width() / segmentWidth) + 1;
            var startY = yOffset + (this.height() / 8 * 7);
            this.context.save();
            this.context.beginPath();
            this.context.moveTo(0, startY);
            this.context.fillStyle = window.getComputedStyle(this.canvas).color;
            function getValue(wave, time) {
                function turbulence(x, y, f) {
                    var t = -.5;
                    for (; f <= this.width() / 12; f *= 2) // W = Image width in pixels
                        t += Math.abs(noise.simplex2(x, y) / f);
                    return t;
                }
                var noise = window.noise;
                return turbulence.bind(this)(time + (index * 100), wave / 20, this.turbulenceRate) * 100;
            }
            for (var i = 0; i < segmentCount; i++) {
                this.context.lineTo(i * segmentWidth, startY + getValue.bind(this)(i, this.time));
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
window.addEventListener('DOMContentLoaded', function () {
    var element = document.getElementById('background');
    if (!element)
        return;
    var ocean = new Ocean.OceanCanvas(element);
    ocean.draw();
});
