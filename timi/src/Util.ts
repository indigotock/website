module Util {
    export function randomFrom<T>(src: T[]): T {
        return src[Math.floor(Math.random() * src.length)]
    }

    export function isStringEmpty(input: string) {
        if (typeof input === 'undefined' || input == null) return true;
        return input.trim().length < 1;
    }

    export function toSentenceCase(input: string): string {
        var rg = /(^\w{1}|\.\s*\w{1})/gi;
        return input.replace(rg, function (char) {
            return char.toUpperCase();
        });
    }

    export function toTextualList(input: string[]): string {
        console.log('list size is', input.length)
        if (input.length === 0) return
        if (input.length === 1) return input[0]

        var last = input.slice().pop();
        return input.slice(0, -1).join(', ') + ', and ' + last;
    }

    /**
     * Converts input text to a series of HTML paragraph elements, split at newline characters
     * @param input The plain text to convert to paragraphs
     */
    export function toParagraphs(input: string): string {
        return '<p>' + (input.trim() || '').split(/[\r\n]+/gm).join('</p><p>') + '</p>'
    }
}

export default Util;