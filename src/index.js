import '../node_modules/normalize.css/normalize.css'
import './css/style.scss'
import './css/print.css'

var SimplexNoise = require('simplex-noise'),
    simplex = new SimplexNoise(Math.random)

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

let breakHeight = 40
let spread = 50
let radius = 2.5
let cnt = 0


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

let t = 0
function animate () {
    cnt = Math.floor(window.innerWidth / spread)
    for (let i = 0; i < breaks.length; i++) {
        breaks[i].style.width = (spread * cnt) + 'px'
        breaks[i].width = spread * cnt
        let c = ctx[i]
        c.clearRect(0, 0, c.canvas.width, c.canvas.height)
        for (let j = 0; j < cnt; j++) {
            function xx (num) {
                return (num * spread) + (spread * .5 - radius * 2)
            }
            let x = xx(j)
            let y = ((simplex.noise2D(x, t)) * (breakHeight * .9) / 2) + breakHeight / 2
            console.log()
            c.strokeStyle = '#bbb'
            c.beginPath()
            c.arc(i + x, y, radius, 0, Math.PI * 2)
            if (j < cnt - 1) {
                let x2 = xx(j + 1)
                let y2 = ((simplex.noise2D(x2, t)) * (breakHeight * .9) / 2) + breakHeight / 2
                c.lineTo(x2, y2)
            }
            c.stroke()
        }
    }
    t += .0025
    requestAnimationFrame(animate)
}

animate();