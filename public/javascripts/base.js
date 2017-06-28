Number.prototype.map = function (in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

document.addEventListener('DOMContentLoaded', function () {
    let boxes = document.getElementsByClassName('ideasbox')
    if (boxes) {
        for (let i = 0; i < boxes.length; i++) {
            let b = boxes[i]
            let attr = b.getAttribute('data-url')
            if (attr)
                b.addEventListener('click', (e) => {
                    window.location = attr
                })
        }
    }

    let grt = document.getElementById('greeting')
    if (grt) {
        let str;
        let hr = new Date().getHours();
        if (hr < 12)
            str = 'Morning'
        else if (hr < 17)
            str = 'Afternoon'
        else str = 'Evening'
        grt.textContent = str
    }

    let breaks = document.getElementsByClassName('break')
    let ctx = []

    let breakHeight = 30
    let spread = 40
    let radius = 2.5
    let cnt = 6
    const mw = 1280

    for (let i = 0; i < breaks.length; i++) {
        let item = breaks[i]
        item.height = breakHeight
        item.style.height = breakHeight + 'px'
        ctx.push(item.getContext('2d'))
    }

    window.addEventListener('resize', function () {
        for (let i = 0; i < breaks.length; i++) {
            let item = breaks[i]
        }
    })

    let t = new Date().getTime()
    let pt = performance.now()

    function yy(x) {
        x &= 700
        x *= 3 ^ x
        x &= 500
        return (Math.sin(x + t * 1) * (breakHeight * .8) / 2) + breakHeight / 2 //((simplex.noise2D(x, t)) * (breakHeight * .9) / 2) + breakHeight / 2
    }

    function animate(timestamp) {
        let dt = (timestamp - pt) / 1000
        pt = timestamp
        cnt = 2 + Math.floor(Math.min(12, Math.max(3, document.body.clientWidth / 100)))

        let w = (spread * cnt)
        for (let i = 0; i < breaks.length; i++) {
            breaks[i].style.width = w * 1 + 'px'
            breaks[i].width = w * 1
            let c = ctx[i]
            c.clearRect(0, 0, c.canvas.width, c.canvas.height)
            for (let j = 0; j < cnt; j++) {
                function xx(num) {
                    return i + (num * spread) + (spread * .5 - radius * 2)
                }
                let x = xx(j)
                let y = yy(x)
                c.strokeStyle = '#bbb'
                c.beginPath()
                c.arc(i + x, y, radius, 0, Math.PI * 2)
                if (j < cnt - 1) {
                    let x2 = xx(j + 1)
                    let y2 = yy(x2)
                    c.lineTo(x2, y2)
                }
                c.stroke()
            }
        }
        t += dt || 0
        requestAnimationFrame(animate)
    }

    animate();
});