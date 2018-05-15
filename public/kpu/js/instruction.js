import {
    Register
} from "./kpu.js";

//todo refactor old enums
export var OperandValueType;
(function (OperandValueType) {
    OperandValueType[OperandValueType["LValue"] = 0] = "LValue";
    OperandValueType[OperandValueType["RValue"] = 1] = "RValue";
})(OperandValueType || (OperandValueType = {}));
export class Operand {
    constructor(cpu, type, rawValue, operandIndex) {
        this.cpu = cpu;
        this.type = type;
        this.rawValue = rawValue;
        this.operandIndex = operandIndex;
    }
    get isInline() {
        return this.rawValue <= (this.operandIndex == 0 ? 0b111 : 0b11);
    }
}
export class LiteralOperand extends Operand {
    constructor(cpu, value, index) {
        super(cpu, "Literal", value, index);
        this.isLValue = false;
    }
    setValue() {
        throw new Error("Literal value is not an LValue");
    }
    compute() {
        return this.rawValue;
    }
    get isLiteral() {
        return true;
    }
}
export class RegisterOperand extends Operand {
    constructor(cpu, value, index) {
        super(cpu, "RegisterReference", value, index);
        this.isLValue = true;
    }
    setValue(newValue) {
        this.cpu.registers[this.rawValue] = Math.floor(newValue);
    }
    compute() {
        return this.cpu.registers[this.rawValue];
    }
    get isLiteral() {
        return false;
    }
}
export class Instruction {
    constructor(op, operands) {
        this.op = op;
        this.operands = operands;
    }
    get length() {
        if (!this.operands)
            return 1;
        return 1 + this.operands.filter(e => !e.isInline).length;
    }
    execute(cpu) {
        this.op.execute(cpu, this.operands);
    }
    static build(cpu, index) {
        var w = cpu.memory[index];
        var opc = getOpcodeFromCode(w & 0b11111);
        var numOperands = 0;
        if ((w & 0b11100000) > 0) {
            numOperands++;
        }
        if ((w & 0b11100000000) > 0) {
            numOperands++;
        }
        var ops = [];
        var skip = 0;
        for (var i = 0; i < numOperands; i++) {
            let isInline = w & (i == 0 ? 128 : 1024);
            let isLiteral = w & (i == 0 ? 32 : 256);
            skip += (!isInline ? 1 : 0);
            var val = 0;
            if (isInline) {
                val = (w & (i == 0 ? 14336 : 49152)) >>
                    (i == 0 ? 11 : 14);
            } else {
                val = cpu.memory[index + skip];
            }
            var opa;
            if (isLiteral) {
                opa = new LiteralOperand(cpu, val, i);
            } else {
                opa = new RegisterOperand(cpu, val, i);
            }
            ops.push(opa);
        }
        return new Instruction(opc, ops);
    }
    toString() {
        return this.op.mnemonic + this.operands ? this.operands.map(e => e.toString()).join(' ') : '';
    }
    write(cpu, index, setFunction = function (array, index, value) {
        array[index] = value
    }) {
        setFunction(cpu.memory, index, this.op.code)
        var skip = 0;
        if (this.operands) {
            this.operands.forEach((e, i) => {
                var descriptor = 0b000;
                descriptor |= (e.isInline ? 0b100 : 0);
                descriptor |= (e.isLiteral ? 0b001 : 0);
                descriptor <<= i == 0 ? 5 : 8;
                setFunction(cpu.memory, index, cpu.memory[index] |= descriptor)
                skip += (!e.isInline ? 1 : 0);
                if (e.isInline) {
                    var inv = e.rawValue << (i == 0 ? 11 : 14);
                    setFunction(cpu.memory, index, cpu.memory[index] | inv)
                } else {
                    setFunction(cpu.memory, index + skip, e.rawValue)
                }
            });
        }
        return 1 + skip;
    }
}

function arithematicOp(mnemonic, op) {
    return {
        mnemonic: mnemonic,
        numOperands: 2,
        validateOperands: (operands) => {
            return operands[0].isLValue ?
                null :
                `First operand cannot be of type ${operands[0].type}`;
        },
        execute: (cpu, ops) => {
            var left = ops[0].compute();
            var right = ops[1].compute();
            ops[0].setValue(op(left, right));
        }
    };
}
let Opcodes = [{
        mnemonic: "NOP",
        numOperands: 0,
        validateOperands: (operands) => {
            return null;
        },
        execute: (cpu, ops) => {}
    },
    {
        mnemonic: "PUSH",
        numOperands: 1,
        validateOperands: (operands) => {
            return null;
        },
        execute: (cpu, ops) => {
            var sp = cpu.registers[Register.SP]++;
            cpu.memory[sp] = ops[0].compute();
        }
    },
    {
        mnemonic: "POP",
        numOperands: 1,
        validateOperands: (operands) => {
            return operands[0].isLValue ?
                null :
                `First operand cannot be of type ${operands[0].type}`;
        },
        execute: (cpu, ops) => {
            var sp = --cpu.registers[Register.SP];
            var val = cpu.memory[sp];
            ops[0].setValue(val);
        }
    },
    {
        mnemonic: "MOV",
        numOperands: 2,
        validateOperands: (operands) => {
            return operands[0].isLValue ?
                null :
                `First operand cannot be of type ${operands[0].type}`;
        },
        execute: (cpu, ops) => {
            ops[0].setValue(ops[1].compute());
        }
    },
    arithematicOp("ADD", (a, b) => a + b),
    arithematicOp("MUL", (a, b) => a * b),
    arithematicOp("SUB", (a, b) => a - b),
    arithematicOp("DIV", (a, b) => a / b),
    arithematicOp("MOD", (a, b) => a % b),
    arithematicOp("SHL", (a, b) => a << b),
    arithematicOp("SHR", (a, b) => a >> b),
];
Opcodes.forEach((e, i) => {
    e.code = i;
});
export function getOpcode(mnemonic) {
    return (Opcodes.find(e => e.mnemonic == mnemonic) || Opcodes[0]);
}
export function getOpcodeFromCode(code) {
    return Opcodes.find(e => e.code == code) || Opcodes[0];
}
//# sourceMappingURL=instruction.js.map