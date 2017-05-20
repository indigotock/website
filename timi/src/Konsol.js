export default class Konsol {
    constructor(element, rows, columns) {
        this.element = element;
        this.numRows = rows;
        this.numCols = columns
        element.style.width = columns + 'ch';
        this.rows = new Array()
        this.buffer = []
        for (let i = rows; i > 0; i--) {
            let l = document.createElement('span')
            l.classList.add('consoleLine')
            l.id = 'console_row_' + i
            // l.innerText = 'line ' + i
            this.rows.push(l);
            element.appendChild(l)
        }
        let trail = document.createElement('span');
        trail.innerText = '> '
        trail.classList.add('trail')

        let d = document.createElement('div');
        d.appendChild(trail);

        let c = document.createElement('input')
        trail.classList.add('consoleLine')
        c.classList.add('consoleLine')
        c.classList.add('consoleInput')
        d.appendChild(c);
        element.appendChild(d);
        this.inputLine = c;

        this.currentLine = 0;

        c.addEventListener('keyup', (e) => {
            if (e.keyCode == 13) {
                this.writeText(c.value);
                c.value = ''
            }
        })

        element.addEventListener('click', () => {
            this.inputLine.focus();
        })

        element.addEventListener('mousewheel', (e) => {
            if (Math.abs(e.deltaY) >= 1) {
                if (e.deltaY > 0)
                    this.scrollUp()
                else
                    this.scrollDown()
                e.preventDefault()
            }
        })

        this.index = 0
    }

    getBufferText (i) {
        return this.buffer[i] || ''
    }

    scrollUp () {
        this.index = Math.min(this.numRows, this.index - 1)
        this.updateRows()
    }

    updateRows () {
        let idx = Math.max(this.index, this.numRows - (this.buffer.length + 1))
        let buf = this.buffer.slice()
        for (let i = 0; i < this.numRows; i++) {
            let next = buf[i - idx] || ''

            this.rows[this.numRows - 1 - i].innerText = next
        }
    }

    scrollDown () {
        this.index = Math.max(this.numRows, this.index + 1)
        this.updateRows()
    }

    writeLine (str) {
        str = (str || '').toString()
        str = str.substring(0, this.numCols)
        this.buffer.unshift(str);
        this.index = 0;
        this.updateRows()
        // this.pushUp()
    }

    writeText (str) {
        str = (str || '').toString().match(new RegExp(`.{1,${this.numCols}}`, 'g')) || []
        str.map(e => {
            this.writeLine(e)
        })
    }
}