import {
    KPU,
    Register
} from "./js/kpu.mjs";
import {
    getOpcode,
    Instruction
} from "./js/instruction.mjs"
import {
    Parser
} from "./js/parser.mjs";
import {
    Tokenise
} from "./js/lexer.mjs";

import {
    KPULifecycle
} from "./js/lifecycle.mjs";
import * as Store from "./js/store.mjs";


window.lifecycle = new KPULifecycle(1000)



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
            version: [1, 2],
            code: `add a 1 add a 1 mov pc 0`,
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
                disableCondition: () => {
                    return this.isRunning
                },
                tooltip: "Executes the next instruction"
            }, {
                label: "Reset",
                iconClass: "undo",
                executeEvent: "reset",
                tooltip: "Resets the KPU to an empty state"
            }],
            output: '',
            consoleInput: '',
            // snapshot: {
            //     memory: [],
            //     registers: []
            // },
            memory: [],
            registers: [],
            isRunning:false
        }
    },
    computed: {
        // memory: function () {
        //     return this.snapshot.memory
        // },
        // registers: function () {
        //     return this.snapshot.registers
        // },
        clockSpeed: {
            get: function () {
                return lifecycle.hertz
            },
            set: function (value) {
                console.log(value,lifecycle.hertz)
                lifecycle.hertz = value
                console.log(value,lifecycle.hertz, lifecycle._hertz)
            }
        }
    },
    mounted: function () {
        let animTick = () => {
            let snapshot = lifecycle.getSnapshot()
            for (let index = 0; index < snapshot.memory.length; index++) {
                const element = snapshot.memory[index];
                Vue.set(kpuApp.memory, index, snapshot.memory[index])
            }
            for (let index = 0; index < snapshot.registers.length; index++) {
                const element = snapshot.registers[index];
                Vue.set(kpuApp.registers, index, snapshot.registers[index])
            }

            requestAnimationFrame(animTick)
        }
        requestAnimationFrame(animTick)
        
    },
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
                lifecycle.stop()
                lifecycle.reset()
            }
            if(['build','run','stop','step']){
                this.isRunning = false
            }
            if (action == 'build') {
                lifecycle.stop()
                lifecycle.load(kpuApp.code)
            } else if (action == 'run') {
                lifecycle.stop()
                this.isRunning = true
                lifecycle.runUntilNop()
            } else if (action == 'stop') {
                lifecycle.stop()
            } else if (action == 'step') {
                lifecycle.step()
            }
        }
    }
});