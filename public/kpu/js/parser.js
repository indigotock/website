import {
    Instruction,
    getOpcode,
    LiteralOperand,
    RegisterOperand
} from "./instruction.js";
import {
    DataValue
} from "./dataValue.js";
var regexps = {
    whitespace: /^\s+\b/,
    newline: /^\r?\n/,
    restOfLine: /^.*\r?\n/,
    decimalInt: /^[1-9][0-9]*\b/,
    hexadecimalInt: /^0x[0-9a-fA-F]+\b/,
    binaryInt: /^0b[01]+\b/,
    identifier: /^[A-Z_]+\b/,
    error: /^.+\b/,
};
export class Parser {
    constructor(cpu) {
        this.cpu = cpu;
        this.offset = 0;
    }
    parseAsRegisterOperand(context, ind) {
        var token = context.tokens[context.position + this.offset];
        if ("Identifier" == token.type.toString()) {
            var reg = this.cpu.getRegister(token.value);
            if (reg != null) {
                this.offset += 1;
                return new RegisterOperand(this.cpu, reg, ind);
            }
            throw {
                token: token,
                name: "Unknown register",
            };
        }
    }
    parseAsOperand(context, ind) {
        var token = context.tokens[context.position + this.offset];
        var pos = context.position;
        if (!token)
            throw {
                token: token,
                name: "Unexpected end of file",
            };
        switch (token.type) {
            case "IntegerLiteral":
                return new LiteralOperand(this.cpu, this.parseAsData(context).value, ind);
            case "Identifier":
                return this.parseAsRegisterOperand(context, ind);
        }
        return null;
    }
    parseAsInstruction(context) {
        var token = context.tokens[context.position + this.offset];
        if ("Identifier" == token.type.toString()) {
            var opcode = getOpcode(token.value);
            this.offset += 1;
            if (opcode) {
                var operands = opcode.numOperands == 0 ? null : [];
                for (var i = 0; i < opcode.numOperands; i++) {
                    try {
                        try {
                            var operand = this.parseAsOperand(context, i);
                        } catch (err) {
                            throw ({
                                token: token,
                                name: "Error constructing instruction for " + opcode.mnemonic,
                                inner: err
                            });
                        }
                        if (operand)
                            operands.push(operand);
                    } catch (err) {
                        throw ({
                            token: token,
                            name: "Invalid operand",
                            inner: err
                        });
                    }
                }
                var operandValidationResults = opcode.validateOperands(operands);
                if (operandValidationResults) {
                    throw ({
                        token: token,
                        name: `Could not validate operands for opcode ${opcode.mnemonic}`,
                        inner: operandValidationResults
                    });
                }
                return new Instruction(opcode, operands);
            }
            throw {
                token: token,
                name: "Unknown opcode",
                critical: true
            };
        }
    }
    parseAsData(context) {
        var token = context.tokens[context.position + this.offset];
        switch (token.type.toString()) {
            case "IntegerLiteral":
                if (token.value > this.cpu.maxValue) {
                    throw ({
                        token: token,
                        name: "Literal integer too large",
                    });
                } else if (token.value < 0) {
                    throw ({
                        token: token,
                        name: "Literal integer negative",
                        critical: false
                    });
                }
                this.offset += 1;
                return new DataValue(token.value);
        }
        return null;
    }
    parseAsError(context) {
        var token = context.tokens[context.position + this.offset];
        this.offset += 1;
        throw ({
            token: token,
            name: "Unknown token",
        });
    }
    parse(tokens) {
        var context = {
            tokens: tokens,
            position: 0,
            result: [],
            errors: []
        };
        while (context.position < tokens.length) {
            try {
                let parseResult = this.parseAsInstruction(context);
                if (!parseResult)
                    parseResult = this.parseAsData(context);
                if (!parseResult)
                    parseResult = this.parseAsError(context);
                if (parseResult) {
                    context.result.push(parseResult);
                }
            } catch (exc) {
                context.errors.push(exc);
            }
            context.position += Math.max(1, this.offset);
            this.offset = 0;
        }
        return context;
    }
}