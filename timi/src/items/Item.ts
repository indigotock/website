import * as uuid from 'uuid'
import IndefiniteArticle from '../indefinite_article'
import { CommandResult } from "../Command";

type ItemAction = (i: Item, other?: Item) => CommandResult

class Item {
    constructor(p: Partial<Item>) {
        for (var key in p) {
            if (p.hasOwnProperty(key)) {
                var value = p[key];
                this[key] = value
            }
        }

        if (!this._identifier)
            this._identifier = uuid.v4()
    }
    /**
     * Unique identifier for this item
     */
    get identifier() {
        return this._identifier
    }
    private readonly _identifier: string
    private _fullName: string
    readonly name: string
    get fullName() {
        return this._fullName || this.name
    }
    set fullName(value: string) {
        this._fullName = value
    }
    get withIndefiniteArticle() {
        return `${this.indefiniteArticle} ${this.name}`
    }
    get indefiniteArticle() {
        return IndefiniteArticle(this.name)
    }
    actions: { [action: string]: ItemAction } = {
        examine: (a, b) => {
            return {
                output: `The `
            }
        }
    }
}

export default Item