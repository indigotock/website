export class Token {
    constructor(type, value, line, column, position, raw) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
        this.position = position;
        this.raw = raw;
    }
    get length() {
        return this.raw.length;
    }
}
var regexps = {
    whitespace: /^\s+\b/,
    newline: /^\r?\n/,
    restOfLine: /^.*\r?\n/,
    decimalInt: /^[0-9]+\b/,
    hexadecimalInt: /^0X[0-9a-fA-F]+\b/,
    binaryInt: /^0B[01]+\b/,
    identifier: /^[A-Z_]+\b/,
    error: /^.+\b/,
};
const parsers = [
    function newLine(next, restOfLine, context) {
        var m = regexps.newline.exec(next);
        if (m && m[0]) {
            var ret = new Token('NewLine', m[0], context.line, context.column, context.position, m[0]);
            context.line++;
            context.column = 0;
            context.position += ret.length;
            return ret;
        }
        return null;
    },
    function whitespace(next, restOfLine, context) {
        var m = regexps.whitespace.exec(next);
        if (m && m[0]) {
            var ret = new Token('Whitespace', null, context.line, context.column, context.position, m[0]);
            context.column += ret.length;
            context.position += ret.length;
            return ret;
        }
        return null;
    },
    function decimalInteger(next, restOfLine, context) {
        var m = regexps.decimalInt.exec(next);
        if (m && m[0]) {
            var ret = new Token('IntegerLiteral', parseInt(m[0], 10), context.line, context.column, context.position, m[0]);
            context.column += ret.length;
            context.position += ret.length;
            return ret;
        }
        return null;
    },
    function hexadecimalInteger(next, restOfLine, context) {
        var m = regexps.hexadecimalInt.exec(next);
        if (m && m[0]) {
            var ret = new Token('IntegerLiteral', parseInt(m[0].replace('0X', ''), 16), context.line, context.column, context.position, m[0]);
            context.column += ret.length;
            context.position += ret.length;
            return ret;
        }
        return null;
    },
    function binaryInteger(next, restOfLine, context) {
        var m = regexps.binaryInt.exec(next);
        if (m && m[0]) {
            var ret = new Token('IntegerLiteral', parseInt(m[0].replace('0B', ''), 2), context.line, context.column, context.position, m[0]);
            context.column += ret.length;
            context.position += ret.length;
            return ret;
        }
        return null;
    },
    function identifier(next, restOfLine, context) {
        var m = regexps.identifier.exec(next);
        if (m && m[0]) {
            var ret = new Token('Identifier', m[0], context.line, context.column, context.position, m[0]);
            context.column += ret.length;
            context.position += ret.length;
            return ret;
        }
        return null;
    },
    function error(next, restOfLine, context) {
        var m = regexps.error.exec(next);
        if (m && m[0]) {
            var ret = new Token('Error', m[0], context.line, context.column, context.position, m[0]);
            context.column += ret.length;
            context.position += ret.length;
            return ret;
        }
        return null;
    }
];
export function getParser(name) {
    var names = parsers.filter(e => e['name'] == name);
    return names[0];
}
export function Tokenise(code) {
    code = code.toUpperCase();
    let results = [];
    var context = {
        column: 0,
        line: 0,
        position: 0,
        type: 'Unknown',
        value: null
    };
    while (context.position < code.length) {
        let next = code.substr(context.position);
        var lineregex = regexps.restOfLine.exec(next);
        let restOfLine = "";
        if (lineregex && lineregex[0])
            restOfLine = lineregex[0];
        let parseResult;
        for (let i = 0; i < parsers.length; i++) {
            let p = parsers[i];
            if (!p)
                continue;
            var res = p(next, restOfLine, context);
            if (res) {
                parseResult = res;
                break;
            }
        }
        if (!parseResult) {
            context.position++;
            continue;
        } else {}
        if (parseResult && parseResult.value != undefined) {
            results.push(parseResult);
        } else {}
    }
    return results;
}