module Ocean {
    export class OceanCanvas {
        waveNoise: any;
        intensityNoise: any;
        baseNoise: any;
        turbulenceRate: number;
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
        time: number;
        readonly numWaves: number;

        constructor(canvas: HTMLCanvasElement) {
            this.canvas = canvas;
            this.context = canvas.getContext("2d");
            this.resetCanvasDimensions();

            window.addEventListener("resize", this.resetCanvasDimensions.bind(this));

            this.turbulenceRate = 10;

            this.time = new Date().getTime();

            this.baseNoise = new (window as any).Noise(Math.random());
            this.waveNoise = new (window as any).Noise(Math.random());
            this.intensityNoise = new (window as any).Noise(Math.random());

            this.numWaves = 4;

        }

        width(): number {
            return window.innerWidth;
        }

        height(): number {
            return window.innerHeight;
        }

        resetCanvasDimensions(): void {
            this.canvas.width = this.width();
            this.canvas.height = this.height();
        }

        draw(): void {
            this.context.clearRect(0, 0, this.width(), this.height());

            this.context.strokeStyle = "transparent";

            this.time += .005;

            for (var i: number = 0; i < this.numWaves; i++) {
                this.drawWave(i * 50, i, 1 + ((this.numWaves - i) / 2));
            }
            window.requestAnimationFrame(this.draw.bind(this));
        }

        drawWave(yOffset: number, index: number, speedModifier: number): void {

            var segmentWidth: number = 10;
            var segmentCount: number = Math.ceil(this.width() / segmentWidth) + 1;
            var heightOffs: number = this.baseNoise.simplex2(this.time, 65535 + (index * 50)) * 20;
            var startY: number = heightOffs + (this.height() / 1) - yOffset;


            this.context.save();

            this.context.beginPath();
            this.context.moveTo(0, startY);
            this.context.fillStyle = window.getComputedStyle(this.canvas).color;


            function getValue(wave: number, time: number): number {

                function applyWave(value: number): number {
                    var intensity: number = this.intensityNoise.simplex2(this.time, 0) + 1.5;
                    var scale: number = (this.waveNoise.simplex2(this.time + (index * .1), wave / 100) * 2);
                    scale = Math.max(1, scale);
                    return (value * scale);
                }

                function turbulence(x: number, y: number, f: number): number {
                    var t: number = -.5;
                    for (; f <= segmentCount / 12; f *= 2) {
                        t += Math.abs(this.baseNoise.simplex2((x), y) / f);
                    }
                    return t;
                }

                var value: number = turbulence.bind(this)((time * speedModifier) + (index * 1), (wave) / 20, this.turbulenceRate) * 100;

                return applyWave.bind(this)(value);
            }

            for (var i: number = 0; i < segmentCount; i++) {
                this.context.lineTo(i * segmentWidth, startY + getValue.bind(this)(i, this.time));
            }

            this.context.lineTo(this.width(), this.height());
            this.context.lineTo(0, this.height());

            this.context.clip();

            this.context.fillRect(0, 0, this.width(), this.height());

            this.context.restore();
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    var element: HTMLElement = document.getElementById("background");
    if (!element) {
        return;
    }
    var ocean: Ocean.OceanCanvas = new Ocean.OceanCanvas(element as HTMLCanvasElement);

    ocean.draw();
});