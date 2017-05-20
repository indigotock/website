import * as uuid from 'uuid'
import IndefiniteArticle from '../indefinite_article'
import { CommandResult } from "../Command";
import Util from "../Util";
import Room from "../rooms/Room";

type ItemAction = (i: Item, other?: Item) => CommandResult


export abstract class IItemContainer {
    abstract add(t: Item[] | Item)
    abstract find(p: (this: void, value: Item) => boolean): Item | undefined
    abstract forEach(action: (t: Item) => void)
    abstract has(t: Item)
    abstract remove(t: Item)
    abstract count()
    abstract array(): Item[]


    get containedItemsStringList() {
        if (this.count() === 0) return "\nIt is empty."

        let itemnames = []
        this.forEach(e => {
            console.log('x')
            let n = e.name
            itemnames.push(`${IndefiniteArticle(e.name)} ${e.name}`)
        })
        let listSentence = 'it contains ' + (Util.toTextualList(itemnames) || "nothing")

        return '\n' + Util.toSentenceCase(listSentence) + '.'
    }

}

export class ItemContainer extends IItemContainer {
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
}

class Item {
    public readonly identifier: string
    aliases: string[] = []
    container: IItemContainer | Room
    readonly containedItems: ItemContainer

    get isContainer() {
        return this.containedItems
    }

    constructor(
        public readonly name: string,
        isContainer: boolean = false,
        public readonly fullName: string = name) {
        this.identifier = uuid.v4()
        if (isContainer) {
            this.containedItems = new ItemContainer()
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