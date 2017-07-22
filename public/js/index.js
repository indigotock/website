document.addEventListener('DOMContentLoaded', function () {
    let breaks = document.getElementsByClassName('break')

    let breakHeight = 30
    let spread = 40
    let radius = 2.5
    let cnt = 6
    const colour = window.getComputedStyle(document.body).getPropertyValue('color')
    const mw = 1280
    const svgns = 'http://www.w3.org/2000/svg'

    for (let i = 0; i < breaks.length; i++) {
        let item = breaks[i]
        item.setAttribute('height', breakHeight + '')
        item.setAttribute('version', 1.1 + '')
        item.setAttribute('xmlns', svgns)
        item.setAttribute('height', breakHeight + '')
    }

    window.addEventListener('resize', function () {
        for (let i = 0; i < breaks.length; i++) {
            let item = breaks[i]
        }
    })

    let t = new Date().getTime()
    let pt = performance.now()

    function yy(x) {
        return (Math.sin(x + t * 1) * (breakHeight * .8) / 2) + breakHeight / 2 //((simplex.noise2D(x, t)) * (breakHeight * .9) / 2) + breakHeight / 2
    }

    function getCircle(svg, index) {
        let ret = svg.getElementsByTagName('circle')[index]

        if (ret) return ret
        ret = document.createElementNS(svgns, 'circle')
        svg.appendChild(ret)
        ret.setAttribute('r', 5 / 2)
        ret.setAttribute('fill', 'transparent')
        ret.setAttribute('stroke-width', 2)
        return ret
    }

    function getLine(svg, index) {
        let ret = svg.getElementsByTagName('line')[index]

        if (ret) return ret
        ret = document.createElementNS(svgns, 'line')
        ret.setAttribute('stroke-width', 2)
        svg.appendChild(ret)
        return ret
    }

    function animate(timestamp) {
        let dt = (timestamp - pt) / 1000
        pt = timestamp
        cnt = 2 + Math.floor(Math.min(12, Math.max(3, document.body.clientWidth / 100)))

        let w = (spread * cnt)
        for (let i = 0; i < breaks.length; i++) {
            let svg = breaks[i]
            svg.setAttribute('width', w)
            for (let j = 0; j < cnt; j++) {
                let circ = getCircle(svg, j)

                function xx(num) {
                    return i + (num * spread) + (spread * .5 - radius * 2)
                }
                let x = xx(j)
                let y = yy(x)
                circ.setAttribute('cx', x)
                circ.setAttribute('cy', y)
                if (j < cnt - 1) {
                    let line = getLine(svg, j)
                    let x2 = xx(j + 1)
                    let y2 = yy(x2)
                    line.setAttribute('x1', x)
                    line.setAttribute('x2', x2)
                    line.setAttribute('y1', y)
                    line.setAttribute('y2', y2)
                } else if (j < cnt) {
                    let line = getLine(svg, j)
                    line.setAttribute('x1', -10)
                    line.setAttribute('x2', -10)
                    line.setAttribute('y1', -10)
                    line.setAttribute('y2', -10)
                }
            }
        }
        t += dt || 0
        requestAnimationFrame(animate)
    }

    animate(null);
});