import {
    KPU,
    Register
} from "./kpu.js";
import {
    getOpcode,
    Instruction
} from "./instruction.js"
import {
    Parser
} from "./parser.js";
import {
    Tokenise
} from "./lexer.js";

let cpu = new KPU(0xffff + 1);

window.cpu = function () {
    return cpu
}

function debounce(func, delay = 1000) {
    let inDebounce
    return function () {
        const context = this
        const args = arguments
        clearTimeout(inDebounce)
        inDebounce = setTimeout(() =>
            func.apply(context, args), delay)
    }
}

const TICKS_PER_SECOND = 1000 / 1

var intervalId

function runUntilNop() {

    intervalId = setInterval(function () {
        var pc = cpu.registers[Register.PC]
        var instruction = Instruction.build(cpu, pc)
        if (!instruction || instruction.op == getOpcode('NOP')) {
            Vue.nextTick(function () {
                kpuApp.stop()
            })
            return
        }
        Vue.set(kpuApp, 'registers', cpu.registers)
        Vue.set(kpuApp, 'memory', cpu.memory)
        console.log(instruction)
        cpu.setRegister(Register.PC, cpu.registers[Register.PC] + instruction.length)
        instruction.execute(cpu)
    }, TICKS_PER_SECOND)

    requestAnimationFrame(anim)

    function anim() {
        if (intervalId)
            requestAnimationFrame(anim)
    }
}

function toHex(number = 0, places = 1) {
    let ret = number.toString(16)
    while (ret.length < places)
        ret = "0" + ret
    return ret
}

Vue.filter('toHex', toHex)

function writeInstructions(cpu, lexemes, position = 0) {
    lexemes.forEach(lexeme => {
        lexeme.write(cpu, position, function (arr, ind, val) {
            Vue.set(arr, ind, val)
        });
        position += lexeme.length;
    });
}

Vue.component('virtual-list', VirtualScrollList)

Vue.component('menu-item', {
    template: "#template-menu-item",
    props: ['label', 'iconClass', 'executeEvent', 'disableCondition', 'tooltip'],
    methods: {
        clickHandle: function (ev) {
            console.log(this.label, 'event:', this.executeEvent)
            this.$emit('action-event', this.executeEvent)
        }
    },
    computed: {
        isDisabled: function () {
            if (!this.disableCondition)
                return false
            return this.disableCondition()
        }
    }
})

Vue.component('memory-dump', {
    template: "#template-memory-dump",
    props: ['rows', 'cols', 'data', 'highlights', 'programCounter'],
    data: function () {
        return {
            page: 0
        }
    },
    computed: {
        rowLength: function () {
            return this.cols
        },
        startRow: function () {
            return this.clampedPage * this.rows
        },
        currentPageIndicator: function () {
            return `${this.clampedPage} / ${this.clampedPage}`
        },
        maxPages: function () {
            return Math.ceil(this.data.length / this.pageSize) - 1
        },
        pageSize: function () {
            return this.rows * this.cols
        },
        clampedPage: function () {
            return Math.max(Math.min(this.maxPages, this.page), 0)
        }
    },
    methods: {
        shouldHighlight: function (row, col) {
            return (this.getRowLocation(row) + col) == this.programCounter
        },
        nextPage: function () {
            this.page = Math.min(this.maxPages, this.clampedPage + 1)
        },
        previousPage: function () {
            this.page = Math.max(0, this.clampedPage - 1)
        },
        getRowLocation: function (row) {
            return (row + this.startRow) * this.rowLength
        },
        getValue: function (row, col) {
            return this.data[this.getRowLocation(row) + col]
        }
    }
})



window.kpuApp = new Vue({
    el: '#kpu-app',
    data: function () {
        return {
            title: 'KPU Simulator',
            version: '2.0.1b',
            code: 'mov a 1\nmul a a\nmul a a',
            menuItems: [{
                label: "Build",
                iconClass: "download",
                executeEvent: "build",
                tooltip: "Compiles the code and uploads it to the KPU"
            }, {
                label: "Run",
                iconClass: "play",
                executeEvent: "run",
                disableCondition: () => {
                    return this.isRunning
                },
                tooltip: "Executes the code until it reaches a NOP operation"
            }, {
                label: "Halt",
                iconClass: "stop",
                executeEvent: "stop",
                disableCondition: () => {
                    return !this.isRunning
                },
                tooltip: "Stops the KPU"
            }, {
                label: "Step",
                iconClass: "step-forward",
                executeEvent: "step",
                tooltip: "Executes the next instruction"
            }, {
                label: "Reset",
                iconClass: "undo",
                executeEvent: "reset",
                tooltip: "Resets the KPU to an empty state"
            }],
            isRunning: false,
            memory: new Array(cpu.memory.length),
            registers: new Array(cpu.registers.length),
        }
    },
    computed: {
        programCounter: function () {
            return cpu.registers[Register.PC]
        }
    },
    mounted: function () {
        this.hookCpuEvents(cpu)
        this.reset()
    },
    methods: {
        hookCpuEvents: function (cpu) {
            var that = this
            // cpu.onUpdateMemory(function (ind, newv, oldv) {
            //     Vue.set(that.memory, ind, newv)
            // })
            // cpu.onUpdateRegister(function (reg, newv, oldv) {
            //     console.log('Changing register', arguments)
            //     Vue.set(that.registers, reg, newv)
            // })
        },
        receiveActionEvent: function (action) {
            if (action == 'build') {
                this.reset()
                this.compile(this.code)
            } else if (action == 'reset') {
                this.reset()
            } else if (action == 'run') {
                this.isRunning = true
                runUntilNop()
            } else if (action == 'stop') {
                this.stop()
            }
            console.log(arguments, action)
        },
        stop: function () {
            this.isRunning = false
            clearInterval(intervalId)
            intervalId = false
        },
        compile: function () {
            let parser = new Parser(cpu)
            let excluded = ['Whitespace', 'NewLine']
            let tokens = Tokenise(this.code).filter(e => excluded.indexOf(e.type) == -1)
            console.log(tokens)
            let res = parser.parse(tokens)
            console.log(res)
            writeInstructions(cpu, res.result, 0)
            var that = this
            console.log(JSON.stringify(cpu.memory))
            that.memory = cpu.memory.filter(function (item) {
                return true
            })
        },
        reset: function () {
            cpu = new KPU(0xffff + 1)
            this.hookCpuEvents(cpu)
            this.memory = new Array(cpu.memory.length);
            this.registers = new Array(cpu.registers.length)
            this.registers.fill(0)
            this.memory.fill(0)
        }
    }
});