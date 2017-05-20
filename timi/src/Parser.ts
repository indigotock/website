import { Game, CommandFailReason } from "./Game";

let Grammar = require("./Grammar.ne")

import * as Nearley from 'nearley'
import Way from "./Way";

/*
VERB_NAVIGATE -> "go" | "walk"
VERB_TAKE -> "take"|"collect"|"pick up"
VERB_SINGLE ->  "move" | "look at" | "touch" | "open" | "close"
VERB_SIMPLE ->  "help"|"look"
VERB_USE -> "use"
*/



function isObject(obj) {
    return obj === Object(obj);
}



export type Verb = "go" | "take" | "move" | "look" | "touch" | "help" | "examine" | "use" | "open" | "close" | "examine" | "place"

export module Parser {
    export class ParsedCommand {
        verb: Verb
        // preposition?: string
        obj?: ParsedObject
        subject?: ParsedObject
        way?: string
    }
    export class ParsedObject {
        obj: string
        container: string

        toString() {
            return `${this.container}:${this.obj}`
        }
    }
    function parseObject(parsed: any): ParsedObject {
        if (!parsed)
            return;
        let ret = new ParsedObject()
        ret.obj = parsed['obj']
        ret.container = parsed['container']
        return ret
    }

    function parseCommand(parsed: any): ParsedCommand {
        let ret = new ParsedCommand()
        ret.verb = parsed['verb'] || null
        ret.obj = parseObject(parsed['obj'])
        ret.subject = parseObject(parsed['subject'])
        ret.way = parsed['direction']
        return ret
    }
    export function parse(input: string): ParsedCommand {
        let parser = new Nearley.Parser(Grammar.ParserRules, Grammar.ParserStart)
        let result
        try {
            parser.feed(input)
            result = parser.results[0][0]

        } catch (e) {
            result = { verb: null }
        }
        return parseCommand(result)

    }
}

export default Parser