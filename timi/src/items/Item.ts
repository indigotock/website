import * as uuid from 'uuid'
import IndefiniteArticle from '../indefinite_article'
import { CommandResult } from "../Command";
import Util from "../Util";
import Room from "../rooms/Room";

export type ItemAction = (this: GameObject, other?: GameObject) => CommandResult

export class ItemContainer {
    private items: GameObject[] = []
    add(item: GameObject[] | GameObject) {
        if (Array.isArray(item))
            item.forEach(e => this.add(e))
        else
            this.items.unshift(item)
    }
    find(p: (this: void, value: GameObject) => boolean): GameObject | undefined {
        let ret = undefined
        this.forEach(e => {
            if (p(e))
                ret = e
        })

        return ret
    }
    forEach(action: (t: GameObject) => void) {
        this.items.forEach(action)
    }
    has(t: GameObject) {
        this.forEach(e => {
            if (e === t)
                return true
        })
        return false
    }
    remove(t: GameObject) {
        let idx = this.items.indexOf(t)
        this.items.splice(idx, 1)
    }
    count() {
        return this.items.length
    }
    array(): GameObject[] {
        return this.items
    }
    get containedItemsStringList() {
        if (this.count() === 0) return "It is empty."

        let itemnames = []
        this.forEach(e => {
            let n = e.name
            itemnames.push(e.withIndefiniteArticle)
        })
        let listSentence = (Util.toTextualList(itemnames) || "nothing")

        return listSentence
    }
}

class GameObject {
    public static getItemFromDb(name: string) {
        return require(`./db/${name}.ts`).default
    }
    public readonly identifier: string
    aliases: string[] = []
    container: ItemContainer | Room
    takeable = false
    readonly containedItems: ItemContainer

    get isContainer() {
        return this.containedItems
    }

    constructor(
        public readonly name: string,
        items: GameObject[] = undefined,
        public readonly fullName: string = name,
        _identifier: string = undefined) {
        this.identifier = _identifier || uuid.v4()
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
    examine(): CommandResult {
        if (this.isContainer)
            return { output: 'It contains ' + this.containedItems.containedItemsStringList + '.' }
        else
            return { output: this.withIndefiniteArticle + '.' }
    }

    actions: { [action: string]: ItemAction } = {}
}

export default GameObject