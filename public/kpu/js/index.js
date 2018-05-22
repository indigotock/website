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

import {
    KPULifecycle
} from "./lifecycle.js";



function toHex(number = 0, places = 1) {
    let ret = number.toString(16)
    while (ret.length < places)
        ret = "0" + ret
    return ret
}

Vue.filter('toHex', toHex)

function writeInstructions(cpu, lexemes, position = 0) {}

Vue.component('menu-item', {
    template: "#template-menu-item",
    props: ['label', 'iconClass', 'executeEvent', 'disableCondition', 'tooltip'],
    methods: {
        clickHandle: function (ev) {
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
            code: `cmp 1 7`,
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
            lifecycle: new KPULifecycle(this),
            output: '',
            consoleInput: ''
        }
    },
    computed: {
        memory: function () {
            return this.lifecycle.cpu.memory
        },
        registers: function () {
            return this.lifecycle.cpu.registers
        },
        isRunning: function () {
            return this.lifecycle.isRunning
        },
        clockSpeed: {
            get: function () {
                return this.lifecycle.frequency
            },
            set: function (value) {
                this.lifecycle.frequency = value
            }
        }
    },
    mounted: function () {},
    methods: {
        hookCpuEvents: function (cpu) {
            var that = this
        },
        addOutput(value) {
            this.output += value
        },
        getRegisterName: function (ind) {
            return Register[ind]
        },
        submitConsole: function (ev) {
            ev.preventDefault()
            let input = this.consoleInput.trim()
            this.consoleInput = ''
            if (!input)
                return

            this.addOutput("#> " + input + '\n')

            let ele = document.querySelector('.console__output')
            ele.scrollTop = ele.scrollHeight;
        },
        receiveActionEvent: function (action) {
            if (['reset', 'build'].includes(action)) {
                this.lifecycle.reset()
            }
            if (action == 'build') {
                this.lifecycle.load(this.code)
            } else if (action == 'run') {
                this.lifecycle.runUntilNop()
            } else if (action == 'stop') {
                this.lifecycle.stop()
            } else if (action == 'step') {
                this.lifecycle.step()
            }
        }
    }
});
window.lifecycle = new KPULifecycle(kpuApp)