import {
    Instruction,
    getOpcode
} from "./instruction.js";
export var Register;
(function (Register) {
    Register[Register["PC"] = 0] = "PC";
    Register[Register["SP"] = 1] = "SP";
    Register[Register["SR"] = 2] = "SR";
    Register[Register["A"] = 3] = "A";
    Register[Register["B"] = 4] = "B";
})(Register || (Register = {}));


export class KPU {
    constructor(ramSize, wordSize = 16) {
        this.ramSize = ramSize;
        this.wordSize = wordSize;
        this.memory = new Array(ramSize).fill(0);
        this.registers = new Array(Object.keys(Register).length / 2).fill(0);
        this.registers[Register.PC] = 0;
        this.memoryCallbacks = []
        this.registerCallbacks = []
    }
    setRegister(reg, newvalue) {
        this.updateRegisterCallbacks(reg, newvalue, this.registers[Register[reg]])
        this.registers[reg] = newvalue
    }
    setMemory(index, newvalue) {
        this.updateMemoryCallbacks(index, newvalue, this.memory[index])
        this.memory[index] = newvalue
    }
    runUntilNOP(verbosely) {
        while (true) {
            var pc = this.registers[Register.PC];
            var instruction = Instruction.build(this, pc);
            if (!instruction || instruction.op == getOpcode('NOP'))
                break;
            this.registers[Register.PC] += instruction.length;
            instruction.execute(this);
            if (verbosely) {
                this.printOut();
            }
        }
    }
    tick() {
        var pc = this.registers[Register.PC];
        var instruction = Instruction.build(this, pc);
        this.registers[Register.PC] += instruction.length;
        instruction.execute(this);
    }
    getRegister(name) {
        return Register[name];
    }
    get maxValue() {
        return Math.pow(2, this.wordSize) - 1;
    }
    printOut() {
        console.log(this.memory);
        console.log(this.registers.map((e, i) => Register[i] + ": " + e));
    }
    updateRegisterCallbacks(reg, newvalue, oldvalue) {
        this.registerCallbacks.forEach(cb => cb.bind(this)(reg, newvalue, oldvalue))
    }
    onUpdateRegister(callback) {
        this.registerCallbacks.push(callback)
    }
    updateMemoryCallbacks(index, newvalue, oldvalue) {
        this.memoryCallbacks.forEach(cb => cb.bind(this)(index, newvalue, oldvalue))
    }
    onUpdateMemory(callback) {
        this.memoryCallbacks.push(callback)
    }
}
//# sourceMappingURL=kpu.js.map