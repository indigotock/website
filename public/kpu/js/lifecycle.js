import {
    KPU,
    Register
} from "./kpu.js"
import {
    Parser
} from './parser.js';
import {
    Tokenise
} from "./lexer.js";
import {
    Instruction,
    getOpcode
} from "./instruction.js";

export class KPULifecycle {
    constructor(vueApp) {
        this.cpu = new KPU(0xff + 1)
        this.vueApp = vueApp
        this.isRunning = false
        this.frequency = 1000
        this.reset()

    }

    reset() {
        this.isRunning = false
        this.cpu.reset()
    }

    stop() {
        this.isRunning = false
    }

    load(code) {
        let parser = new Parser(this.cpu)
        let excluded = ['Whitespace', 'NewLine']
        let tokens = Tokenise(code).filter(e => excluded.indexOf(e.type) == -1)
        let res = parser.parse(tokens)
        let position = 0
        res.result.forEach(lexeme => {
            lexeme.write(this.cpu, position, function (a, i, v) {
                Vue.set(a, i, v)
            });
            position += lexeme.length;
        });
    }

    runUntilNop() {
        const HERTZ = this.frequency
        this.isRunning = true
        let executed;
        let interval;

        function tick() {
            if (this.isRunning == false) {
                clearInterval(interval)
                return
            }
            executed = this.step()
            if (executed = null) {
                this.clearRunning()
            }
        }


        interval = setInterval(tick.bind(this), 1 / (HERTZ / 1000))
    }

    clearRunning() {
        this.isRunning = false
    }

    step() {
        var pc = this.cpu.registers[Register.PC]
        var instruction = Instruction.build(this.cpu, pc)
        if (!instruction || instruction.op == getOpcode('NOP')) {
            return null
        }
        console.log(instruction)
        let opc = this.cpu.registers[Register.PC]
        // this.cpu.setRegister(Register.PC, this.cpu.registers[Register.PC] + instruction.length)
        instruction.execute(this.cpu)
        return instruction
    }
}