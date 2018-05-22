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
    whitespace: /^\s+/,
    newline: /^\r?\n/,
    restOfLine: /^.*\r?\n/,
    decimalInt: /^[0-9]+/,
    hexadecimalInt: /^0X[0-9a-fA-F]+/,
    binaryInt: /^0B[01]+/,
    identifier: /^[A-Z_]+/,
    error: /^.+/,
    indirectStart: /^\[/,
    indirectEnd: /^\]/
};

function next(context) {
    return context.code.substr(context.position)
}
const parsers = [
    function newLine(context) {
        var m = regexps.newline.exec(next(context));
        if (m && m[0]) {
            var ret = new Token('NewLine', m[0], context.line, context.column, context.position, m[0]);
            context.line++;
            context.column = 0;
            context.position += ret.length;
            return ret;
        }
        return null;
    },
    function whitespace(context) {
        var m = regexps.whitespace.exec(next(context));
        if (m && m[0]) {
            var ret = new Token('Whitespace', null, context.line, context.column, context.position, m[0]);
            context.column += ret.length;
            context.position += ret.length;
            return ret;
        }
        return null;
    },
    function decimalInteger(context) {
        var m = regexps.decimalInt.exec(next(context));
        if (m && m[0]) {
            var ret = new Token('IntegerLiteral', parseInt(m[0], 10), context.line, context.column, context.position, m[0]);
            context.column += ret.length;
            context.position += ret.length;
            return ret;
        }
        return null;
    },
    function hexadecimalInteger(context) {
        var m = regexps.hexadecimalInt.exec(next(context));
        if (m && m[0]) {
            var ret = new Token('IntegerLiteral', parseInt(m[0].replace('0X', ''), 16), context.line, context.column, context.position, m[0]);
            context.column += ret.length;
            context.position += ret.length;
            return ret;
        }
        return null;
    },
    function binaryInteger(context) {
        var m = regexps.binaryInt.exec(next(context));
        if (m && m[0]) {
            var ret = new Token('IntegerLiteral', parseInt(m[0].replace('0B', ''), 2), context.line, context.column, context.position, m[0]);
            context.column += ret.length;
            context.position += ret.length;
            return ret;
        }
        return null;
    },
    function identifier(context) {
        var m = regexps.identifier.exec(next(context));
        if (m && m[0]) {
            var ret = new Token('Identifier', m[0], context.line, context.column, context.position, m[0]);
            context.column += ret.length;
            context.position += ret.length;
            return ret;
        }
        return null;
    },
    function indirectStart(context) {
        var m = regexps.indirectStart.exec(next(context));
        if (m && m[0]) {
            var ret = new Token('IndirectStart', m[0], context.line, context.column, context.position, m[0]);
            context.column += ret.length;
            context.position += ret.length;
            return ret;
        }
        return null;
    },
    function indirectEnd(context) {
        var m = regexps.indirectEnd.exec(next(context));
        if (m && m[0]) {
            var ret = new Token('IndirectEnd', m[0], context.line, context.column, context.position, m[0]);
            context.column += ret.length;
            context.position += ret.length;
            return ret;
        }
        return null;
    },
    // function indirect(context) {
    //     var m = regexps.indirectStart.exec(next(context));
    //     if (m && m[0]) {
    //         let ocol = context.column;
    //         let opos = context.position;
    //         context.column += m[0].length;
    //         context.position += m[0].length;
    //         var parseResult = tokeniseItem(context)
    //         if (!parseResult) {
    //             return null
    //         }
    //         let nxt = next(context)
    //         var m2 = regexps.indirectEnd.exec(nxt);
    //         if (m2 && m2[0]) {
    //             var ret = new Token('Indirect', parseResult, context.line, ocol, opos, m[0] + parseResult.raw + m2[0]);
    //             context.column += m2[0].length;
    //             context.position += m2[0].length;
    //             return ret;
    //         }
    //     }
    //     return null;
    // },
    function error(context) {
        var m = regexps.error.exec(next(context));
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


function tokeniseItem(context) {
    let parseResult;
    for (let i = 0; i < parsers.length; i++) {
        let p = parsers[i];
        if (!p)
            continue;
        var res = p(context);
        if (res) {
            parseResult = res;
            break;
        }
    }
    return parseResult
}
export function Tokenise(code) {
    code = code.toUpperCase();
    let results = [];
    var context = {
        code: code,
        column: 0,
        line: 0,
        position: 0,
        type: 'Unknown',
        value: null
    };
    while (context.position < code.length) {
        var parseResult = tokeniseItem(context)
        if (!parseResult) {
            context.position++;
            continue;
        } else {}
        if (parseResult && parseResult.value != undefined) {
            results.push(parseResult);
        } else {}
    }
    console.log(results)
    return results;
}