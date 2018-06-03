const $ = (...x) => document.querySelector(...x)

const Noise = {
    wave: 0,
    bob: 1,
    roll: 2,
    base: 3,
    intensity: 4,
    tilt: 5
}

function go() {
    console.log('go!')

    const canvas = $('#background')
    const context = canvas.getContext('2d')
    const width = () => window.innerWidth / 1
    const height = () => window.innerHeight / 1
    const noises = []
    for (const key in Noise) {
        if (Noise.hasOwnProperty(key)) {
            noises.push(new window.Noise(Math.random()))
        }
    }


    function noise(ind) {
        return noises[ind]
    }

    function resize() {
        canvas.width = width()
        canvas.height = height()
    }

    window.addEventListener('resize', resize)
    resize()


    function step() {
        const SEGMENT_LENGTH = 60
        const NUM_SEGMENTS = Math.ceil(width() / SEGMENT_LENGTH) + 2
        const NUM_WAVES = 5
        const MAX_ROLL = 10
        const time = Date.now() / 3000

        context.clearRect(0, 0, width(), height())
        context.fillStyle = window.getComputedStyle(canvas).color


        function point(x, y, z, noize) {
            return noise(noize || Noise.wave).simplex3(x, y, z)
        }

        function turbulence(x, y, z, f) {
            var t = -.5;
            for (; f <= 12; f *= 2) {
                t += Math.abs(point(x, y, z) / f);
            }
            return t;
        }


        for (let wave = 0; wave < NUM_WAVES; wave++) {
            const tS = time

            function offset(wave) {
                var diff = 1 + ((NUM_WAVES - wave) / 5);
                return (((wave) * diff) * 5) + noise(Noise.bob).simplex2(wave, tS) * 20
            }
            let wS = wave * SEGMENT_LENGTH
            context.translate(width() / 2, height() / 9 * 8)
            context.save()
            context.beginPath()
            let roll = (point(tS, wS, 0, Noise.tilt) * MAX_ROLL)
            roll *= Math.PI / 180
            for (let segment = 0; segment < NUM_SEGMENTS; segment++) {
                context.rotate(roll)
                let sS = (segment) * SEGMENT_LENGTH
                let dX = ((segment - (NUM_SEGMENTS / 2)) * SEGMENT_LENGTH)

                let dY =  point(sS * 3, 65535 + wS, tS) * 10

                dY += point(sS / 2, wS, 6 + tS, Noise.intensity) * 20
                dY += point(sS / 1000, wS, 655 + tS, Noise.base) * 70
                context.lineTo(dX + (point(sS, wS, tS, Noise.roll)),
                    (offset(wave)) + dY)
                context.rotate(-roll)
            }
            context.lineTo(width() / 2, height() / 2);
            context.lineTo(width() * -.5, height() / 2);
            context.clip()
            context.fillRect(width() * -.5, height() * -.5, width() * 1.5, height() * 1.5)
            context.restore()
            context.translate(-width() / 2, -height() / 9 * 8)
        }

        requestAnimationFrame(step)
    }

    context.fillStyle = window.getComputedStyle(canvas).color
    context.strokeStyle = "transparent"
    requestAnimationFrame(step)

    return true
}


window.addEventListener('DOMContentLoaded', go);