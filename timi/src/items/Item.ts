import * as uuid from 'uuid'
import IndefiniteArticle from '../indefinite_article'
import { CommandResult } from "../Command";
import Util from "../Util";
import Room from "../rooms/Room";
import Way from "../Way";
import { Game } from "../Game";

export type ItemAction = (this: GameObject, other?: GameObject, game?: Game) => CommandResult

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
        if (this.count() === 0) return "nothing"

        let itemnames = []
        this.forEach(e => {
            let n = e.name
            itemnames.push(e.textualListEntry)
        })
        let listSentence = Util.toTextualList(itemnames)

        return listSentence
    }
}

class GameObject {
    brief: string
    public static getItemFromDb(name: string) {
        return require(`./db/${name}.ts`).default
    }
    public readonly identifier: string
    aliases: string[] = []
    container: GameObject
    takeable = false
    readonly containedItems: ItemContainer
    isOpen = false

    get isContainer() {
        return !!this.containedItems
    }

    consume() {
        this.container.containedItems.remove(this)
        this.container = null
    }

    moveToContainer(obj: GameObject) {
        this.container.containedItems.remove(this)
        this.container = obj
        this.container.containedItems.add(this)
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
        return `${this.indefiniteArticle} ${this.fullName}`
    }
    get indefiniteArticle() {
        return IndefiniteArticle(this.fullName)
    }
    examine(): CommandResult {
        let bc = this.brief ? this.brief + '\n' : ''
        if (this.isContainer && this.isOpen)
            return { output: bc + 'You can see ' + this.containedItems.containedItemsStringList + '.' }
        else
            return { output: bc }
    }
    get textualListEntry() {
        return this.withIndefiniteArticle
    }

    open(o): CommandResult {
        if (this.isOpen)
            return { output: 'It is already open.', failure: true }
        this.isOpen = true
        return { output: 'You open the ' + this.name + '.' }
    }

    close(o) {
        if (!this.isOpen)
            return { output: 'It is already closed.', failure: true }
        this.isOpen = false
        return { output: 'You close the ' + this.name + '.' }
    }

    actions: { [action: string]: ItemAction } = {}
}

export abstract class NavigationObject extends GameObject {
    abstract destinationDesc: string;
    abstract way: Way
    abstract targetRoomName: string
    get textualListEntry() {
        return this.withIndefiniteArticle + ' to the ' + this.way.toString()
            + ' leading to ' + this.destinationDesc
    }
}

export default GameObject