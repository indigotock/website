import * as uuid from 'uuid'
import IndefiniteArticle from '../indefinite_article'
import { CommandResult } from "../Command";
import Util from "../Util";
import Room from "../rooms/Room";

export type ItemAction = (i: Item, other?: Item) => CommandResult

export class ItemContainer {
    private items: Item[] = []
    add(t: Item[] | Item) {
        this.items.push()
    }
    find(p: (this: void, value: Item) => boolean): Item | undefined {
        this.forEach(e => {
            if (p(e))
                return e
        })

        return
    }
    forEach(action: (t: Item) => void) {
        this.items.forEach(action)
    }
    has(t: Item) {
        this.forEach(e => {
            if (e === t)
                return true
        })
        return false
    }
    remove(t: Item) {
        let idx = this.items.indexOf(t)
        this.items.splice(idx, 1)
    }
    count() {
        return this.items.length
    }
    array(): Item[] {
        return this.items
    }
    get containedItemsStringList() {
        if (this.count() === 0) return "\nIt is empty."

        let itemnames = []
        this.forEach(e => {
            let n = e.name
            itemnames.push(e.withIndefiniteArticle)
        })
        let listSentence = 'it contains ' + (Util.toTextualList(itemnames) || "nothing")

        return '\n' + Util.toSentenceCase(listSentence) + '.'
    }
}

class Item {
    public static getItemFromDb(name: string) {
        return require(`./db/${name}.ts`).default
    }
    public readonly identifier: string
    aliases: string[] = []
    container: ItemContainer | Room
    readonly containedItems: ItemContainer

    get isContainer() {
        return this.containedItems
    }

    constructor(
        public readonly name: string,
        items: Item[] = [],
        public readonly fullName: string = name) {
        this.identifier = uuid.v4()
        if (items) {
            this.containedItems = new ItemContainer()
            this.containedItems.add(items)
        }
    }

    get withIndefiniteArticle() {
        return `${this.indefiniteArticle} ${this.name}`
    }
    get indefiniteArticle() {
        return IndefiniteArticle(this.name)
    }
    // Default action implementations
    examine(a, b): CommandResult {
        return {
            output: this.isContainer
                ? ''
                : this.containedItems.containedItemsStringList
        }
    }

    actions: { [action: string]: ItemAction } = {}
}

export default Item